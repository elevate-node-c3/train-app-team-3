import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    async findById(id: string): Promise<User | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOne({ where: { email } });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.repo.findOne({ where: { phone } });
    }

    async findByNationalId(nationalId: string): Promise<User | null> {
        return this.repo.findOne({ where: { nationalId } });
    }

    create(user: Partial<User>): User {
        return this.repo.create(user);
    }

    async save(user: User): Promise<User> {
        return this.repo.save(user);
    }
}