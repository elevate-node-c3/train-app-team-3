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
import { Train } from '../train/train.entity';
import { Station } from '../stations/stations.entity';
import { ClassesOfTrains } from '../trainClass/train-class.entity';

/**
 * One row per (train, class, origin, destination, effectiveFrom). A price change is a NEW row;
 * the fare in force at instant T is the row with the latest effectiveFrom <= T.
 */
@Entity()
@Index(
  ['train', 'trainClass', 'originStation', 'destinationStation', 'effectiveFrom'],
  { unique: true },
)
@Check('CHK_fare_price_positive', '"priceInPiasters" > 0')
@Check('CHK_fare_distinct_stations', '"origin_station_id" <> "destination_station_id"')
export class Fare {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  priceInPiasters!: number;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  effectiveFrom!: Date;

  @ManyToOne(() => Train, { nullable: false })
  @JoinColumn({ name: 'train_id' })
  train!: Train;

  @ManyToOne(() => ClassesOfTrains, { nullable: false })
  @JoinColumn({ name: 'train_class_id' })
  trainClass!: ClassesOfTrains;

  @ManyToOne(() => Station, { nullable: false })
  @JoinColumn({ name: 'origin_station_id' })
  originStation!: Station;

  @ManyToOne(() => Station, { nullable: false })
  @JoinColumn({ name: 'destination_station_id' })
  destinationStation!: Station;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}