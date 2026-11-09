import { RegisterUseCase } from "./register.use-case";
import { LoginUseCase } from "./login.use-case";
import { CreateSessionUseCase } from "./create-session.use-case";
import { CompleteProfileUseCase } from "./complete-profile.use-case";
import { LogoutUseCase } from "./logout.use-case";

export const AUTH_USE_CASES = [
  CreateSessionUseCase,
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  CompleteProfileUseCase,
];

export {
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  CreateSessionUseCase,
  CompleteProfileUseCase,
};
