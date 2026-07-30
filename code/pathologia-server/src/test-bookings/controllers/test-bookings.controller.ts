import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { Role } from '../../shared/enums/role.enum';
import { CreateTestBookingDto } from '../dto/create-test-booking.dto';
import { SendBookingOtpDto } from '../dto/send-booking-otp.dto';
import { SendBookingOtpResponseDto } from '../dto/send-booking-otp-response.dto';
import { TestBookingResponseDto } from '../dto/test-booking-response.dto';
import { UpdateTestBookingDto } from '../dto/update-test-booking.dto';
import { TestBookingsService } from '../services/test-bookings.service';

@ApiTags('Test Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-bookings')
export class TestBookingsController {
  constructor(private readonly testBookingsService: TestBookingsService) {}

  @Post('otp/send')
  @Roles(Role.PATHOLOGIST)
  @ResponseMessage('OTP sent successfully')
  @ApiOperation({ summary: 'Send OTP to patient email for on-behalf booking' })
  @ApiResponse({ status: 201, type: SendBookingOtpResponseDto })
  sendOtp(
    @Body() dto: SendBookingOtpDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.testBookingsService.sendBookingOtp(dto.patientEmail, userId, request);
  }

  @Post()
  @Roles(Role.USER, Role.PATHOLOGIST)
  @ResponseMessage('Test booking created successfully')
  @ApiOperation({ summary: 'Create a test booking' })
  @ApiResponse({ status: 201, type: TestBookingResponseDto })
  create(
    @Body() dto: CreateTestBookingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.testBookingsService.createBooking(
      dto,
      user.sub,
      user.role as Role,
      request,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ApiOperation({ summary: 'List test bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BookingStatus,
  ) {
    return this.testBookingsService.findAll(
      { page, limit, status },
      user.sub,
      user.role as Role,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ApiOperation({ summary: 'Get test booking by ID' })
  @ApiResponse({ status: 200, type: TestBookingResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.testBookingsService.findById(id, user.sub, user.role as Role);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ResponseMessage('Test booking updated successfully')
  @ApiOperation({ summary: 'Update test booking (tests, timeline, notes)' })
  @ApiResponse({ status: 200, type: TestBookingResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTestBookingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.testBookingsService.updateBooking(
      id,
      dto,
      user.sub,
      user.role as Role,
      request,
    );
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ResponseMessage('Test booking cancelled successfully')
  @ApiOperation({ summary: 'Cancel a test booking' })
  @ApiResponse({ status: 200, type: TestBookingResponseDto })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.testBookingsService.cancelBooking(
      id,
      user.sub,
      user.role as Role,
      request,
    );
  }
}
