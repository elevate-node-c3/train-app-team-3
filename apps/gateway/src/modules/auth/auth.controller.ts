import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  ForbiddenException,
  UnauthorizedException,
  UsePipes,
<<<<<<< Updated upstream
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
=======
  ValidationPipe,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable, lastValueFrom } from "rxjs";
import { SignUpDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";
import { CompleteProfileDto } from "./dtos/complete-profile.dto";
import { Authenticated } from "../../common/decorators/authenticated.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GatewayUser } from "../../common/guards/gateway-auth.guard";
import { IdentityGrpcService } from "./interfaces/gRPCServices";

@Controller("auth")
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class AuthController implements OnModuleInit {
  constructor(
    @Inject("IDENTITY_PACKAGE") private readonly client: ClientGrpc,
    private identityService: IdentityGrpcService,
>>>>>>> Stashed changes
  ) {}

  onModuleInit() {
    this.identityService =
      this.client.getService<IdentityGrpcService>("IdentityService");
  }

<<<<<<< Updated upstream
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
=======
  @Post("signup")
  async signup(@Body() dto: SignUpDto) {
    const stream$ = this.identityService.register(dto);
    return await lastValueFrom(stream$);
  }

  @Post("login")
  @Authenticated()
  async login(@Body() dto: LoginDto) {
    return lastValueFrom(this.identityService.login(dto));
>>>>>>> Stashed changes
  }

  @Post("logout")
  @Authenticated()
<<<<<<< Updated upstream
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
=======
  async logout(@CurrentUser() user: GatewayUser) {
    if (!user.sid) {
      throw new UnauthorizedException(
        "The access token does not include a session",
      );
    }
    return lastValueFrom(
      this.identityService.logout({ userId: user.sub, sessionId: user.sid }),
    );
  }

  @Post("forgot-password")
  @Authenticated()
  async forgotPassword(
>>>>>>> Stashed changes
    @Body() dto: ForgotPasswordDto,
    @CurrentUser() user: GatewayUser,
  ) {
    if (dto.email !== user.email) {
      throw new ForbiddenException(
<<<<<<< Updated upstream
        this.i18n.translate("auth.resetOwnPasswordOnly", { lang }),
=======
        "You can only reset the password for your own account",
>>>>>>> Stashed changes
      );
    }
    return lastValueFrom(
      this.identityService.forgotPassword({
        email: user.email,
        userId: user.sub,
<<<<<<< Updated upstream
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
=======
      }),
    );
  }

  @Post("verify-otp")
  @Authenticated()
  async verifyOtp(@Body() dto: VerifyOtpDto, @CurrentUser() user: GatewayUser) {
    if (dto.email !== user.email) {
      throw new ForbiddenException("You can only verify your own account");
>>>>>>> Stashed changes
    }
    return lastValueFrom(
      this.identityService.verifyOtp({
        ...dto,
        email: user.email,
        userId: user.sub,
<<<<<<< Updated upstream
      }, this.metadataFor(lang)),
    );
  }

  private metadataFor(language: string): Metadata {
    const metadata = new Metadata();
    metadata.set("accept-language", language);
    return metadata;
=======
      }),
    );
  }
  @Post("profile/complete")
  @Authenticated()
  async completeProfile(
    @Body() dto: CompleteProfileDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return lastValueFrom(
      this.identityService.completeProfile({ ...dto, email: user.email }),
    );
>>>>>>> Stashed changes
  }
}
