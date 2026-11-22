import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TimetableOrmEntity } from "../../../timetable/infrastructure/entities/timetable.typeorm.entity";
import { StationOrmEntity } from "../../../stations/infrastructure/entities/stations.typeorm.entity";


@Entity()
export class TimeTableStopOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  
  @Column({ type: 'time', nullable: true })
  arrivalTime!: string | null;


  @Column({ type: 'time', nullable: true })
  departureTime!: string | null;


  @Column()
  stopOrder!:number;


  @ManyToOne(()=>TimetableOrmEntity , (timetable)=>timetable.timeTableStops)
  @JoinColumn({name:'timetable_id'})
  timeTable!:TimetableOrmEntity;


  @ManyToOne(()=>StationOrmEntity , (station)=>station.timeTableStops)
  @JoinColumn({name:'station_Id'})
  station!:StationOrmEntity;


  @CreateDateColumn()
  createdAt!:Date;


  @UpdateDateColumn()
  updatedAt!:Date;

}