import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) { }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findById(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findByEmail(email);
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.usersRepository.findByPhone(phone);
    }

    async findByNationalId(nationalId: string): Promise<User | null> {
        return this.usersRepository.findByNationalId(nationalId);
    }

    create(userData: Partial<User>): User {
        return this.usersRepository.create(userData);
    }

    async save(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }
}