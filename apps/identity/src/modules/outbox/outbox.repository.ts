import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

  markAsSent(eventId: string) {
    return this.update({ eventId }, { sentAt: new Date() });
  }
}
