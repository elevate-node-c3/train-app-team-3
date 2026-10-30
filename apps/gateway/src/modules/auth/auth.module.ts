import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IdentityClientModule } from '../../clients/identity/identity-client.module';
import { AuthController } from './auth.controller';
import { GatewayAuthGuard } from '../../common/guards/gateway-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
    imports: [
        IdentityClientModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                signOptions: { algorithm: 'HS256' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [GatewayAuthGuard, RolesGuard],
})
export class AuthModule { }