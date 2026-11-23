
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationsRepository } from './stations.repository';
import { CacheService } from 'libs/cache/src';

@Injectable()
export class StationsService {
  constructor(
    private readonly repo: StationsRepository,
    private readonly cache: CacheService,
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

    await this.repo.updateStatus(id, status);
    await this.invalidateCache(id);

    return this.repo.findById(id);
  }

  async updateAlternativeNames(id: string, names: string[]) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');

    await this.repo.updateAlternativeNames(id, names);
    await this.invalidateCache(id);

    return this.repo.findById(id);
  }

  async updateStation(id: string, data: UpdateStationDto) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');

    await this.repo.updateStation(id, data);
    await this.invalidateCache(id);

    return this.repo.findById(id);
  }

  async createStation(data: CreateStationDto) {
    const newStation = await this.repo.create(data);

    await this.cache.set(
      this.generateKey(newStation.id),
      JSON.stringify(newStation),
      300,
    );

    await this.invalidateCache();

    return newStation;
  }

  async findByName(name: string) {
    const normalizedName = name.trim().toLowerCase();
    const key = `station:search:${normalizedName}`;

    const cachedStation = await this.cache.get(key);
    if (cachedStation) return JSON.parse(cachedStation);

    const station = await this.repo.findByName(normalizedName);

    await this.cache.set(key, JSON.stringify(station), 300);

    return station;
  }

  async getAllStation() {
    const key = 'station:grouped';

    const cachedStations = await this.cache.get(key);
    if (cachedStations) return JSON.parse(cachedStations);

    const stations = await this.repo.getAllGroupedByGovernorate();

    await this.cache.set(key, JSON.stringify(stations), 300);

    return stations;
  }
}
