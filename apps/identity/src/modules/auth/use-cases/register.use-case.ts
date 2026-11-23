import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { UsersService } from "../../users/users.service";
import { RegisterDto } from "../../users/applicatoin/dtos/register.dto";
import { CreateSessionUseCase } from "./create-session.use-case";
import { I18nService } from "nestjs-i18n";
import { AuthLanguage } from "../../../i18n/grpc-language";

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: RegisterDto, language: AuthLanguage = "ar") {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: this.i18n.translate("auth.emailAlreadyExists", {
          lang: language,
        }),
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      lang: language,
    });

    const session = await this.createSessionUseCase.execute({
      userId: user.id,
      email: user.email,
      deviceInfo: null,
    });

    return {
      id: user.id,
      email: user.email,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
  }
}
