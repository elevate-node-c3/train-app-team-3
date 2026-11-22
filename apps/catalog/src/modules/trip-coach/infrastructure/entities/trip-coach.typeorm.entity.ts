import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { CoachOrmEntity } from '../../../coach/infrastructure/entities/coach.typeorm.entity';
import { DatedTrip } from '../../../datedTrip/infrastructure/entities/dated-trip.typeorm.entity';

@Entity()
@Index(['datedTrip', 'position'], { unique: true })
@Index(['datedTrip', 'coach'], { unique: true })
export class TripCoach {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => DatedTrip, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dated_trip_id' })
  datedTrip!: DatedTrip;

  @ManyToOne(() => CoachOrmEntity, { nullable: false })
  @JoinColumn({ name: 'coach_id' })
  coach!: CoachOrmEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}