import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { UserOrmEntity } from "../../../users/infastracture/entities/user.typeorm.entity";
import { PassengerType } from "../../application/enums/passenger-type.enum";

@Entity("passengers")
@Index("IDX_passengers_userId_createdAt", ["userId", "createdAt"])
export class PassengerOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  fullName!: string;

  @Column({ type: "varchar" })
  nationalId!: string;

  @Column({
    type: "enum",
    enum: PassengerType,
    enumName: "passengers_passengerType_enum",
  })
  passengerType!: PassengerType;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => UserOrmEntity, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: UserOrmEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
