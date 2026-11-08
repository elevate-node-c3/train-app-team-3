import { Injectable } from "@nestjs/common";
import { RegisterUseCase } from "./use-cases/register.use-case";
import { LoginUseCase } from "./use-cases/login.use-case";
import { RegisterDto } from "../users/applicatoin/dtos/register.dto";
import { LoginDto } from "../users/applicatoin/dtos/login.dto";
import { LogoutUseCase } from "./use-cases/logout.use-case";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { OtpService } from "../../../../../libs/auth/otp/otp.service";
<<<<<<< Updated upstream
import { I18nService } from "nestjs-i18n";
import {
  AuthLanguage,
} from "../../i18n/grpc-language";
=======
import { CompleteProfileUseCase } from "./use-cases/complete-profile.use-case";
import { CompleteProfileDto } from "../users/applicatoin/dtos/complete-profile.dto";
>>>>>>> Stashed changes

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly otpService: OtpService,
<<<<<<< Updated upstream
    private readonly i18n: I18nService,
=======
    private readonly completeProfileUseCase: CompleteProfileUseCase,
>>>>>>> Stashed changes
  ) {}

  async register(dto: RegisterDto, language: AuthLanguage = "ar") {
    return this.registerUseCase.execute(dto, language);
  }

  async login(dto: LoginDto, language: AuthLanguage = "ar") {
    return this.loginUseCase.execute(dto, language);
  }

  async logout(
    input: { userId: string; sessionId: string },
    language: AuthLanguage = "ar",
  ) {
    return this.logoutUseCase.execute(input, language);
  }

  async validateSession(input: { userId: string; sessionId: string }) {
    return { active: await this.logoutUseCase.isActive(input) };
  }

  async forgotPassword(input: { email: string; userId: string }) {
    await this.otpService.create(input.userId, "forgot-password");
    return { success: true };
  }

<<<<<<< Updated upstream
  async verifyOtp(
    input: { email: string; otp: string; userId: string },
    language: AuthLanguage = "ar",
  ) {
=======
  async verifyOtp(input: { email: string; otp: string; userId: string }) {
>>>>>>> Stashed changes
    const valid = await this.otpService.verifyUserOtp(
      input.userId,
      "forgot-password",
      input.otp,
    );

    if (!valid) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: this.i18n.translate("auth.otpInvalidOrExpired", {
          lang: language,
        }),
      });
    }

    return { success: true };
  }

  async completeProfile(dto: CompleteProfileDto) {
    return this.completeProfileUseCase.execute(dto);
  }
}
