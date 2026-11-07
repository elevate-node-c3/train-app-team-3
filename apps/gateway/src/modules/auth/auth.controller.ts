import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  ForbiddenException,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Metadata } from "@grpc/grpc-js";
import { I18nLang, I18nService, I18nValidationPipe } from "nestjs-i18n";
import { lastValueFrom } from "rxjs";
import { RegisterDto } from "./dtos/register.dto";
import { LoginInDto } from "./dtos/loginin.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";
import { IdentityGrpcService } from "../../clients/identity/identity-grpc.interface";
import { Authenticated } from "../../common/decorators/authenticated.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GatewayUser } from "../../common/guards/gateway-auth.guard";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController implements OnModuleInit {
  private identityService!: IdentityGrpcService;
  constructor(
    @Inject("IDENTITY_PACKAGE") private readonly client: ClientGrpc,
    private readonly i18n: I18nService,
  ) {}

  onModuleInit() {
    this.identityService =
      this.client.getService<IdentityGrpcService>("IdentityService");
  }

  @Post("register")
  @UsePipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@I18nLang() lang: string, @Body() dto: RegisterDto) {
    const { email, password } = dto;
    return await lastValueFrom(
      this.identityService.register({ email, password }, this.metadataFor(lang)),
    );
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("login")
  @UsePipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@I18nLang() lang: string, @Body() dto: LoginInDto) {
    return lastValueFrom(this.identityService.login(dto, this.metadataFor(lang)));
  }

  @Post("logout")
  @Authenticated()
  async logout(
    @I18nLang() lang: string,
    @CurrentUser() user: GatewayUser,
  ) {
    if (!user.sid) {
      throw new UnauthorizedException(
        this.i18n.translate("auth.noSession", { lang }),
      );
    }
    return lastValueFrom(
      this.identityService.logout(
        { userId: user.sub, sessionId: user.sid },
        this.metadataFor(lang),
      ),
    );
  }
  @Throttle({ auth: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @UsePipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async forgotPassword(
    @I18nLang() lang: string,
    @Body() dto: ForgotPasswordDto,
    @CurrentUser() user: GatewayUser,
  ) {
    if (dto.email !== user.email) {
      throw new ForbiddenException(
        this.i18n.translate("auth.resetOwnPasswordOnly", { lang }),
      );
    }
    return lastValueFrom(
      this.identityService.forgotPassword({
        email: user.email,
        userId: user.sub,
      }, this.metadataFor(lang)),
    );
  }
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("verify-otp")
  @UsePipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async verifyOtp(
    @I18nLang() lang: string,
    @Body() dto: VerifyOtpDto,
    @CurrentUser() user: GatewayUser,
  ) {
    if (dto.email !== user.email) {
      throw new ForbiddenException(
        this.i18n.translate("auth.verifyOwnAccountOnly", { lang }),
      );
    }
    return lastValueFrom(
      this.identityService.verifyOtp({
        ...dto,
        email: user.email,
        userId: user.sub,
      }, this.metadataFor(lang)),
    );
  }

  private metadataFor(language: string): Metadata {
    const metadata = new Metadata();
    metadata.set("accept-language", language);
    return metadata;
  }
}
