import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { migrations } from './migrations';

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
        migrations,
        migrationsRun: true,
        synchronize: process.env.CATALOG_DB_SYNC === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}