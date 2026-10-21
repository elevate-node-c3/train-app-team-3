import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { status } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = exception.details || exception.message || 'Internal server error';

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
            default:
                if (exception.status && typeof exception.status === 'number') {
                    httpStatus = exception.status;
                }
                break;
        }

        response.status(httpStatus).json({
            statusCode: httpStatus,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}