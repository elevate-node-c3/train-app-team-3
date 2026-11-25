
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateStationDto } from './application/dtos/create-station.dto';
import { UpdateStationDto } from './application/dtos/update-station.dto';
import { CacheService } from '../../../../../libs/cache/src';
import { City } from '../cities/domain/entities/city.entity';
import { CitiesService } from '../cities/cities.service';
import { Station } from './domain/entities/station.entity';
import {
  STATION_REPOSITORY,
  GroupedStations,
  StationRepository,
} from './domain/repositories/station.repository';

@Injectable()
export class StationsService {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly repo: StationRepository,
    private readonly cache: CacheService,
    private readonly cities: CitiesService,
  ) {}

  private generateKey(id: string) {
    return `station:${id}`;
  }

  private async invalidateCache(id?: string) {
    if (id) {
      await this.cache.del(this.generateKey(id));
    }

    await this.cache.del('station:grouped');
    await this.cache.delByPattern('station:search:*');
  }

  async updateStatus(id: string, status: boolean) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');

    station.isActive = status;
    station.updatedAt = new Date();
    const updatedStation = await this.repo.save(station);
    await this.invalidateCache(id);

    return updatedStation;
  }

  async updateAlternativeNames(id: string, names: string[]) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');

    station.alternativeNames = names;
    station.updatedAt = new Date();
    const updatedStation = await this.repo.save(station);
    await this.invalidateCache(id);

    return updatedStation;
  }

  async updateStation(id: string, data: UpdateStationDto) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');

    const city = data.cityId
      ? await this.validateCity(data.cityId)
      : station.city;
    station.name_ar = data.name_ar ?? station.name_ar;
    station.name_en = data.name_en ?? station.name_en;
    station.address = data.address ?? station.address;
    station.cityId = city.id;
    station.city = city;
    station.updatedAt = new Date();
    const updatedStation = await this.repo.save(station);
    await this.invalidateCache(id);

    return updatedStation;
  }

  async createStation(data: CreateStationDto) {
    const city = await this.validateCity(data.cityId);
    const now = new Date();
    const newStation = await this.repo.save(
      new Station(
        randomUUID(),
        data.name_ar,
        data.name_en,
        data.address,
        data.isActive ?? true,
        city.id,
        data.alternativeNames ?? [],
        now,
        now,
        city,
      ),
    );

    await this.cache.set(
      this.generateKey(newStation.id),
      JSON.stringify(newStation),
      300,
    );

    await this.invalidateCache();

    return newStation;
  }

  private validateCity(cityId: string): Promise<City> {
    return this.cities.findById(cityId);
  }

  async findByName(name: string) {
    const normalizedName = name.trim().toLowerCase();
    const key = `station:search:${normalizedName}`;

    const cachedStations = await this.cache.get<Station[]>(key);
    if (cachedStations) return cachedStations;

    const station = await this.repo.findByName(normalizedName);

    await this.cache.set(key, JSON.stringify(station), 300);

    return station;
  }

  async getAllStation() {
    const key = 'station:grouped';

    const cachedStations = await this.cache.get<GroupedStations[]>(key);
    if (cachedStations) return cachedStations;

    const stations = await this.repo.findAllGroupedByGovernorate();

    await this.cache.set(key, JSON.stringify(stations), 300);

    return stations;
  }
}
