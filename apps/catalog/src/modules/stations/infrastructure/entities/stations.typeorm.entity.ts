import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn , CreateDateColumn, ManyToOne , JoinColumn, OneToMany  } from 'typeorm';
import { CityOrmEntity } from '../../../cities/infrastructure/entities/city.typeorm.entity';
import { TimeTableStopOrmEntity } from '../../../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity';

@Entity('station')
export class StationOrmEntity{

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
  cityId!: string;

  @ManyToOne(() => CityOrmEntity, (city) => city.stations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cityId' })
  city!: CityOrmEntity;


  @OneToMany(() => TimeTableStopOrmEntity, (timeTableStop) => timeTableStop.station)
  timeTableStops!: TimeTableStopOrmEntity[];


  @Column({type:'simple-array' , nullable:true})
  alternativeNames!:string[]


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}