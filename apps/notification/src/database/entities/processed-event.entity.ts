import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn('uuid')
  eventId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  processedAt!: Date;
}