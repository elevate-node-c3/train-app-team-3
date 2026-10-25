import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { migrations } from "./migrations/index";
import { UserOrmEntity } from "../modules/users/infastracture/entities/user.typeorm.entity";
import { SessionOrmEntity } from "../modules/auth/sessions/infastructure/entities/session.typeorm.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("identity.database.host"),
        port: config.get<number>("identity.database.port"),
        username: config.get<string>("identity.database.username"),
        password: config.get<string>("identity.database.password"),
        database: config.get<string>("identity.database.name"),
        entities: [UserOrmEntity, SessionOrmEntity],
        migrations: migrations,
        synchronize: false,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
