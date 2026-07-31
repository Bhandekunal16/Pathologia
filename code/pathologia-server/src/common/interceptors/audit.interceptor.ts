import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AUDIT_KEY } from '../../config/constants';
import { AuditMetadata } from '../interfaces/audit-metadata.interface';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { sanitizeAuditPayload } from '../utils/sanitize-audit.util';
import { getRequestHostname } from '../utils/get-request-hostname.util';

type AuditedRequest = Request & { user?: AuthenticatedUser };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readIdentifiableId(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const id = value._id ?? value.id;
  return typeof id === 'string' ? id : undefined;
}

function resolveEntityId(
  metadata: AuditMetadata,
  params: Request['params'],
  body: unknown,
  responseData: unknown,
): string | undefined {
  if (metadata.entityIdParam) {
    const paramId = params[metadata.entityIdParam];
    if (typeof paramId === 'string') return paramId;
  }

  if (metadata.entityIdFromBody && isRecord(body)) {
    const bodyId = body[metadata.entityIdFromBody];
    if (typeof bodyId === 'string') return bodyId;
  }

  const directId = readIdentifiableId(responseData);
  if (directId) return directId;
  if (isRecord(responseData)) return readIdentifiableId(responseData.data);

  return undefined;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMetadata = this.reflector.getAllAndOverride<AuditMetadata>(
      AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditMetadata) return next.handle();

    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const { method, path, params, headers } = request;
    const body: unknown = request.body;
    const userId = request.user?.sub;
    const hostname = getRequestHostname(request);
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap((responseData) => {
        try {
          const entityId = resolveEntityId(
            auditMetadata,
            params,
            body,
            responseData,
          );
          const requestBody =
            isRecord(body) && Object.keys(body).length > 0
              ? sanitizeAuditPayload(body)
              : undefined;

          this.auditService.log({
            userId,
            action: auditMetadata.action,
            entity: auditMetadata.entity,
            entityId,
            metadata: {
              request: {
                method,
                path,
                ...(requestBody ? { body: requestBody } : {}),
              },
              response: {
                success: true,
                entityId,
                data: sanitizeAuditPayload(responseData),
              },
            },
            hostname,
            userAgent,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          const stack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `Failed to prepare audit log [action=${auditMetadata.action}, entity=${auditMetadata.entity}, userId=${userId ?? 'n/a'}]: ${message}`,
            stack,
          );
        }
      }),
    );
  }
}
