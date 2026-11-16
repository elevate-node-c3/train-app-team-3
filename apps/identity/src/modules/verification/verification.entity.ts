
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { VerificationPurpose } from '../../../../../libs/contracts/src/verification-code-issued.event';

@Entity('verification_codes')
@Index(['email', 'purpose', 'createdAt'])
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column()
  email!: string;

  @Column()
  codeHash!: string;

  @Column({ type: 'varchar' })
  purpose!: VerificationPurpose;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
