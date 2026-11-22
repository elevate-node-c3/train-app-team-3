import { CoachLayout } from '../entities/coach-layout.entity';

export const COACH_LAYOUT_REPOSITORY = Symbol('COACH_LAYOUT_REPOSITORY');
export const LAYOUT_SEAT_REPOSITORY = Symbol('LAYOUT_SEAT_REPOSITORY');

export interface CoachLayoutRepository {
  create(data: Pick<CoachLayout, 'name_ar' | 'name_en' | 'description'>): CoachLayout;
  save(layout: CoachLayout): Promise<CoachLayout>;
  findAll(): Promise<CoachLayout[]>;
  findById(id: string): Promise<CoachLayout | null>;
  remove(id: string): Promise<void>;
}

export interface LayoutSeatRepository {
  saveMany(
    layoutId: string,
    seats: Pick<CoachLayout['seats'][number], 'seatNumber' | 'rowNumber' | 'position' | 'side'>[],
  ): Promise<void>;
  deleteByLayoutId(layoutId: string): Promise<void>;
}
