import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

interface HttpExceptionResponseBody {
  message?: string | string[];
  errors?: string[];
}

const INTERNAL_ERROR_RESPONSE: ApiErrorResponse = {
  success: false,
  message: 'Internal server error',
  errors: [],
};

const DUPLICATE_RECORD_MESSAGE = 'A record with this value already exists';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isHttpExceptionResponseBody(
  value: unknown,
): value is HttpExceptionResponseBody {
  if (!isRecord(value)) return false;
  const { message, errors } = value;
  if (
    message !== undefined &&
    typeof message !== 'string' &&
    !isStringArray(message)
  )
    return false;
  if (errors !== undefined && !isStringArray(errors)) return false;
  return true;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const { status, body } = this.resolveHttpException(exception);
      response.status(status).json(body);
      return;
    }

    if (this.isDuplicateKeyError(exception)) {
      response
        .status(HttpStatus.CONFLICT)
        .json(this.buildDuplicateKeyResponse(exception));
      return;
    }

    if (exception instanceof Error) {
      if (this.isAbortedRequest(exception)) return;

      this.logUnexpectedError(exception);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(INTERNAL_ERROR_RESPONSE);
      return;
    }

    this.logUnexpectedError(exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(INTERNAL_ERROR_RESPONSE);
  }

  private resolveHttpException(exception: HttpException): {
    status: number;
    body: ApiErrorResponse;
  } {
    const status = exception.getStatus();

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status}: ${exception.message}`,
        exception.stack,
      );
      return { status, body: INTERNAL_ERROR_RESPONSE };
    }

    return {
      status,
      body: this.buildClientErrorResponse(exception.getResponse()),
    };
  }

  private buildClientErrorResponse(
    response: string | object,
  ): ApiErrorResponse {
    if (typeof response === 'string')
      return { success: false, message: response, errors: [] };

    if (!isHttpExceptionResponseBody(response)) return INTERNAL_ERROR_RESPONSE;

    if (isStringArray(response.message))
      return {
        success: false,
        message: 'Validation failed',
        errors: response.message,
      };

    return {
      success: false,
      message:
        typeof response.message === 'string'
          ? response.message
          : INTERNAL_ERROR_RESPONSE.message,
      errors: response.errors ?? [],
    };
  }

  private buildDuplicateKeyResponse(
    exception: MongoServerError,
  ): ApiErrorResponse {
    return {
      success: false,
      message: 'Duplicate field value',
      errors: this.parseDuplicateKeyFields(exception),
    };
  }

  private parseDuplicateKeyFields(error: MongoServerError): string[] {
    const keyValue: unknown = error.keyValue;
    if (!isRecord(keyValue)) return [DUPLICATE_RECORD_MESSAGE];
    const fields = Object.keys(keyValue);
    if (fields.length === 0) return [DUPLICATE_RECORD_MESSAGE];
    return fields.map((field) => `${field} already exists`);
  }

  private isDuplicateKeyError(
    exception: unknown,
  ): exception is MongoServerError {
    return exception instanceof MongoServerError && exception.code === 11000;
  }

  private isAbortedRequest(error: Error): boolean {
    return error.message === 'request aborted';
  }

  private logUnexpectedError(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      return;
    }

    this.logger.error('Unexpected non-error exception', String(exception));
  }
}
