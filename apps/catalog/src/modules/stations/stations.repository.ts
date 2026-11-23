import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './stations.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsRepository {
  constructor(
    @InjectRepository(Station)
    private readonly repository: Repository<Station>,
  ) {}

  async create(data: CreateStationDto) {
    const station = this.repository.create(data);
    return this.repository.save(station);
  }

  updateStation(id: string, data: UpdateStationDto) {
    return this.repository.update(id, data);
  }

  updateStatus(id: string, status: boolean) {
    return this.repository.update(id, { isActive: status });
  }

  updateAlternativeNames(id: string, names: string[]) {
    return this.repository.update(id, { alternativeNames: names });
  }

  findById(id: string) {
    return this.repository.findOneBy({ id });
  }

  async findByName(name: string) {
    const searchTerm = `%${name}%`;
    
    return this.repository
      .createQueryBuilder('station')
      .where('station.name LIKE :name', { name: searchTerm })
      .orWhere(':nameAny = ANY(station.alternativeNames)', { nameAny: name })
      .getMany();
  }

  async getAllGroupedByGovernorate() {
    const stations = await this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.governorate', 'governorate')
      .where('station.isActive = :isActive', { isActive: true })
      .orderBy('governorate.name_ar', 'ASC')
      .addOrderBy('station.name', 'ASC')
      .getMany();

    const grouped = new Map<string, {
      id: string;
      name_ar: string;
      name_en: string;
      stations: Omit<Station, 'governorate'>[];
    }>();

    for (const station of stations) {
      const { governorate, ...stationData } = station;

      if (!grouped.has(governorate.id)) {
        grouped.set(governorate.id, {
          id: governorate.id,
          name_ar: governorate.name_ar,
          name_en: governorate.name_en,
          stations: [],
        });
      }

      grouped.get(governorate.id)!.stations.push(stationData);
    }

    return Array.from(grouped.values());
  }
}