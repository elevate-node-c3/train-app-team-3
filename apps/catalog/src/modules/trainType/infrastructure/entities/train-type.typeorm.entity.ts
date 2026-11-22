import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TrainOrmEntity } from "../../../train/infrastructure/entities/train.typeorm.entity";


@Entity()
export class TypeOfTrainOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  name_ar!:string;

  @Column()
  name_en!:string;

  @OneToMany(()=>TrainOrmEntity , (train)=>train.typeOfTrain)
  trains!:TrainOrmEntity[];

  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}