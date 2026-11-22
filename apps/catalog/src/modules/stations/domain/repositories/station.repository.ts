import { Station } from '../entities/station.entity';

export interface GroupedStations {
  id: string;
  name_ar: string;
  name_en: string;
  stations: Station[];
}

export interface StationRepository {
  save(station: Station): Promise<Station>;
  findById(id: string): Promise<Station | null>;
  findByName(name: string): Promise<Station[]>;
  findAllGroupedByGovernorate(): Promise<GroupedStations[]>;
}

export const STATION_REPOSITORY = Symbol('STATION_REPOSITORY');
