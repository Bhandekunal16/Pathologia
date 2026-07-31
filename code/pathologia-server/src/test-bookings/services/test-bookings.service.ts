import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditService } from '../../audit/services/audit.service';
import {
  compressForStorage,
  decompressFromStorage,
} from '../../common/utils/compress-storage.util';
import { getRequestHostname } from '../../common/utils/get-request-hostname.util';
import {
  generateOtp,
  getOtpExpiryDate,
  hashOtp,
  OTP_EXPIRY_MINUTES_VALUE,
} from '../../common/utils/otp.util';
import { EmailService } from '../../email/services/email.service';
import { PathologyTestRepository } from '../../pathology-tests/repositories/pathology-test.repository';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import {
  BLOOD_TEST_STATUS_ORDER,
  BloodTestTrackingStatus,
} from '../../shared/enums/blood-test-tracking-status.enum';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { UserRepository } from '../../users/repositories/user.repository';
import { CreateTestBookingDto } from '../dto/create-test-booking.dto';
import { SendBookingOtpResponseDto } from '../dto/send-booking-otp-response.dto';
import { TestBookingResponseDto } from '../dto/test-booking-response.dto';
import { UpdateTestBookingDto } from '../dto/update-test-booking.dto';
import { UpdateBloodTestTrackingDto } from '../dto/update-blood-test-tracking.dto';
import { UploadBloodTestReportDto } from '../dto/upload-blood-test-report.dto';
import { BookingOtpRepository } from '../repositories/booking-otp.repository';
import { TestBookingRepository } from '../repositories/test-booking.repository';
import { TestBookingListFilter } from '../repositories/test-booking.repository.interface';
import { BookedTestItem } from '../schemas/booked-test-item.schema';
import { TestBookingDocument } from '../schemas/test-booking.schema';

