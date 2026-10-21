import { RegisterUseCase } from './register.use-case';
import { LoginUseCase } from './login.use-case';

export const AUTH_USE_CASES = [
    RegisterUseCase,
    LoginUseCase,
];

export { RegisterUseCase, LoginUseCase };