import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { City } from '../../domain/entities/city.entity';
import { CityRepository } from '../../domain/repositories/city.repository';
import { CityOrmEntity } from '../entities/city.typeorm.entity';
import { CityMapper } from '../mapper/city.mapper';

@Injectable()
export class TypeOrmCitiesRepository implements CityRepository {
  constructor(
    @InjectRepository(CityOrmEntity)
    private readonly repository: Repository<CityOrmEntity>,
  ) {}

  async save(city: City): Promise<City> {
    const savedCity = await this.repository.save(CityMapper.toOrmEntity(city));
    const saved = await this.findById(savedCity.id);
    if (!saved) {
      throw new Error('Created city could not be loaded');
    }
    return saved;
  }

  async findAll(): Promise<City[]> {
    const cities = await this.repository.find({
      relations: { governorate: true },
      order: { name_en: 'ASC' },
    });
    return cities.map(CityMapper.toDomain);
  }

  async findById(id: string): Promise<City | null> {
    const city = await this.repository.findOne({
      where: { id },
      relations: { governorate: true },
    });
    return city ? CityMapper.toDomain(city) : null;
  }

  async findByNames(
    governorateId: string,
    name_ar: string,
    name_en: string,
  ): Promise<City[]> {
    const where: FindOptionsWhere<CityOrmEntity>[] = [
      { governorateId, name_ar },
      { governorateId, name_en },
    ];
    const cities = await this.repository.find({
      where,
      relations: { governorate: true },
    });
    return cities.map(CityMapper.toDomain);
  }
}