@Injectable()
export class TestBookingsService {
  constructor(
    private readonly testBookingRepository: TestBookingRepository,
    private readonly bookingOtpRepository: BookingOtpRepository,
    private readonly pathologyTestRepository: PathologyTestRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async sendBookingOtp(
    patientEmail: string,
    pathologistId: string,
    request?: Request,
  ): Promise<SendBookingOtpResponseDto> {
    const normalizedEmail = patientEmail.toLowerCase().trim();
    const patient = await this.userRepository.findByEmail(normalizedEmail);

    if (!patient) {
      throw new NotFoundException('No registered user found with this email');
    }

    if (patient.role !== Role.USER) {
      throw new BadRequestException('Bookings on behalf are only allowed for user accounts');
    }

    if (patient.status !== Status.ACTIVE) {
      throw new BadRequestException('Patient account is not active');
    }

    const pathologist = await this.userRepository.findById(pathologistId);
    if (!pathologist) {
      throw new NotFoundException('Pathologist not found');
    }

    const otp = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await this.bookingOtpRepository.upsertForPatient({
      patientEmail: normalizedEmail,
      patientUserId: patient._id.toString(),
      pathologistId,
      otpHash: hashOtp(otp),
      expiresAt,
    });

    void this.emailService.sendBookingOtpEmail({
      email: normalizedEmail,
      patientName: patient.fullName,
      pathologistName: pathologist.fullName,
      otp,
      expiresAt,
    });

    await this.auditService.log({
      userId: pathologistId,
      action: AuditAction.TEST_BOOKING_OTP_SEND,
      entity: 'BookingOtp',
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/test-bookings/otp/send',
          body: { patientEmail: normalizedEmail },
        },
        response: {
          success: true,
          data: { patientEmail: normalizedEmail, expiresAt },
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return {
      patientEmail: normalizedEmail,
      patientName: patient.fullName,
      expiresAt,
      message: `OTP sent to ${normalizedEmail}. Valid for ${OTP_EXPIRY_MINUTES_VALUE} minutes.`,
    };
  }

  async createBooking(
    dto: CreateTestBookingDto,
    currentUserId: string,
    currentUserRole: Role,
    request?: Request,
  ): Promise<TestBookingResponseDto> {
    const scheduledAt = new Date(dto.scheduledAt);
    this.validateScheduledAt(scheduledAt);

    const tests = await this.resolveActiveTests(dto.testIds);
    const totalAmount = tests.reduce((sum, test) => sum + (test.rate ?? 0), 0);

    let patientUserId: string;
    let bookedByUserId = currentUserId;

    if (currentUserRole === Role.PATHOLOGIST) {
      if (!dto.patientEmail || !dto.otp) {
        throw new BadRequestException(
          'Patient email and OTP are required when booking on behalf of a user',
        );
      }
      patientUserId = await this.verifyPatientOtp(
        dto.patientEmail,
        dto.otp,
        currentUserId,
      );
    } else if (currentUserRole === Role.USER) {
      patientUserId = currentUserId;
    } else {
      throw new ForbiddenException('Only users and pathologists can create test bookings');
    }

    const booking = await this.testBookingRepository.create({
      patientUserId,
      bookedByUserId,
      tests: tests.map((test) => ({
        testId: test._id.toString(),
        name: test.name,
        code: test.code,
        category: test.category,
        rate: test.rate ?? 0,
      })),
      scheduledAt,
      totalAmount,
      notes: dto.notes,
    });

    const [patient, bookedBy] = await Promise.all([
      this.userRepository.findById(patientUserId),
      this.userRepository.findById(bookedByUserId),
    ]);

    void this.emailService.sendBookingConfirmationEmail({
      email: patient?.email ?? '',
      patientName: patient?.fullName ?? 'Patient',
      bookedByName: bookedBy?.fullName ?? 'Pathologia',
      scheduledAt,
      tests: booking.tests,
      totalAmount,
    });

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.TEST_BOOKING_CREATE,
      entity: 'TestBooking',
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/test-bookings',
          body: {
            testIds: dto.testIds,
            scheduledAt: dto.scheduledAt,
            patientEmail: dto.patientEmail,
          },
        },
        response: {
          success: true,
          data: { id: booking._id.toString(), patientUserId, totalAmount },
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return TestBookingResponseDto.fromDocument(booking, {
      patientName: patient?.fullName,
      patientEmail: patient?.email,
      bookedByName: bookedBy?.fullName,
    });
  }

  async findAll(
    filter: TestBookingListFilter,
    currentUserId: string,
    currentUserRole: Role,
  ) {
    const scopedFilter = this.applyAccessScope(filter, currentUserId, currentUserRole);
    const result = await this.testBookingRepository.findAll(scopedFilter);

    const enriched = await Promise.all(
      result.items.map(async (booking) => {
        const [patient, bookedBy] = await Promise.all([
          this.userRepository.findById(booking.patientUserId.toString()),
          this.userRepository.findById(booking.bookedByUserId.toString()),
        ]);
        return TestBookingResponseDto.fromDocument(booking, {
          patientName: patient?.fullName,
          patientEmail: patient?.email,
          bookedByName: bookedBy?.fullName,
        });
      }),
    );

    return { ...result, items: enriched };
  }

  async findById(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<TestBookingResponseDto> {
    const booking = await this.testBookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    this.ensureCanAccessBooking(booking, currentUserId, currentUserRole);

    const [patient, bookedBy] = await Promise.all([
      this.userRepository.findById(booking.patientUserId.toString()),
      this.userRepository.findById(booking.bookedByUserId.toString()),
    ]);

    return TestBookingResponseDto.fromDocument(booking, {
      patientName: patient?.fullName,
      patientEmail: patient?.email,
      bookedByName: bookedBy?.fullName,
    });
  }

  async cancelBooking(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
    request?: Request,
  ): Promise<TestBookingResponseDto> {
    const booking = await this.testBookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    this.ensureCanAccessBooking(booking, currentUserId, currentUserRole);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException('Past bookings cannot be cancelled');
    }

    const updated = await this.testBookingRepository.updateStatus(
      id,
      BookingStatus.CANCELLED,
    );

    if (!updated) {
      throw new NotFoundException('Test booking not found');
    }

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.TEST_BOOKING_CANCEL,
      entity: 'TestBooking',
      metadata: {
        request: {
          method: request?.method ?? 'PATCH',
          path: request?.path ?? `/test-bookings/${id}/cancel`,
        },
        response: { success: true, data: { id } },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    const [patient, bookedBy] = await Promise.all([
      this.userRepository.findById(updated.patientUserId.toString()),
      this.userRepository.findById(updated.bookedByUserId.toString()),
    ]);

    return TestBookingResponseDto.fromDocument(updated, {
      patientName: patient?.fullName,
      patientEmail: patient?.email,
      bookedByName: bookedBy?.fullName,
    });
  }

  async updateBooking(
    id: string,
    dto: UpdateTestBookingDto,
    currentUserId: string,
    currentUserRole: Role,
    request?: Request,
  ): Promise<TestBookingResponseDto> {
    const booking = await this.testBookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    this.ensureCanAccessBooking(booking, currentUserId, currentUserRole);
    this.ensureBookingIsEditable(booking);

    if (!dto.testIds && !dto.scheduledAt && dto.notes === undefined) {
      throw new BadRequestException('At least one field must be updated');
    }

    const updateData: {
      tests?: {
        testId: string;
        name: string;
        code: string;
        category: TestCategory;
        rate: number;
      }[];
      scheduledAt?: Date;
      totalAmount?: number;
      notes?: string;
    } = {};

    if (dto.testIds) {
      const tests = await this.resolveActiveTests(dto.testIds);
      updateData.tests = tests.map((test) => ({
        testId: test._id.toString(),
        name: test.name,
        code: test.code,
        category: test.category,
        rate: test.rate ?? 0,
      }));
      updateData.totalAmount = tests.reduce((sum, test) => sum + (test.rate ?? 0), 0);
    }

    if (dto.scheduledAt) {
      const scheduledAt = new Date(dto.scheduledAt);
      this.validateScheduledAt(scheduledAt);
      updateData.scheduledAt = scheduledAt;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    const updated = await this.testBookingRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Test booking not found');
    }

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.TEST_BOOKING_UPDATE,
      entity: 'TestBooking',
      metadata: {
        request: {
          method: request?.method ?? 'PATCH',
          path: request?.path ?? `/test-bookings/${id}`,
          body: dto,
        },
        response: { success: true, data: { id } },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    const [patient, bookedBy] = await Promise.all([
      this.userRepository.findById(updated.patientUserId.toString()),
      this.userRepository.findById(updated.bookedByUserId.toString()),
    ]);

    return TestBookingResponseDto.fromDocument(updated, {
      patientName: patient?.fullName,
      patientEmail: patient?.email,
      bookedByName: bookedBy?.fullName,
    });
  }

  async updateBloodTestTracking(
    bookingId: string,
    testItemId: string,
    dto: UpdateBloodTestTrackingDto,
    currentUserId: string,
    currentUserRole: Role,
    request?: Request,
  ): Promise<TestBookingResponseDto> {
    if (currentUserRole !== Role.PATHOLOGIST) {
      throw new ForbiddenException('Only pathologists can update blood test tracking');
    }

    const booking = await this.testBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Tracking is only available for confirmed bookings');
    }

    const testItem = this.findBloodTestItem(booking, testItemId);
    this.validateSequentialStatus(testItem.trackingStatus, dto.status);

    const now = new Date();
    const fields: Record<string, unknown> = {
      trackingStatus: dto.status,
      statusUpdatedAt: now,
    };

    if (dto.status === BloodTestTrackingStatus.BLOOD_COLLECTED) {
      fields.bloodCollectedAt = now;
    } else if (dto.status === BloodTestTrackingStatus.PROCESSING) {
      fields.processingAt = now;
    } else if (dto.status === BloodTestTrackingStatus.PROCESSING_COMPLETED) {
      fields.processingCompletedAt = now;
    } else if (dto.status === BloodTestTrackingStatus.REPORT_DELIVERED) {
      fields.reportDeliveredAt = now;
    }

    const updated = await this.testBookingRepository.updateTestItem(
      bookingId,
      testItemId,
      fields,
    );

    if (!updated) {
      throw new NotFoundException('Test item not found in booking');
    }

    const patient = await this.userRepository.findById(booking.patientUserId.toString());

    if (
      dto.status === BloodTestTrackingStatus.PROCESSING_COMPLETED ||
      dto.status === BloodTestTrackingStatus.REPORT_DELIVERED
    ) {
      void this.emailService.sendBloodTestStatusEmail({
        email: patient?.email ?? '',
        patientName: patient?.fullName ?? 'Patient',
        testName: testItem.name,
        status: dto.status,
      });
    }

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.BLOOD_TEST_STATUS_UPDATE,
      entity: 'TestBooking',
      metadata: {
        request: {
          method: request?.method ?? 'PATCH',
          path: request?.path,
          body: { bookingId, testItemId, status: dto.status },
        },
        response: { success: true },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return this.enrichBookingResponse(updated);
  }

  async uploadBloodTestReport(
    bookingId: string,
    testItemId: string,
    dto: UploadBloodTestReportDto,
    currentUserId: string,
    currentUserRole: Role,
    request?: Request,
  ): Promise<TestBookingResponseDto> {
    if (currentUserRole !== Role.PATHOLOGIST) {
      throw new ForbiddenException('Only pathologists can upload blood test reports');
    }

    const booking = await this.testBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    const testItem = this.findBloodTestItem(booking, testItemId);
    this.ensureReportUploadAllowed(testItem.trackingStatus);

    const fileBuffer = Buffer.from(dto.data, 'base64');
    const compressed = compressForStorage(fileBuffer);
    const now = new Date();

    const updated = await this.testBookingRepository.updateTestItem(
      bookingId,
      testItemId,
      {
        reportData: compressed,
        reportMimeType: dto.mimeType,
        reportFileName: dto.fileName,
        reportUploadedAt: now,
        reportUploadedBy: currentUserId,
      },
    );

    if (!updated) {
      throw new NotFoundException('Test item not found in booking');
    }

    const patient = await this.userRepository.findById(booking.patientUserId.toString());
    void this.emailService.sendBloodTestReportUploadedEmail({
      email: patient?.email ?? '',
      patientName: patient?.fullName ?? 'Patient',
      testName: testItem.name,
      fileName: dto.fileName,
    });

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.BLOOD_TEST_REPORT_UPLOAD,
      entity: 'TestBooking',
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path,
          body: { bookingId, testItemId, fileName: dto.fileName },
        },
        response: { success: true },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return this.enrichBookingResponse(updated);
  }

  async getBloodTestReport(
    bookingId: string,
    testItemId: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const booking = await this.testBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Test booking not found');
    }

    this.ensureCanAccessBooking(booking, currentUserId, currentUserRole);
    const testItem = this.findBloodTestItem(booking, testItemId);

    if (!testItem.reportData) {
      throw new NotFoundException('Report has not been uploaded yet');
    }

    this.ensureReportDownloadAllowed(testItem.trackingStatus);

    let buffer: Buffer;
    try {
      buffer = decompressFromStorage(testItem.reportData);
    } catch {
      throw new InternalServerErrorException('Unable to retrieve report file');
    }

    return {
      buffer,
      fileName: testItem.reportFileName ?? 'report.pdf',
      mimeType: testItem.reportMimeType ?? 'application/octet-stream',
    };
  }

  private async enrichBookingResponse(
    booking: TestBookingDocument,
  ): Promise<TestBookingResponseDto> {
    const [patient, bookedBy] = await Promise.all([
      this.userRepository.findById(booking.patientUserId.toString()),
      this.userRepository.findById(booking.bookedByUserId.toString()),
    ]);

    return TestBookingResponseDto.fromDocument(booking, {
      patientName: patient?.fullName,
      patientEmail: patient?.email,
      bookedByName: bookedBy?.fullName,
    });
  }

  private findBloodTestItem(
    booking: TestBookingDocument,
    testItemId: string,
  ): BookedTestItem {
    const item = booking.tests.find(
      (test) => test._id?.toString() === testItemId,
    );

    if (!item) {
      throw new NotFoundException('Test item not found in booking');
    }

    if (item.category !== TestCategory.BLOOD) {
      throw new BadRequestException('Tracking is only available for blood tests');
    }

    return item;
  }

  private validateSequentialStatus(
    current: BloodTestTrackingStatus | undefined,
    next: BloodTestTrackingStatus,
  ): void {
    const currentIndex = current
      ? BLOOD_TEST_STATUS_ORDER.indexOf(current)
      : -1;
    const nextIndex = BLOOD_TEST_STATUS_ORDER.indexOf(next);

    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        'Blood test status must be updated sequentially without skipping steps',
      );
    }
  }

  private ensureReportUploadAllowed(
    status: BloodTestTrackingStatus | undefined,
  ): void {
    if (
      status !== BloodTestTrackingStatus.PROCESSING_COMPLETED &&
      status !== BloodTestTrackingStatus.REPORT_DELIVERED
    ) {
      throw new BadRequestException(
        'Report can only be uploaded after processing is completed',
      );
    }
  }

  private ensureReportDownloadAllowed(
    status: BloodTestTrackingStatus | undefined,
  ): void {
    if (
      status !== BloodTestTrackingStatus.PROCESSING_COMPLETED &&
      status !== BloodTestTrackingStatus.REPORT_DELIVERED
    ) {
      throw new ForbiddenException('Report is not available yet');
    }
  }

  private async verifyPatientOtp(
    patientEmail: string,
    otp: string,
    pathologistId: string,
  ): Promise<string> {
    const normalizedEmail = patientEmail.toLowerCase().trim();
    const record = await this.bookingOtpRepository.findLatest(
      normalizedEmail,
      pathologistId,
    );

    if (!record) {
      throw new BadRequestException('No OTP found. Please request a new OTP.');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    if (record.otpHash !== hashOtp(otp)) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.bookingOtpRepository.markVerified(record._id.toString());
    return record.patientUserId.toString();
  }

  private async resolveActiveTests(testIds: string[]) {
    const uniqueIds = [...new Set(testIds)];
    const tests = await this.pathologyTestRepository.findByIds(uniqueIds);

    if (tests.length !== uniqueIds.length) {
      throw new NotFoundException('One or more selected tests were not found');
    }

    const inactive = tests.filter((test) => test.status !== Status.ACTIVE);
    if (inactive.length > 0) {
      throw new BadRequestException('One or more selected tests are not available for booking');
    }

    return tests;
  }

  private validateScheduledAt(scheduledAt: Date): void {
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid appointment date and time');
    }

    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Appointment must be scheduled in the future');
    }
  }

