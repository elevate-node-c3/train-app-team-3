import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Response } from 'express';
import { status } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const exceptionResponse =
            typeof exception.getResponse === 'function'
                ? exception.getResponse()
                : undefined;
        const responseBody =
            exceptionResponse && typeof exceptionResponse === 'object'
                ? exceptionResponse
                : undefined;

        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = responseBody?.message || exception.details || exception.message ||
            I18nContext.current()?.translate('auth.internalServerError') ||
            'حدث خطأ داخلي في الخادم';

        switch (exception.code) {
            case status.INVALID_ARGUMENT:
                httpStatus = HttpStatus.BAD_REQUEST;
                break;
            case status.UNAUTHENTICATED:
                httpStatus = HttpStatus.UNAUTHORIZED;
                break;
            case status.PERMISSION_DENIED:
                httpStatus = HttpStatus.FORBIDDEN;
                break;
            case status.NOT_FOUND:
                httpStatus = HttpStatus.NOT_FOUND;
                break;
            case status.ALREADY_EXISTS:
                httpStatus = HttpStatus.CONFLICT;
                break;
            case status.UNIMPLEMENTED:
                httpStatus = HttpStatus.NOT_IMPLEMENTED;
                break;
            case status.UNAVAILABLE:
              httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
              break;      
            default:
                if (exception.status && typeof exception.status === 'number') {
                    httpStatus = exception.status;
                }
                break;
        }

        response.status(httpStatus).json({
            statusCode: httpStatus,
            message,
            ...(responseBody?.code && { code: responseBody.code }),
            timestamp: new Date().toISOString(),
        });
    }
}