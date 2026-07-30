import {
  Body,
  Controller,
  Get,
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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../shared/enums/role.enum';
import { AuthResponseDto } from '../../auth/dto/auth-response.dto';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { CreateInviteResponseDto } from '../dto/create-invite-response.dto';
import { ValidateInviteResponseDto } from '../dto/validate-invite-response.dto';
import { InvitesService } from '../services/invites.service';

@ApiTags('Invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATHOLOGIST)
  @ApiBearerAuth()
  @ResponseMessage('Invitation sent successfully')
  @ApiOperation({ summary: 'Invite a user by email (Pathologist only)' })
  @ApiResponse({ status: 201, description: 'Invitation sent', type: CreateInviteResponseDto })
  create(
    @Body() dto: CreateInviteDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.invitesService.createInvite(dto.email, userId, request);
  }

  @Public()
  @Get('validate')
  @ApiOperation({ summary: 'Validate invite token' })
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Invite is valid', type: ValidateInviteResponseDto })
  validate(@Query('token') token: string) {
    return this.invitesService.validateInvite(token);
  }

  @Public()
  @Post('accept')
  @ResponseMessage('Registration successful')
  @ApiOperation({ summary: 'Complete registration using invite token' })
  @ApiResponse({ status: 201, description: 'User registered', type: AuthResponseDto })
  accept(@Body() dto: AcceptInviteDto, @Req() request: Request) {
    return this.invitesService.acceptInvite(dto, request);
  }
}