  private ensureBookingIsEditable(booking: {
    status: BookingStatus;
    scheduledAt: Date;
  }): void {
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cancelled bookings cannot be edited');
    }

    if (booking.scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException('Past bookings cannot be edited');
    }
  }

  private applyAccessScope(
    filter: TestBookingListFilter,
    currentUserId: string,
    currentUserRole: Role,
  ): TestBookingListFilter {
    if (currentUserRole === Role.ADMIN) {
      return filter;
    }

    if (currentUserRole === Role.USER) {
      return { ...filter, patientUserId: currentUserId };
    }

    if (currentUserRole === Role.PATHOLOGIST) {
      return { ...filter, pathologistId: currentUserId, bookedByUserId: undefined };
    }

    return filter;
  }

  private ensureCanAccessBooking(
    booking: { patientUserId: { toString(): string }; bookedByUserId: { toString(): string } },
    currentUserId: string,
    currentUserRole: Role,
  ): void {
    if (currentUserRole === Role.ADMIN) {
      return;
    }

    const isPatient = booking.patientUserId.toString() === currentUserId;
    const isBooker = booking.bookedByUserId.toString() === currentUserId;
    const isUserSelfBooking =
      booking.patientUserId.toString() === booking.bookedByUserId.toString();

    if (currentUserRole === Role.USER && !isPatient) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    if (
      currentUserRole === Role.PATHOLOGIST &&
      !isBooker &&
      !isPatient &&
      !isUserSelfBooking
    ) {
      throw new ForbiddenException('You do not have access to this booking');
    }
  }
}
