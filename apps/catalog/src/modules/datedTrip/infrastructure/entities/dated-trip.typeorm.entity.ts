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
import { TrainOrmEntity } from '../../../train/infrastructure/entities/train.typeorm.entity';
import { TimetableOrmEntity } from '../../../timetable/infrastructure/entities/timetable.typeorm.entity';
import { DatedTripStatus } from '../../domain/entities/dated-trip.entity';

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

  @ManyToOne(() => TrainOrmEntity, { nullable: false })
  @JoinColumn({ name: 'train_id' })
  train!: TrainOrmEntity;

  @ManyToOne(() => TimetableOrmEntity, { nullable: false })
  @JoinColumn({ name: 'timetable_id' })
  timetable!: TimetableOrmEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}