import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { VerificationModule } from '../verification/verification.module';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AUTH_USE_CASES } from './use-cases';

@Module({
    imports: [
        UsersModule,
        VerificationModule,
        TypeOrmModule.forFeature([User, Session]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('identity.jwt.privateKey', 'identity-jwt-secret-key-test'),
                signOptions: { expiresIn: '15m' },
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