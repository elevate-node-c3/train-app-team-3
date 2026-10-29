import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    CONDUCTOR = 'CONDUCTOR',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ unique: true })
    email!: string;

    @Column({ name: 'password_hash' })
    passwordHash!: string;

    @Column({ name: 'language', default: 'ar' })
    language!: string;

    @Column({ name: 'full_name', nullable: true })
    fullName?: string;

    @Index({ unique: true })
    @Column({ unique: true, nullable: true })
    phone?: string;

    @Index({ unique: true })
    @Column({ name: 'national_id', unique: true, nullable: true })
    nationalId?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role!: UserRole;

    @Column({ name: 'is_verified', default: false })
    isVerified!: boolean;

    @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
    verifiedAt?: Date | null;

    @Column({ name: 'is_suspended', default: false })
    isSuspended!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}