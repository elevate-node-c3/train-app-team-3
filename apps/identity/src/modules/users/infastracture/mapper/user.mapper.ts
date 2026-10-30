import { User } from "../../domain/entities/user.model.entity";
import { UserOrmEntity } from "../entities/user.typeorm.entity";

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.email,
      ormEntity.passwordHash,
      true,
      false,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmEntity(domainUser: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainUser.id;
    ormEntity.email = domainUser.email;
    ormEntity.passwordHash = domainUser.getPasswordHash();
    ormEntity.createdAt = domainUser.createdAt;
    ormEntity.updatedAt = domainUser.updatedAt;
    return ormEntity;
  }
}
