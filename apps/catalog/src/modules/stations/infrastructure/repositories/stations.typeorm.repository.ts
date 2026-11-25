import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Station } from '../../domain/entities/station.entity';
import {
  GroupedStations,
  StationRepository,
} from '../../domain/repositories/station.repository';
import { StationOrmEntity } from '../entities/stations.typeorm.entity';
import { StationMapper } from '../mapper/station.mapper';

@Injectable()
export class TypeOrmStationRepository implements StationRepository {
  constructor(
    @InjectRepository(StationOrmEntity)
    private readonly repository: Repository<StationOrmEntity>,
  ) {}

  async save(station: Station): Promise<Station> {
    const saved = await this.repository.save(StationMapper.toOrmEntity(station));
    const persisted = await this.findById(saved.id);
    if (!persisted) throw new Error('Saved station could not be loaded');
    return persisted;
  }

  async findById(id: string): Promise<Station | null> {
    const station = await this.repository.findOne({
      where: { id },
      relations: { city: { governorate: true } },
    });
    return station ? StationMapper.toDomain(station) : null;
  }

  async findByName(name: string): Promise<Station[]> {
    const searchTerm = `%${name}%`;
    const stations = await this.repository.find({
      where: [{ name_en: ILike(searchTerm) }, { name_ar: ILike(searchTerm) }],
      relations: { city: { governorate: true } },
    });
    return stations.map(StationMapper.toDomain);
  }

  async findAllGroupedByGovernorate(): Promise<GroupedStations[]> {
    const stations = await this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.city', 'city')
      .innerJoinAndSelect('city.governorate', 'governorate')
      .where('station.isActive = :isActive', { isActive: true })
      .orderBy('governorate.name_ar', 'ASC')
      .addOrderBy('station.name_ar', 'ASC')
      .getMany();

    const grouped = new Map<string, GroupedStations>();

    for (const stationEntity of stations) {
      const station = StationMapper.toDomain(stationEntity);
      const city = station.city;
      const governorate = city.governorate;
      if (!governorate) {
        throw new Error(`City ${city.id} has no loaded governorate`);
      }

      if (!grouped.has(governorate.id)) {
        grouped.set(governorate.id, {
          id: governorate.id,
          name_ar: governorate.name_ar,
          name_en: governorate.name_en,
          stations: [],
        });
      }

      grouped.get(governorate.id)!.stations.push(station);
    }

    return Array.from(grouped.values());
  }
}