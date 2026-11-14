import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn , CreateDateColumn, ManyToOne , JoinColumn, OneToMany  } from 'typeorm';
import { Governorate } from '../governorates/governorates.entity';
import { TimeTableStop } from '../timetableStops/TimetableStop.entitiy';

@Entity('station')
export class Station{

  @PrimaryGeneratedColumn('uuid')
  id!:string


  @Column({type:'varchar' , length:100 , unique:true})
  name_ar!:string

  @Column({type:'varchar' , length:100 , unique:true})
  name_en!:string


  @Column({type:'text'})
  address!:string


  @Column({ type: 'boolean' , default: true })
  isActive!: boolean;


  @Column({ type: 'uuid' })
  governorateId!: string;

  @ManyToOne(() => Governorate, (governorate) => governorate.stations)
  @JoinColumn({ name: 'governorateId' })
  governorate!: Governorate;


  @OneToMany(() => TimeTableStop, (timeTableStop) => timeTableStop.station)
  timeTableStops!: TimeTableStop[];


  @Column({type:'simple-array' , nullable:true})
  alternativeNames!:string[]


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}