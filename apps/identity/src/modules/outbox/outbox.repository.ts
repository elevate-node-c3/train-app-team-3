import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, EntityManager } from 'typeorm';
import { OutboxEvent } from './outbox.entity';

@Injectable()
export class OutboxRepository extends Repository<OutboxEvent> {
  constructor(
    @InjectRepository(OutboxEvent)
    repository: Repository<OutboxEvent>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findPending() {
    return this.find({
      where: { sentAt: IsNull() },
      order: { createdAt: 'ASC' },
      take: 20,
    });
  }


  findPendingLocked(manager: EntityManager) {
    return manager
      .getRepository(OutboxEvent)
      .createQueryBuilder('event')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('event.sentAt IS NULL')
      .orderBy('event.createdAt', 'ASC')
      .limit(20)
      .getMany();
  }

  markAsSent(eventId: string, manager?: EntityManager) {
    const db = manager ?? this.manager;
    return db.update(OutboxEvent, { eventId }, { sentAt: new Date() });
  }
}