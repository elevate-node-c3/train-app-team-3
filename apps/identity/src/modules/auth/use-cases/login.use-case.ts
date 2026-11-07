import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { UsersService } from "../../users/users.service";
import { LoginDto } from "../../users/applicatoin/dtos/login.dto";
import { CreateSessionUseCase } from "./create-session.use-case";
import { I18nService } from "nestjs-i18n";
import { AuthLanguage } from "../../../i18n/grpc-language";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: LoginDto, language: AuthLanguage = "ar") {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: this.i18n.translate("auth.invalidCredentials", {
          lang: language,
        }),
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.getPasswordHash());
    if (!isMatch) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: this.i18n.translate("auth.invalidCredentials", {
          lang: language,
        }),
      });
    }
    const session = await this.createSessionUseCase.execute({
      userId: user.id,
      email: user.email,
      deviceInfo: dto.deviceInfo ?? null,
    });
    return {
      id: user.id,
      email: user.email,
      accessToken: session.accessToken,
    };
  }
}
