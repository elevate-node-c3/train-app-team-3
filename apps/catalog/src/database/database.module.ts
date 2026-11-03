import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('catalog.database.host'),
                port: config.get<number>('catalog.database.port'),
                username: config.get<string>('catalog.database.username'),
                password: config.get<string>('catalog.database.password'),
                database: config.get<string>('catalog.database.name'),
                autoLoadEntities: true,
                synchronize: false,
            }),
        }),
    ],
})
export class DatabaseModule { }