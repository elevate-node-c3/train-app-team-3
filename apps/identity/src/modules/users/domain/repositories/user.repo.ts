import { User } from "../entities/user.model.entity";

export interface CompleteUserProfile {
  fullName: string;
  nationalId: string;
  phone: string;
  profileType: string;
  nationality: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<[User[], number]>;
  save(user: User): Promise<void>;
  completeProfile(
    email: string,
    profile: CompleteUserProfile,
  ): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
