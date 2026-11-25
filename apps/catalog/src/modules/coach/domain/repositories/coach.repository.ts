import { Coach } from '../entities/coach.entity';

export interface CoachRepository {
  create(coach: Coach): Promise<Coach>;
  findAll(): Promise<Coach[]>;
  findById(id: string): Promise<Coach | null>;
  update(coach: Coach): Promise<Coach | null>;
  delete(id: string): Promise<void>;
}

export const COACH_REPOSITORY = Symbol('COACH_REPOSITORY');
