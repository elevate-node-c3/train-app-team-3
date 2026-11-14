import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Train } from "../train/train.entity";
import { CoachLayout } from "../coachLayout/coach-layout.entity";
import { ClassesOfTrains } from "../trainClass/train-class.entity";


@Entity()
@Index(['train', 'coachNumber'], { unique: true })
export class Coach{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  coachNumber!:number;


  @ManyToOne(() => Train, (train) => train.coaches)
  @JoinColumn({ name: 'train_id' })
  train!: Train;


  @ManyToOne(() => ClassesOfTrains, (classOfTrain) => classOfTrain.coaches)
  @JoinColumn({ name: 'classOfTrain_id' })
  classOfTrain!: ClassesOfTrains;


  @ManyToOne(() => CoachLayout, (coachLayout) => coachLayout.coaches)
  @JoinColumn({ name: 'coachLayout_id' })
  coachLayout!: CoachLayout;


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}