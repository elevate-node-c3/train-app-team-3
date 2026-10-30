import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Session } from "../../domain/entities/session.entity";
import { SessionRepository } from "../../domain/repository/session.repo";
import { SessionOrmEntity } from "../entities/session.typeorm.entity";
import { SessionMapper } from "../mapper/session.mapper";

@Injectable()
export class TypeOrmSessionRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly ormRepository: Repository<SessionOrmEntity>,
  ) {}

  async save(session: Session): Promise<Session> {
    const saved = await this.ormRepository.save(
      SessionMapper.toOrmEntity(session),
    );
    return SessionMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Session | null> {
    const ormEntity = await this.ormRepository.findOneBy({ id });
    return ormEntity ? SessionMapper.toDomain(ormEntity) : null;
  }

  async revoke(id: string, userId: string, at: Date): Promise<boolean> {
    const result = await this.ormRepository.update(
      { id, userId, revoked: false, expiresAt: MoreThan(at) },
      { revoked: true, updatedAt: at },
    );
    return (result.affected ?? 0) > 0;
  }
}