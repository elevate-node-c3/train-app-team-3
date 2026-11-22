import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TrainOrmEntity } from "../../../train/infrastructure/entities/train.typeorm.entity";
import { CoachLayout } from "../../../coachLayout/infrastructure/entities/coach-layout.typeorm.entity";
import { ClassesOfTrainsOrmEntity } from "../../../trainClass/infrastructure/entities/train-class.typeorm.entity";


@Entity()
@Index(['train', 'coachNumber'], { unique: true })
export class CoachOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  coachNumber!:number;


  @ManyToOne(() => TrainOrmEntity, (train) => train.coaches)
  @JoinColumn({ name: 'train_id' })
  train!: TrainOrmEntity;


  @ManyToOne(() => ClassesOfTrainsOrmEntity, (classOfTrain) => classOfTrain.coaches)
  @JoinColumn({ name: 'classOfTrain_id' })
  classOfTrain!: ClassesOfTrainsOrmEntity;


  @ManyToOne(() => CoachLayout, (coachLayout) => coachLayout.coaches)
  @JoinColumn({ name: 'coachLayout_id' })
  coachLayout!: CoachLayout;


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date

}