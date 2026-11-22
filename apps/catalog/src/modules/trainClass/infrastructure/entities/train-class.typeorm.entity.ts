import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CoachOrmEntity } from "../../../coach/infrastructure/entities/coach.typeorm.entity";


@Entity()
export class ClassesOfTrainsOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  name_ar!:string;

  @Column()
  name_en!:string;


  @OneToMany(()=>CoachOrmEntity , (coach)=> coach.classOfTrain)
  coaches!:CoachOrmEntity[];


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}