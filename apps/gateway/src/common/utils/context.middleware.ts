import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { Language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, EnvelopeContext } from '@app/common';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const rawHeader = req.headers['x-correlation-id'];
    const correlationId = (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader) || randomUUID();

    const acceptLang = req.headers['accept-language']?.toLowerCase().slice(0, 2) as Language;
    const language: Language = SUPPORTED_LANGUAGES.includes(acceptLang)
      ? acceptLang
      : DEFAULT_LANGUAGE;

    (req as any).envelopeContext = {
      correlationId,
      language,
    } as EnvelopeContext;

    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
