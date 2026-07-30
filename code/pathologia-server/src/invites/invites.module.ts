import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { InvitesController } from './controllers/invites.controller';
import { UserInviteRepository } from './repositories/user-invite.repository';
import { UserInvite, UserInviteSchema } from './schemas/user-invite.schema';
import { InvitesService } from './services/invites.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInvite.name, schema: UserInviteSchema }]),
    UsersModule,
    EmailModule,
    AuditModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [InvitesController],
  providers: [InvitesService, UserInviteRepository],
  exports: [InvitesService],
})
export class InvitesModule {}
