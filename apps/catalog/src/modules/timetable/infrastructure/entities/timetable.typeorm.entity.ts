import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TrainOrmEntity } from "../../../train/infrastructure/entities/train.typeorm.entity";
import { TimeTableStopOrmEntity } from "../../../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity";


@Entity()
export class TimetableOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;


  @Column({ type: 'time' })
  departureTime!: string;


  @Column({ type: 'date' })
  effectiveFrom!: Date;


  @Column({ type: 'date' })
  effectiveTo!: Date;


  @Column('text', { array: true })
  workingDays!: string[];


  @Column()
  status!:boolean;


  /** Set when the operator publishes the timetable. Only published timetables generate trips. */
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;


  /** Incremented on every publish. Each dated trip records the version it was generated from. */
  @Column({ type: 'int', default: 0 })
  version!: number;


  @ManyToOne(()=>TrainOrmEntity , (train)=>train.timeTables)
  @JoinColumn({name:'train_Id'})
  train!:TrainOrmEntity;


  @OneToMany(()=>TimeTableStopOrmEntity , (timetableStop)=>timetableStop.timeTable)
  timeTableStops!:TimeTableStopOrmEntity[];


  @CreateDateColumn()
  createdAt!:Date;


  @UpdateDateColumn()
  updatedAt!:Date;

}