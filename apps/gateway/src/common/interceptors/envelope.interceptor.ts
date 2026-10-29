import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ok, created, EnvelopeContext } from '@app/common';

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpCtx = context.switchToHttp();
        const req = httpCtx.getRequest<Request>();
        const res = httpCtx.getResponse<Response>();

        return next.handle().pipe(
            map((result) => {
                if (result && typeof result === 'object' && result.success === true && 'meta' in result) {
                    return result;
                }

                const ctx = (req as any).envelopeContext as EnvelopeContext;

                if (res.statusCode === 201) {
                    return created(result ?? null, ctx).body;
                }

                return ok(result ?? null, ctx).body;
            }),
        );
    }
}