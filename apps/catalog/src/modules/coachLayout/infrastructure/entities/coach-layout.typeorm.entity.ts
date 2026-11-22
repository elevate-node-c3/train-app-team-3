import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CoachOrmEntity } from "../../../coach/infrastructure/entities/coach.typeorm.entity";
import { LayoutSeat } from "./layout-seat.typeorm.entity";


@Entity()
export class CoachLayout{

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  @Column()
  name_ar!:string;

  @Column()
  name_en!:string;

  @Column()
  description!:string;

  @OneToMany(() => LayoutSeat, seat => seat.coachLayout, {
    cascade: true,
  })
  seats!: LayoutSeat[];

  @OneToMany(()=>CoachOrmEntity , (coach)=> coach.coachLayout)
  coaches!:CoachOrmEntity[];

  @CreateDateColumn()
  createdAt!:Date

  @UpdateDateColumn()
  updatedAt!:Date

}