import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../domain/entities/user.model.entity";
import { UserRepository } from "../../domain/repositories/user.repo";
import { UserOrmEntity } from "../entities/user.typeorm.entity";
import { UserMapper } from "../mapper/user.mapper";

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepo.findOneBy({ id });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }
  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.ormRepo.findOneBy({ email });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findAll(page: number, limit: number): Promise<[User[], number]> {
    const [ormEntities, count] = await this.ormRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return [
      ormEntities.map((ormEntity) => UserMapper.toDomain(ormEntity)),
      count,
    ];
  }

  async save(user: User): Promise<void> {
    const ormEntity = UserMapper.toOrmEntity(user);
    await this.ormRepo.save(ormEntity);
  }
}
