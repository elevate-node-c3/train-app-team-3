import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PASSENGER_REPOSITORY } from "./domain/repositories/passenger.repository";
import { PassengerOrmEntity } from "./infrastructure/entities/passenger.typeorm.entity";
import { TypeOrmPassengerRepository } from "./infrastructure/repositories/passenger.typeorm.repository";
import { PassengersService } from "./passengers.service";
import { PassengersGrpcController } from "./passengers.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([PassengerOrmEntity]), UsersModule],
  controllers: [PassengersGrpcController],
  providers: [
    {
      provide: PASSENGER_REPOSITORY,
      useClass: TypeOrmPassengerRepository,
    },
    PassengersService,
  ],
  exports: [PassengersService, PASSENGER_REPOSITORY],
})
export class PassengersModule {}
