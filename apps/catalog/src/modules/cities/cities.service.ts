import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCityDto } from './application/dtos/create-city.dto';
import { UpdateCityDto } from './application/dtos/update-city.dto';
import { City } from './domain/entities/city.entity';
import {
  CITY_REPOSITORY,
  CityRepository,
} from './domain/repositories/city.repository';
import { GovernoratesService } from '../governorates/governorates.service';

@Injectable()
export class CitiesService {
  constructor(
    @Inject(CITY_REPOSITORY)
    private readonly repository: CityRepository,
    private readonly governorates: GovernoratesService,
  ) {}

  async create(data: CreateCityDto) {
    const governorate = await this.governorates.findById(data.governorateId);
    await this.ensureNamesAvailable(
      data.governorateId,
      data.name_ar,
      data.name_en,
    );
    const now = new Date();
    return this.repository.save(
      new City(
        randomUUID(),
        data.name_ar,
        data.name_en,
        data.governorateId,
        now,
        now,
        governorate,
      ),
    );
  }

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const city = await this.repository.findById(id);
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async update(id: string, data: UpdateCityDto) {
    const city = await this.findById(id);
    const governorateId = data.governorateId ?? city.governorateId;

    const governorate = data.governorateId
      ? await this.governorates.findById(data.governorateId)
      : city.governorate;

    await this.ensureNamesAvailable(
      governorateId,
      data.name_ar ?? city.name_ar,
      data.name_en ?? city.name_en,
      id,
    );

    city.name_ar = data.name_ar ?? city.name_ar;
    city.name_en = data.name_en ?? city.name_en;
    city.governorateId = governorateId;
    city.governorate = governorate;
    city.updatedAt = new Date();
    return this.repository.save(city);
  }

  private async ensureNamesAvailable(
    governorateId: string,
    name_ar: string,
    name_en: string,
    excludingId?: string,
  ) {
    const existing = await this.repository.findByNames(
      governorateId,
      name_ar,
      name_en,
    );

    if (existing.some((city) => city.id !== excludingId)) {
      throw new ConflictException('City already exists in this governorate');
    }
  }
}
