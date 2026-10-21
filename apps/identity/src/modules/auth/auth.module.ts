import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AUTH_USE_CASES } from './use-cases';

@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('identity.jwt.secret', 'super-secret-jwt-key'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        ...AUTH_USE_CASES,
        AuthService,
    ],
    exports: [AuthService],
})
export class AuthModule { }