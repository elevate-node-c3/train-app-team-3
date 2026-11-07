import { Injectable } from "@nestjs/common";
import { LoginDto } from "./modules/users/applicatoin/dtos/login.dto";
import { AuthService } from "./modules/auth/auth.service";
import { LoginResponse } from "./modules/users/applicatoin/dtos/login.response";
import { RegisterDto } from "./modules/users/applicatoin/dtos/register.dto";
import { AuthLanguage } from "./i18n/grpc-language";

@Injectable()
export class IdentityService {
  constructor(private readonly authService: AuthService) {}

  async register(
    registerRequest: RegisterDto,
    language: AuthLanguage = "ar",
  ): Promise<LoginResponse> {
    return this.authService.register(registerRequest, language);
  }

  async login(
    loginRequest: LoginDto,
    language: AuthLanguage = "ar",
  ): Promise<LoginResponse> {
    return this.authService.login(loginRequest, language);
  }

  async logout(
    input: { userId: string; sessionId: string },
    language: AuthLanguage = "ar",
  ): Promise<{ success: boolean }> {
    return this.authService.logout(input, language);
  }

  async forgotPassword(input: {
    email: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    return this.authService.forgotPassword(input);
  }

  async verifyOtp(
    input: { email: string; otp: string; userId: string },
    language: AuthLanguage = "ar",
  ): Promise<{ success: boolean }> {
    return this.authService.verifyOtp(input, language);
  }
}
