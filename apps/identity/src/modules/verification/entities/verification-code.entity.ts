import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('verification_codes')
export class VerificationCode {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Index()
    @Column({ name: 'email' })
    email!: string;

    @Column({ name: 'code_hash' })
    codeHash!: string;

    @Column({ name: 'purpose', default: 'email-verification' })
    purpose!: string;

    @Column({ name: 'attempts', default: 0 })
    attempts!: number;

    @Column({ name: 'max_attempts', default: 5 })
    maxAttempts!: number;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt!: Date;

    @Column({ name: 'used_at', type: 'timestamp', nullable: true })
    usedAt?: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
