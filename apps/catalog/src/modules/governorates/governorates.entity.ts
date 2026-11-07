import { Entity, PrimaryGeneratedColumn, OneToMany , Column, UpdateDateColumn , CreateDateColumn  } from 'typeorm';
import { Station } from '../stations/stations.entity';


@Entity('governorate')
export class Governorate{

  @PrimaryGeneratedColumn('uuid')
  id!:string


  @Column({type:'varchar' , length:100 , unique:true})
  name_ar!:string

  @Column({type:'varchar' , length:100 , unique:true})
  name_en!:string


  @OneToMany(()=>Station , (station)=>station.governorate)
  stations!:Station[]


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date


}



