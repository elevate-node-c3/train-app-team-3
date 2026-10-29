import { SignUpUseCase } from './signup.use-case';
import { VerifyEmailUseCase } from './verify-email.use-case';
import { ResendCodeUseCase } from './resend-code.use-case';
import { LoginUseCase } from './login.use-case';
import { RegisterUseCase } from './register.use-case';

export * from './signup.use-case';
export * from './verify-email.use-case';
export * from './resend-code.use-case';
export * from './login.use-case';
export * from './register.use-case';

export const AUTH_USE_CASES = [
    SignUpUseCase,
    VerifyEmailUseCase,
    ResendCodeUseCase,
    LoginUseCase,
    RegisterUseCase,
];