import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { CreatePathologyTestDto } from '../dto/create-pathology-test.dto';
import { PathologyTestResponseDto } from '../dto/pathology-test-response.dto';
import { UpdatePathologyTestDto } from '../dto/update-pathology-test.dto';
import { PathologyTestRepository } from '../repositories/pathology-test.repository';
import { PathologyTestListFilter } from '../repositories/pathology-test.repository.interface';

@Injectable()
export class PathologyTestsService {
  constructor(
    private readonly pathologyTestRepository: PathologyTestRepository,
  ) {}

  async create(dto: CreatePathologyTestDto): Promise<PathologyTestResponseDto> {
    await this.ensureUniqueCode(dto.code);
    const test = await this.pathologyTestRepository.create({
      ...dto,
      rate: dto.rate ?? 0,
      status: dto.status ?? Status.ACTIVE,
    });
    return PathologyTestResponseDto.fromDocument(test);
  }

  async findAll(filter: PathologyTestListFilter, role: Role) {
    const scopedFilter = this.applyStatusScope(filter, role);
    const result = await this.pathologyTestRepository.findAll(scopedFilter);
    return {
      ...result,
      items: result.items.map((test) =>
        PathologyTestResponseDto.fromDocument(test),
      ),
    };
  }

  async findById(id: string, role: Role): Promise<PathologyTestResponseDto> {
    const test = await this.pathologyTestRepository.findById(id);
    if (!test) {
      throw new NotFoundException('Pathology test not found');
    }

    if (!this.canViewInactiveTests(role) && test.status === Status.INACTIVE) {
      throw new NotFoundException('Pathology test not found');
    }

    return PathologyTestResponseDto.fromDocument(test);
  }

  async update(
    id: string,
    dto: UpdatePathologyTestDto,
  ): Promise<PathologyTestResponseDto> {
    const existing = await this.pathologyTestRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Pathology test not found');
    }

    if (dto.code && dto.code.toUpperCase() !== existing.code) {
      await this.ensureUniqueCode(dto.code);
    }

    const updated = await this.pathologyTestRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Pathology test not found');
    }
    return PathologyTestResponseDto.fromDocument(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.pathologyTestRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Pathology test not found');
    }
  }

  private canViewInactiveTests(role: Role): boolean {
    return role === Role.PATHOLOGIST;
  }

  private applyStatusScope(
    filter: PathologyTestListFilter,
    role: Role,
  ): PathologyTestListFilter {
    if (this.canViewInactiveTests(role)) {
      return filter;
    }

    return {
      ...filter,
      status: Status.ACTIVE,
    };
  }

  private async ensureUniqueCode(code: string): Promise<void> {
    const existing = await this.pathologyTestRepository.findByCode(code);
    if (existing) {
      throw new ConflictException('Test code already exists');
    }
  }
}
