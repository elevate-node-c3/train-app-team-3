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
import { Coach } from '../coach/coach.entity';
import { DatedTrip } from '../datedTrip/dated-trip.entity';

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

  @ManyToOne(() => Coach, { nullable: false })
  @JoinColumn({ name: 'coach_id' })
  coach!: Coach;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}