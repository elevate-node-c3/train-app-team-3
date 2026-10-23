import { User } from "../../domain/entities/user.model.entity";
import { UserOrmEntity } from "../entities/user.typeorm.entity";

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.email,
      ormEntity.password,
      ormEntity.confirmPassword,
      ormEntity.isActive,
      ormEntity.isVerified,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmEntity(domainUser: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainUser.id;
    ormEntity.email = domainUser.email;
    ormEntity.password = domainUser.getPasswordHash();
    ormEntity.confirmPassword = domainUser.getConfirmPasswordHash();

    ormEntity.isActive = domainUser.isActive;
    ormEntity.isVerified = domainUser.isVerified;
    ormEntity.createdAt = domainUser.createdAt;
    ormEntity.updatedAt = domainUser.updatedAt;
    return ormEntity;
  }
}
