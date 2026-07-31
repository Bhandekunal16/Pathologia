import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './controllers/audit.controller';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { AuditService } from './services/audit.service';

const { name } = AuditLog;

@Module({
  imports: [MongooseModule.forFeature([{ name, schema: AuditLogSchema }])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
