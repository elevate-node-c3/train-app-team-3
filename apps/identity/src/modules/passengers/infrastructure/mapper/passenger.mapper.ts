import { Passenger } from "../../domain/entities/passenger.entity";
import { PassengerOrmEntity } from "../entities/passenger.typeorm.entity";
import { UserOrmEntity } from "../../../users/infastracture/entities/user.typeorm.entity";

export class PassengerMapper {
  static toDomain(ormEntity: PassengerOrmEntity): Passenger {
    return new Passenger(
      ormEntity.id,
      ormEntity.fullName,
      ormEntity.nationalId,
      ormEntity.passengerType,
      ormEntity.userId,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmEntity(passenger: Passenger): PassengerOrmEntity {
    const ormEntity = new PassengerOrmEntity();
    ormEntity.id = passenger.id;
    ormEntity.fullName = passenger.fullName;
    ormEntity.nationalId = passenger.nationalId;
    ormEntity.passengerType = passenger.passengerType;
    ormEntity.userId = passenger.userId;
    ormEntity.user = Object.assign(new UserOrmEntity(), {
      id: passenger.userId,
    });
    ormEntity.createdAt = passenger.createdAt;
    ormEntity.updatedAt = passenger.updatedAt;
    return ormEntity;
  }
}
