import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Passenger } from "../../domain/entities/passenger.entity";
import { PassengerRepository } from "../../domain/repositories/passenger.repository";
import { PassengerOrmEntity } from "../entities/passenger.typeorm.entity";
import { PassengerMapper } from "../mapper/passenger.mapper";
import { nationalIdVariants } from "../../../users/domain/utils/national-id";
import { UserOrmEntity } from "../../../users/infastracture/entities/user.typeorm.entity";

@Injectable()
export class TypeOrmPassengerRepository implements PassengerRepository {
  constructor(
    @InjectRepository(PassengerOrmEntity)
    private readonly ormRepository: Repository<PassengerOrmEntity>,
  ) {}

  async save(passenger: Passenger): Promise<Passenger> {
    const saved = await this.ormRepository.save(
      PassengerMapper.toOrmEntity(passenger),
    );
    return PassengerMapper.toDomain(saved);
  }

  async saveIfBelowLimit(
    passenger: Passenger,
    maxPassengers: number,
  ): Promise<
    | { created: true; passenger: Passenger }
    | { created: false; reason: "limit_reached" | "user_not_found" }
  > {
    return this.ormRepository.manager.transaction(async (manager) => {
      const user = await manager.findOne(UserOrmEntity, {
        where: { id: passenger.userId },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) {
        return { created: false, reason: "user_not_found" };
      }

      const passengerCount = await manager.count(PassengerOrmEntity, {
        where: { userId: passenger.userId },
      });
      if (passengerCount >= maxPassengers) {
        return { created: false, reason: "limit_reached" };
      }

      const saved = await manager.save(
        PassengerOrmEntity,
        PassengerMapper.toOrmEntity(passenger),
      );
      return { created: true, passenger: PassengerMapper.toDomain(saved) };
    });
  }

  async findByUserId(userId: string): Promise<Passenger[]> {
    const passengers = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
    return passengers.map(PassengerMapper.toDomain);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Passenger | null> {
    const passenger = await this.ormRepository.findOneBy({ id, userId });
    return passenger ? PassengerMapper.toDomain(passenger) : null;
  }

  async findByNationalIdForUser(
    nationalId: string,
    userId: string,
  ): Promise<Passenger | null> {
    const passenger = await this.ormRepository.findOne({
      where: nationalIdVariants(nationalId).map((value) => ({
        nationalId: value,
        userId,
      })),
    });
    return passenger ? PassengerMapper.toDomain(passenger) : null;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await this.ormRepository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
