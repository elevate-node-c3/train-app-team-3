import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DatedTrip } from '../datedTrip/dated-trip.entity';
import { Station } from '../stations/stations.entity';

@Entity()
@Index(['datedTrip', 'position'], { unique: true })
@Check('CHK_dated_trip_stop_position', '"position" > 0')
export class DatedTripStop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** 1-based and stable once the trip is published: inventory segments are "from position i to j". */
  @Column({ type: 'int' })
  position!: number;

  /** Cairo wall clock, as written in the timetable. */
  @Column({ type: 'time', nullable: true })
  arrivalTime!: string | null;

  @Column({ type: 'time', nullable: true })
  departureTime!: string | null;

  /** The real instants (UTC). Durations are differences between these. */
  @Column({ name: 'arrival_at', type: 'timestamptz', nullable: true })
  arrivalAt!: Date | null;

  @Column({ name: 'departure_at', type: 'timestamptz', nullable: true })
  departureAt!: Date | null;

  /** The Cairo calendar date of each instant (an overnight trip has stops on two dates). */
  @Column({ name: 'arrival_date', type: 'date', nullable: true })
  arrivalDate!: string | null;

  @Column({ name: 'departure_date', type: 'date', nullable: true })
  departureDate!: string | null;

  @ManyToOne(() => DatedTrip, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dated_trip_id' })
  datedTrip!: DatedTrip;

  @ManyToOne(() => Station, { nullable: false })
  @JoinColumn({ name: 'station_id' })
  station!: Station;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}