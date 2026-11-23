import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Train } from "../train/train.entity";
import { TimeTableStop } from "../timetableStops/TimetableStop.entitiy";


@Entity()
export class Timetable{

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


  @ManyToOne(()=>Train , (train)=>train.timeTables)
  @JoinColumn({name:'train_Id'})
  train!:Train;


  @OneToMany(()=>TimeTableStop , (timetableStop)=>timetableStop.timeTable)
  timeTableStops!:TimeTableStop[];


  @CreateDateColumn()
  createdAt!:Date;


  @UpdateDateColumn()
  updatedAt!:Date;

}