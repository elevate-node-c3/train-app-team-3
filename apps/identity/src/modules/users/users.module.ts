import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { USER_REPOSITORY } from "./domain/repositories/user.repo";
import { UserOrmEntity } from "./infastracture/entities/user.typeorm.entity";
import { TypeOrmUserRepository } from "./infastracture/repositories/user.typeorm.repo";
import { UsersService } from "./users.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    UsersService,
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}
