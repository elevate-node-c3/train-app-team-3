import { City } from '../entities/city.entity';

export interface CityRepository {
  save(city: City): Promise<City>;
  findAll(): Promise<City[]>;
  findById(id: string): Promise<City | null>;
  findByNames(
    governorateId: string,
    name_ar: string,
    name_en: string,
  ): Promise<City[]>;
}

export const CITY_REPOSITORY = Symbol('CITY_REPOSITORY');
