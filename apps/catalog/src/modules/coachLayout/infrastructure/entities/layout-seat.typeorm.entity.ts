
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

import { CoachLayout } from './coach-layout.typeorm.entity';
import { SeatSide } from '../../domain/entities/layout-seat.entity';

@Entity()
@Index(['coachLayout', 'seatNumber'], { unique: true })
@Index(
  ['coachLayout', 'rowNumber', 'adjacencyGroup', 'position'],
  { unique: true },
)
export class LayoutSeat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  seatNumber!: string;

  @Column()
  rowNumber!: number;

  @Column()
  position!: number;

  @Column({
    type: 'enum',
    enum: SeatSide,
  })
  side!: SeatSide;

  @Column({ type: 'varchar', length: 50 })
  adjacencyGroup!: string;

  @ManyToOne(() => CoachLayout, (layout) => layout.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coachLayout_id' })
  coachLayout!: CoachLayout;
}
