import { Session } from "../../domain/entities/session.entity";
import { SessionOrmEntity } from "../entities/session.typeorm.entity";

export class SessionMapper {
  static toDomain(entity: SessionOrmEntity): Session {
    return new Session(
      entity.id,
      entity.userId,
      entity.deviceInfo,
      entity.revoked,
      entity.expiresAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(session: Session): SessionOrmEntity {
    const entity = new SessionOrmEntity();
    entity.id = session.id;
    entity.userId = session.userId;
    entity.deviceInfo = session.deviceInfo;
    entity.revoked = session.revoked;
    entity.expiresAt = session.expiresAt;
    entity.createdAt = session.createdAt;
    entity.updatedAt = session.updatedAt;
    return entity;
  }
}
