import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn , CreateDateColumn, ManyToOne , JoinColumn  } from 'typeorm';
import { Governorate } from '../governorates/governorates.entity';

@Entity('station')
export class Station{

  @PrimaryGeneratedColumn('uuid')
  id!:string


  @Column({type:'varchar' , length:100})
  name!:string


  @Column({type:'text'})
  address!:string


  @Column({ type: 'boolean' , default: true })
  isActive!: boolean;


  @Column({ type: 'uuid' })
  governorateId!: string;

  @ManyToOne(() => Governorate, (governorate) => governorate.stations)
  @JoinColumn({ name: 'governorateId' })
  governorate!: Governorate;



  @Column({type:'simple-array' , nullable:true})
  alternativeNames!:string[]


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date



}