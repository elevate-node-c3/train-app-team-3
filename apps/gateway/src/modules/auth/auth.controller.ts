import { Controller, Post, Body, Inject, OnModuleInit, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { Request } from 'express';
import { Metadata } from '@grpc/grpc-js';
import { created, EnvelopeContext } from '@app/common';
import { SignUpDto } from './dtos/signup.dto';

interface IdentityGrpcService {
  register(
    data: SignUpDto,
    metadata?: Metadata,
  ): Observable<{
    id: string;
    email: string;
    accessToken: string;
  }>;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private identityService!: IdentityGrpcService;

  constructor(@Inject('IDENTITY_PACKAGE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.identityService = this.client.getService<IdentityGrpcService>('IdentityService');
  }

  @Post('signup')
  async signup(@Body() dto: SignUpDto, @Req() req: Request) {
    const ctx = (req as any).envelopeContext as EnvelopeContext;

    const metadata = new Metadata();
    if (ctx) {
      metadata.set('x-correlation-id', ctx.correlationId);
      metadata.set('accept-language', ctx.language);
    }

    const stream$ = this.identityService.register(dto, metadata);
    const result = await lastValueFrom(stream$);

    return created(result, ctx);
  }
}
