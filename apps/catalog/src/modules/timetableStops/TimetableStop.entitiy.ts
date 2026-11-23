import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Timetable } from "../timetable/timetable.entity";
import { Station } from "../stations/stations.entity";


@Entity()
export class TimeTableStop{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  
  @Column({ type: 'time', nullable: true })
  arrivalTime!: string | null;


  @Column({ type: 'time', nullable: true })
  departureTime!: string | null;


  @Column()
  stopOrder!:number;


  @ManyToOne(()=>Timetable , (timetable)=>timetable.timeTableStops)
  @JoinColumn({name:'timetable_id'})
  timeTable!:Timetable;


  @ManyToOne(()=>Station , (station)=>station.timeTableStops)
  @JoinColumn({name:'station_Id'})
  station!:Station;


  @CreateDateColumn()
  createdAt!:Date;


  @UpdateDateColumn()
  updatedAt!:Date;

}