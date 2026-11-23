import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Coach } from "../coach/coach.entity";
import { LayoutSeat } from "./layout-seat.entity";


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

  @OneToMany(()=>Coach , (coach)=> coach.coachLayout)
  coaches!:Coach[]

  @CreateDateColumn()
  createdAt!:Date

  @UpdateDateColumn()
  updatedAt!:Date

}