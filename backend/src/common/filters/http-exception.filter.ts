import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorDetails = (res as any).error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    // Never expose database passwords, hashes or raw traces
    if (typeof message === 'string' && (message.includes('password') || message.includes('hash'))) {
      if (status >= 500) {
        message = 'A secure processing error occurred';
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) ? message : undefined,
      errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
