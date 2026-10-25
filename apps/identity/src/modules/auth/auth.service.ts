import { Injectable } from "@nestjs/common";
import { RegisterUseCase } from "./use-cases/register.use-case";
import { LoginUseCase } from "./use-cases/login.use-case";
import { RegisterDto } from "../users/applicatoin/dtos/register.dto";
import { LoginDto } from "../users/applicatoin/dtos/login.dto";
import { LogoutUseCase } from "./use-cases/logout.use-case";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { OtpService } from "../../../../../libs/auth/otp/otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  async login(dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  async logout(input: { userId: string; sessionId: string }) {
    return this.logoutUseCase.execute(input);
  }

  async validateSession(input: { userId: string; sessionId: string }) {
    return { active: await this.logoutUseCase.isActive(input) };
  }

  async forgotPassword(input: { email: string; userId: string }) {
    await this.otpService.create(input.userId, "forgot-password");
    return { success: true };
  }

  async verifyOtp(input: { email: string; otp: string; userId: string }) {
    const valid = await this.otpService.verify(
      input.userId,
      "forgot-password",
      input.otp,
    );

    if (!valid) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: "The OTP is invalid or expired",
      });
    }

    return { success: true };
  }
}
