import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Coach } from "../coach/coach.entity";
import { Timetable } from "../timetable/timetable.entity";
import { TypeOfTrain } from "../trainType/train-type.entity";


@Entity()
export class Train{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column({ unique:true })
  number!:number;

  @ManyToOne(() => TypeOfTrain, typeOfTrain => typeOfTrain.trains)
  @JoinColumn({ name: 'typeOfTrainId' })
  typeOfTrain!: TypeOfTrain;

  
  @OneToMany(()=>Timetable , (timeTable)=> timeTable.train)
  timeTables!:Timetable[]  


  @OneToMany(()=>Coach , (coach)=> coach.train)
  coaches!:Coach[]

  @CreateDateColumn()
  createdAt!:Date
  
  
  @UpdateDateColumn()
  updatedAt!:Date


}