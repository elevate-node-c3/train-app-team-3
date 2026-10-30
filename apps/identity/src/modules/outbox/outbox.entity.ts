import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';




@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn('uuid')
  eventId!: string;

  @Column({type:"varchar"})
  payload!: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
