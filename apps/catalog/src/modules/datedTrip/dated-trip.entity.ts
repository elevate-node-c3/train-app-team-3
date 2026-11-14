import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Train } from '../train/train.entity';
import { Timetable } from '../timetable/timetable.entity';

export enum DatedTripStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

@Entity()
@Index(['train', 'serviceDate'], { unique: true })
export class DatedTrip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  serviceDate!: string;

  @Column({
    type: 'enum',
    enum: DatedTripStatus,
    default: DatedTripStatus.DRAFT,
  })
  status!: DatedTripStatus;

  /** The timetable version this trip was copied from. */
  @Column({ type: 'int', default: 0 })
  timetableVersion!: number;

  @ManyToOne(() => Train, { nullable: false })
  @JoinColumn({ name: 'train_id' })
  train!: Train;

  @ManyToOne(() => Timetable, { nullable: false })
  @JoinColumn({ name: 'timetable_id' })
  timetable!: Timetable;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}