import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Train } from "../train/train.entity";


@Entity()
export class TypeOfTrain{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  name_ar!:string;

  @Column()
  name_en!:string;

  @OneToMany(()=>Train , (train)=>train.typeOfTrain)
  trains!:Train[];

  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}