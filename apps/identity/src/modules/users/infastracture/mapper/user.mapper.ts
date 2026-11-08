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
<<<<<<< Updated upstream
      ormEntity.lang,
=======
      ormEntity.fullName,
      ormEntity.nationalId,
      ormEntity.phone,
      ormEntity.profileType,
      ormEntity.nationality,
      ormEntity.isProfileCompleted,
>>>>>>> Stashed changes
    );
  }

  static toOrmEntity(domainUser: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainUser.id;
    ormEntity.email = domainUser.email;
    ormEntity.passwordHash = domainUser.getPasswordHash();
<<<<<<< Updated upstream
    ormEntity.lang = domainUser.lang;
=======
    ormEntity.fullName = domainUser.fullName;
    ormEntity.nationalId = domainUser.nationalId;
    ormEntity.phone = domainUser.phone;
    ormEntity.profileType = domainUser.profileType;
    ormEntity.nationality = domainUser.nationality;
    ormEntity.isProfileCompleted = domainUser.isProfileCompleted;
>>>>>>> Stashed changes
    ormEntity.createdAt = domainUser.createdAt;
    ormEntity.updatedAt = domainUser.updatedAt;
    return ormEntity;
  }
}
