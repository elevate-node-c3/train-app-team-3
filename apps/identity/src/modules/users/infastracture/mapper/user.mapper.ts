import { User } from "../../domain/entities/user.model.entity";
import { UserOrmEntity } from "../entities/user.typeorm.entity";

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.email,
      ormEntity.passwordHash,
      true,
      ormEntity.isVerified,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.lang,
      ormEntity.fullName,
      ormEntity.nationalId,
      ormEntity.phone,
      ormEntity.profileType,
      ormEntity.nationality,
      ormEntity.isProfileCompleted,
    );
  }

  static toOrmEntity(domainUser: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainUser.id;
    ormEntity.email = domainUser.email;
    ormEntity.passwordHash = domainUser.getPasswordHash();
    ormEntity.lang = domainUser.lang;
    ormEntity.isVerified = domainUser.isVerified;
    ormEntity.fullName = domainUser.fullName;
    ormEntity.nationalId = domainUser.nationalId;
    ormEntity.phone = domainUser.phone;
    ormEntity.profileType = domainUser.profileType;
    ormEntity.nationality = domainUser.nationality;
    ormEntity.isProfileCompleted = domainUser.isProfileCompleted;
    ormEntity.createdAt = domainUser.createdAt;
    ormEntity.updatedAt = domainUser.updatedAt;
    return ormEntity;
  }
}
