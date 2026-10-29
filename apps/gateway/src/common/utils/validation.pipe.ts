import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';
import { ValidationErrorLike } from '@app/common';

export class ApiValidationException extends BadRequestException {
  constructor(public readonly validationErrors: ValidationErrorLike[]) {
    super();
  }
}

export function createApiValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) => {
      return new ApiValidationException(errors as unknown as ValidationErrorLike[]);
    },
  });
}
