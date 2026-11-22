import { Governorate } from '../entities/governorate.entity';

export interface GovernorateRepository {
  save(governorate: Governorate): Promise<Governorate>;
  findAll(): Promise<Governorate[]>;
  findById(id: string): Promise<Governorate | null>;
  findByName(name: string): Promise<Governorate | null>;
}

export const GOVERNORATE_REPOSITORY = Symbol('GOVERNORATE_REPOSITORY');
