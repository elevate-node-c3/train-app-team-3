import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { status } from '@grpc/grpc-js';
import {
  DomainError,
  ErrorCode,
  DEFAULT_LANGUAGE,
  fail,
  validationFailed,
  fromClassValidator,
  EnvelopeContext,
} from '@app/common';
import { ApiValidationException } from '../utils/validation.pipe';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const envelopeContext: EnvelopeContext = (request as any).envelopeContext ?? {
      correlationId: (request.headers['x-correlation-id'] as string) || 'unknown-correlation-id',
      language: DEFAULT_LANGUAGE,
    };

    if (exception instanceof ApiValidationException) {
      const issues = fromClassValidator(exception.validationErrors);
      const { status: httpStatus, body } = validationFailed(issues, envelopeContext);
      response.status(httpStatus).json(body);
      return;
    }

    if (exception instanceof DomainError) {
      const { status: httpStatus, body } = fail(exception.code, envelopeContext, exception.params);
      response.status(httpStatus).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      let matchedCode: string = ErrorCode.INTERNAL_ERROR;

      switch (httpStatus) {
        case HttpStatus.UNAUTHORIZED:
          matchedCode = ErrorCode.AUTH_TOKEN_MISSING;
          break;
        case HttpStatus.FORBIDDEN:
          matchedCode = ErrorCode.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          matchedCode = ErrorCode.NOT_FOUND;
          break;
        case HttpStatus.METHOD_NOT_ALLOWED:
          matchedCode = ErrorCode.METHOD_NOT_ALLOWED;
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          matchedCode = ErrorCode.RATE_LIMITED;
          break;
        case HttpStatus.BAD_REQUEST:
          matchedCode = ErrorCode.MALFORMED_REQUEST;
          break;
      }

      const { status: codeStatus, body } = fail(matchedCode, envelopeContext);
      response.status(codeStatus).json(body);
      return;
    }

    const isGrpcError = exception?.code !== undefined && typeof exception.code === 'number';
    if (isGrpcError) {
      let candidateCode: string = ErrorCode.INTERNAL_ERROR;
      let params: Record<string, any> = {};

      if (exception.details) {
        try {
          const parsed = JSON.parse(exception.details);
          if (parsed.code && ErrorCode[parsed.code as keyof typeof ErrorCode]) {
            candidateCode = parsed.code;
            params = parsed.params || {};
          }
        } catch {
          if (ErrorCode[exception.details as keyof typeof ErrorCode]) {
            candidateCode = exception.details;
          }
        }
      }

      if (candidateCode === ErrorCode.INTERNAL_ERROR) {
        switch (exception.code) {
          case status.INVALID_ARGUMENT:
            candidateCode = ErrorCode.MALFORMED_REQUEST;
            break;
          case status.UNAUTHENTICATED:
            candidateCode = ErrorCode.AUTH_INVALID_CREDENTIALS;
            break;
          case status.PERMISSION_DENIED:
            candidateCode = ErrorCode.FORBIDDEN;
            break;
          case status.NOT_FOUND:
            candidateCode = ErrorCode.NOT_FOUND;
            break;
          case status.ALREADY_EXISTS:
            candidateCode = ErrorCode.AUTH_EMAIL_TAKEN;
            break;
          case status.RESOURCE_EXHAUSTED:
            candidateCode = ErrorCode.RATE_LIMITED;
            break;
          case status.UNAVAILABLE:
            candidateCode = ErrorCode.SERVICE_UNAVAILABLE;
            break;
          case status.DEADLINE_EXCEEDED:
            candidateCode = ErrorCode.UPSTREAM_TIMEOUT;
            break;
          default:
            candidateCode = ErrorCode.INTERNAL_ERROR;
            break;
        }
      }

      const { status: httpStatus, body } = fail(candidateCode, envelopeContext, params);
      response.status(httpStatus).json(body);
      return;
    }

    this.logger.error(
      `Unhandled Exception [${envelopeContext.correlationId}]: ${exception?.message}`,
      exception?.stack,
    );

    const { status: httpStatus, body } = fail(ErrorCode.INTERNAL_ERROR, envelopeContext);
    response.status(httpStatus).json(body);
  }
}
