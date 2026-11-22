import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CoachOrmEntity } from "../../../coach/infrastructure/entities/coach.typeorm.entity";
import { TimetableOrmEntity } from "../../../timetable/infrastructure/entities/timetable.typeorm.entity";
import { TypeOfTrainOrmEntity } from "../../../trainType/infrastructure/entities/train-type.typeorm.entity";


@Entity()
export class TrainOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column({ unique:true })
  number!:number;

  @ManyToOne(() => TypeOfTrainOrmEntity, typeOfTrain => typeOfTrain.trains)
  @JoinColumn({ name: 'typeOfTrainId' })
  typeOfTrain!: TypeOfTrainOrmEntity;

  
  @OneToMany(()=>TimetableOrmEntity , (timeTable)=> timeTable.train)
  timeTables!:TimetableOrmEntity[]  


  @OneToMany(()=>CoachOrmEntity , (coach)=> coach.train)
  coaches!:CoachOrmEntity[]

  @CreateDateColumn()
  createdAt!:Date
  
  
  @UpdateDateColumn()
  updatedAt!:Date


}