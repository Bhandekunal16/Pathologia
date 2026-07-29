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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseBody = exceptionResponse as Record<string, unknown>;
        message = (responseBody.message as string) ?? message;

        if (Array.isArray(responseBody.message)) {
          errors = responseBody.message as string[];
          message = 'Validation failed';
        } else if (responseBody.errors) {
          errors = responseBody.errors as string[];
        }
      }
    } else if (
      exception instanceof MongoServerError &&
      exception.code === 11000
    ) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate field value';
      errors = [this.parseDuplicateKeyError(exception)];
    } else if (exception instanceof Error) {
      if (exception.message === 'request aborted') {
        return;
      }
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    const body: ApiErrorResponse = {
      success: false,
      message,
      errors,
    };

    response.status(status).json(body);
  }

  private parseDuplicateKeyError(error: MongoServerError): string {
    const keyValue = error.keyValue as Record<string, string> | undefined;
    if (!keyValue) {
      return 'A record with this value already exists';
    }

    const field = Object.keys(keyValue)[0];
    return `${field} already exists`;
  }
}
