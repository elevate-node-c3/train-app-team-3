import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { RegisterDto } from "../users/applicatoin/dtos/register.dto";
import { LoginDto } from "../users/applicatoin/dtos/login.dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod("IdentityService", "Register")
  async register(data: RegisterDto) {
    return this.authService.register(data);
  }

  @GrpcMethod("IdentityService", "Login")
  async login(data: LoginDto) {
    return this.authService.login(data);
  }

  @GrpcMethod("IdentityService", "Logout")
  async logout(data: { userId: string; sessionId: string }) {
    return this.authService.logout(data);
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
  async verifyOtp(data: { email: string; otp: string; userId: string }) {
    return this.authService.verifyOtp(data);
  }
}
