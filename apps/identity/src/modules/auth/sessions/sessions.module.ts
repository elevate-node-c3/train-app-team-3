import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SESSION_REPOSITORY } from "./domain/repository/session.repo";
import { SessionOrmEntity } from "./infastructure/entities/session.typeorm.entity";
import { TypeOrmSessionRepository } from "./infastructure/repository/session.typeorm.repo";
import { SessionService } from "./session.service";

@Module({
  imports: [TypeOrmModule.forFeature([SessionOrmEntity])],
  providers: [
    {
      provide: SESSION_REPOSITORY,
      useClass: TypeOrmSessionRepository,
    },
    SessionService,
  ],
  exports: [SESSION_REPOSITORY, SessionService],
})
export class SessionsModule {}
