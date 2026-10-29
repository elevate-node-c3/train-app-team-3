import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ name: 'event_id', type: 'uuid', unique: true })
    eventId!: string;

    @Column({ name: 'event_type' })
    eventType!: string;

    @Column({ name: 'aggregate_type' })
    aggregateType!: string;

    @Column({ name: 'aggregate_id' })
    aggregateId!: string;

    @Column({ name: 'payload', type: 'jsonb' })
    payload!: Record<string, any>;

    @Column({ name: 'correlation_id', nullable: true })
    correlationId?: string;

    @Index()
    @Column({ name: 'status', default: 'PENDING' })
    status!: 'PENDING' | 'PUBLISHED' | 'FAILED';

    @Column({ name: 'retry_count', default: 0 })
    retryCount!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
    sentAt?: Date | null;
}
