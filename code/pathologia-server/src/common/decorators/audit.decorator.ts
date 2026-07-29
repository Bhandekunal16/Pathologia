import { SetMetadata } from '@nestjs/common';
import { AUDIT_KEY } from '../../config/constants';
import { AuditMetadata } from '../interfaces/audit-metadata.interface';

export const Audited = (metadata: AuditMetadata) =>
  SetMetadata(AUDIT_KEY, metadata);
