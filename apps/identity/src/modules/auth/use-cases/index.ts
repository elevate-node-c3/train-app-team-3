import { RegisterUseCase } from './register.use-case';
import { LoginUseCase } from './login.use-case';
import { CreateSessionUseCase } from './create-session.use-case';

export const AUTH_USE_CASES = [
    CreateSessionUseCase,
    RegisterUseCase,
    LoginUseCase,
];

export { RegisterUseCase, LoginUseCase, CreateSessionUseCase };