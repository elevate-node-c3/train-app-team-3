import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'refresh_token_hash' })
    refreshTokenHash!: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt!: Date;

    @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
    revokedAt?: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
