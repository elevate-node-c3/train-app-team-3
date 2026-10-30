import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  ForbiddenException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
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
  constructor(
    @Inject("IDENTITY_PACKAGE") private readonly client: ClientGrpc,
    private identityService: IdentityGrpcService,
  ) {}

  onModuleInit() {
    this.identityService =
      this.client.getService<IdentityGrpcService>("IdentityService");
  }

  @Post("register")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() dto: RegisterDto) {
    const { email, password } = dto;

    return await lastValueFrom(
      this.identityService.register({ email, password }),
    );
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("login")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginInDto) {
    return lastValueFrom(this.identityService.login(dto));
  }

  @Post("logout")
  @Authenticated()
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
  @Throttle({ auth: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @CurrentUser() user: GatewayUser,
  ) {
    if (dto.email !== user.email) {
      throw new ForbiddenException(
        "You can only reset the password for your own account",
      );
    }
    return lastValueFrom(
      this.identityService.forgotPassword({
        email: user.email,
        userId: user.sub,
      }),
    );
  }
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("verify-otp")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async verifyOtp(@Body() dto: VerifyOtpDto, @CurrentUser() user: GatewayUser) {
    if (dto.email !== user.email) {
      throw new ForbiddenException("You can only verify your own account");
    }
    return lastValueFrom(
      this.identityService.verifyOtp({
        ...dto,
        email: user.email,
        userId: user.sub,
      }),
    );
  }
}
