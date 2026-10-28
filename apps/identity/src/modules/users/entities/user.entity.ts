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

    @Column({ name: 'full_name' })
    fullName!: string;

    @Index({ unique: true })
    @Column({ unique: true })
    phone!: string;

    @Index({ unique: true })
    @Column({ name: 'national_id', unique: true })
    nationalId!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role!: UserRole;

    @Column({ name: 'is_verified', default: false })
    isVerified!: boolean;

    @Column({ name: 'is_suspended', default: false })
    isSuspended!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}