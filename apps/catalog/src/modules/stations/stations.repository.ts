
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

  create(data: CreateStationDto) {
    return this.repository.save(data);
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

  findByName(name: string) {
    return this.repository
      .createQueryBuilder('station')
      .where('station.name LIKE :name', { name: `%${name}%` })
      .orWhere('station.alternativeNames LIKE :name', { name: `%${name}%` })
      .getMany();
  }

  async getAllGroupedByGovernorate() {
    const stations = await this.repository.find({
      where: { isActive: true },
      relations: { governorate: true },
      order: {
        governorate: { name: 'ASC' },
        name: 'ASC',
      },
    });

    const grouped = new Map<string, {
      id: string;
      name: string;
      stations: Omit<Station, 'governorate'>[];
    }>();

    for (const station of stations) {
      const { governorate, ...stationData } = station;

      if (!grouped.has(governorate.id)) {
        grouped.set(governorate.id, {
          id: governorate.id,
          name: governorate.name,
          stations: [],
        });
      }

      grouped.get(governorate.id)!.stations.push(stationData);
    }

    return Array.from(grouped.values());
  }
  
}
