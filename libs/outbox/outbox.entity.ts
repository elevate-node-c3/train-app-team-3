import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn('uuid')
  eventId!: string;

  @Column({ type: 'varchar', default: 'verification_code_issued' })
  eventType!: string;

  @Column({ type: 'text' })
  payload!: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}