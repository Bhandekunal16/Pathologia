import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AUDIT_KEY } from '../../config/constants';
import { AuditMetadata } from '../interfaces/audit-metadata.interface';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    return next.handle().pipe(
      tap(async (responseData) => {
        const userId = request.user?.sub;
        const entityId =
          (auditMetadata.entityIdParam
            ? (request.params[auditMetadata.entityIdParam] as string)
            : undefined) ??
          (auditMetadata.entityIdFromBody
            ? ((request.body as Record<string, string>)?.[
                auditMetadata.entityIdFromBody
              ] as string)
            : undefined) ??
          ((responseData as { _id?: string; id?: string })?._id as string) ??
          ((responseData as { _id?: string; id?: string })?.id as string);

        await this.auditService.log({
          userId,
          action: auditMetadata.action,
          entity: auditMetadata.entity,
          entityId,
          metadata: {
            method: request.method,
            path: request.path,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
