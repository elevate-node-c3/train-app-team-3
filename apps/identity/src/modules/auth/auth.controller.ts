import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Metadata } from "@grpc/grpc-js";
import { AuthService } from "./auth.service";
import { RegisterDto } from "../users/applicatoin/dtos/register.dto";
import { LoginDto } from "../users/applicatoin/dtos/login.dto";
import { getAuthLanguage } from "../../i18n/grpc-language";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod("IdentityService", "Register")
  async register(data: RegisterDto, metadata: Metadata) {
    return this.authService.register(data, getAuthLanguage(metadata));
  }

  @GrpcMethod("IdentityService", "Login")
  async login(data: LoginDto, metadata: Metadata) {
    return this.authService.login(data, getAuthLanguage(metadata));
  }

  @GrpcMethod("IdentityService", "Logout")
  async logout(
    data: { userId: string; sessionId: string },
    metadata: Metadata,
  ) {
    return this.authService.logout(data, getAuthLanguage(metadata));
  }

  @GrpcMethod("IdentityService", "ValidateSession")
  async validateSession(data: { userId: string; sessionId: string }) {
    return this.authService.validateSession(data);
  }

  @GrpcMethod("IdentityService", "ForgotPassword")
  async forgotPassword(data: { email: string; userId: string }) {
    return this.authService.forgotPassword(data);
  }

  @GrpcMethod("IdentityService", "VerifyOtp")
  async verifyOtp(
    data: { email: string; otp: string; userId: string },
    metadata: Metadata,
  ) {
    return this.authService.verifyOtp(data, getAuthLanguage(metadata));
  }
}
