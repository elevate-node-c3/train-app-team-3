import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AUTH_USE_CASES } from "./use-cases";
import { OtpModule } from "../../../../../libs/auth/otp/otp.module";
import { TokenService } from "../../../../../libs/auth/token/jwt.services";
import { SessionsModule } from "./sessions/sessions.module";
import { LogoutUseCase } from "./use-cases/logout.use-case";

@Module({
  imports: [
    UsersModule,
    OtpModule,
    SessionsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          "identity.jwt.secret",
          "super-secret-jwt-key",
        ),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...AUTH_USE_CASES, LogoutUseCase, AuthService, TokenService],
  exports: [AuthService, OtpModule, TokenService],
})
export class AuthModule {}
