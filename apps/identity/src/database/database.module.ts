import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { VerificationCode } from '../modules/verification/entities/verification-code.entity';
import { OutboxEvent } from '../modules/outbox/entities/outbox-event.entity';
import { Session } from '../modules/auth/entities/session.entity';
import { migrations } from './migrations/index';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('identity.database.host'),
                port: config.get<number>('identity.database.port'),
                username: config.get<string>('identity.database.username'),
                password: config.get<string>('identity.database.password'),
                database: config.get<string>('identity.database.name'),
                entities: [User, VerificationCode, OutboxEvent, Session],
                migrations: migrations,
                synchronize: false,
                migrationsRun: true,
            }),
        }),
    ],
})
export class DatabaseModule { }