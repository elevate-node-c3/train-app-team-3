import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { User } from "./domain/entities/user.model.entity";
import {
  USER_REPOSITORY,
  CompleteUserProfile,
  UserRepository,
} from "./domain/repositories/user.repo";

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  lang: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: UserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(userData: CreateUserInput): Promise<User> {
    const now = new Date();
    const user = new User(
      randomUUID(),
      userData.email,
      userData.passwordHash,
      true,
      false,
      now,
      now,
      userData.lang,
    );
    await this.usersRepository.save(user);
    return user;
  }

  async save(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }

  async completeProfile(
    email: string,
    profile: CompleteUserProfile,
  ): Promise<User | null> {
    return this.usersRepository.completeProfile(email, profile);
  }
}
