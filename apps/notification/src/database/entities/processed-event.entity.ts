import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn('uuid')
  eventId!: string;

  @Column({ type: 'varchar', default: 'sent' })
  outcome!: 'sent' | 'skipped_expired';

  @Column({ type: 'int', nullable: true })
  latencyMs!: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  processedAt!: Date;
}