import { Controller, Post, Body, Inject, OnModuleInit, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { Request } from 'express';
import { Metadata } from '@grpc/grpc-js';
import { created, ok, EnvelopeContext } from '@app/common';
import { SignUpDto, VerifyEmailDto, ResendCodeDto } from './dtos';

interface IdentityGrpcService {
  signUp(
    data: { email: string; password: string; language?: string },
    metadata?: Metadata,
  ): Observable<{
    userId: string;
    email: string;
    maskedEmail: string;
    message: string;
  }>;

  verifyEmail(
    data: { email: string; code: string },
    metadata?: Metadata,
  ): Observable<{
    userId: string;
    email: string;
    isVerified: boolean;
    accessToken: string;
    refreshToken: string;
  }>;

  resendVerificationCode(
    data: { email: string; language?: string },
    metadata?: Metadata,
  ): Observable<{
    message: string;
    maskedEmail: string;
    cooldownSeconds: number;
  }>;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private identityService!: IdentityGrpcService;

  constructor(@Inject('IDENTITY_PACKAGE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.identityService = this.client.getService<IdentityGrpcService>('IdentityService');
  }

  private createGrpcMetadata(req: Request): { metadata: Metadata; ctx: EnvelopeContext } {
    const ctx = (req as any).envelopeContext as EnvelopeContext;
    const metadata = new Metadata();
    if (ctx) {
      metadata.set('x-correlation-id', ctx.correlationId);
      metadata.set('accept-language', ctx.language);
    }
    return { metadata, ctx };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignUpDto, @Req() req: Request) {
    const { metadata, ctx } = this.createGrpcMetadata(req);
    const language = dto.language || ctx?.language || 'ar';

    const stream$ = this.identityService.signUp(
      {
        email: dto.email,
        password: dto.password,
        language,
      },
      metadata,
    );
    const result = await lastValueFrom(stream$);

    return created(result, ctx).body;
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    const { metadata, ctx } = this.createGrpcMetadata(req);

    const stream$ = this.identityService.verifyEmail(
      {
        email: dto.email,
        code: dto.code,
      },
      metadata,
    );
    const result = await lastValueFrom(stream$);

    return ok(result, ctx).body;
  }

  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  async resendCode(@Body() dto: ResendCodeDto, @Req() req: Request) {
    const { metadata, ctx } = this.createGrpcMetadata(req);
    const language = dto.language || ctx?.language || 'ar';

    const stream$ = this.identityService.resendVerificationCode(
      {
        email: dto.email,
        language,
      },
      metadata,
    );
    const result = await lastValueFrom(stream$);

    return ok(result, ctx).body;
  }
}
