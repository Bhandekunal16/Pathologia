import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { CreatePathologyTestDto } from '../dto/create-pathology-test.dto';
import { UpdatePathologyTestDto } from '../dto/update-pathology-test.dto';
import { PathologyTestsService } from '../services/pathology-tests.service';

@ApiTags('Pathology Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pathology-tests')
export class PathologyTestsController {
  constructor(private readonly pathologyTestsService: PathologyTestsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ApiOperation({ summary: 'List pathology tests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, enum: TestCategory })
  @ApiQuery({ name: 'status', required: false, enum: Status })
  @ApiResponse({ status: 200, description: 'Tests retrieved successfully' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: TestCategory,
    @Query('status') status?: Status,
  ) {
    return this.pathologyTestsService.findAll(
      {
        page,
        limit,
        search,
        category,
        status,
      },
      user.role as Role,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PATHOLOGIST, Role.USER)
  @ApiOperation({ summary: 'Get pathology test by ID' })
  @ApiResponse({ status: 200, description: 'Test retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pathologyTestsService.findById(id, user.role as Role);
  }

  @Post()
  @Roles(Role.PATHOLOGIST)
  @ResponseMessage('Pathology test created successfully')
  @ApiOperation({ summary: 'Create pathology test (Pathologist only)' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  create(@Body() dto: CreatePathologyTestDto) {
    return this.pathologyTestsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.PATHOLOGIST)
  @ResponseMessage('Pathology test updated successfully')
  @ApiOperation({ summary: 'Update pathology test (Pathologist only)' })
  @ApiResponse({ status: 200, description: 'Test updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdatePathologyTestDto) {
    return this.pathologyTestsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ResponseMessage('Pathology test deleted successfully')
  @ApiOperation({ summary: 'Delete pathology test (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.pathologyTestsService.delete(id);
    return {};
  }
}
