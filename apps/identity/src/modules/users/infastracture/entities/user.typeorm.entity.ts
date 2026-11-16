import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class UserOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: "ar" })
  lang!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  fullName!: string | null;

  @Column({ nullable: true })
  nationalId!: string | null;

  @Column({ nullable: true })
  phone!: string | null;

  @Column({ nullable: true })
  profileType!: string | null;

  @Column({ nullable: true })
  nationality!: string | null;

  @Column({ default: false })
  isProfileCompleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
