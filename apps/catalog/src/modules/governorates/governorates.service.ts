
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateGovernorateDto } from './dto/create-governorate.dto';
import { UpdateGovernorateDto } from './dto/update-governorate.dto';
import { GovernoratesRepository } from './governorates.repository';
import { CacheService } from 'libs/cache/src';

@Injectable()
export class GovernoratesService {
  constructor(
    private readonly repo: GovernoratesRepository,
    private readonly cache: CacheService,
  ) {}

  private generateKey(id: string) {
    return `governorate:${id}`;
  }

  private normalizeName(name: string) {
    return name.trim().toLowerCase();
  }

  private async invalidateCache(id?: string) {
    if (id) {
      await this.cache.del(this.generateKey(id));
    }

    await this.cache.del('governorates:all');
    await this.cache.delByPattern('governorates:search:*');
  }

  async create(data: CreateGovernorateDto) {
    const governorate = await this.findByName(data.name);

    if (governorate) {
      throw new ConflictException('Governorate already exists');
    }

    const newGovernorate = await this.repo.create(data);

    await this.cache.set(
      this.generateKey(newGovernorate.id),
      JSON.stringify(newGovernorate),
      300,
    );

    await this.invalidateCache();

    return newGovernorate;
  }

  async findAll() {
    const key = 'governorates:all';

    const cachedGovernorates = await this.cache.get(key);

    if (cachedGovernorates) {
      return JSON.parse(cachedGovernorates);
    }

    const governorates = await this.repo.findAll();

    await this.cache.set(key, JSON.stringify(governorates), 300);

    return governorates;
  }

  async findByName(name: string) {
    const normalizedName = this.normalizeName(name);
    const key = `governorates:search:${normalizedName}`;

    const cachedGovernorate = await this.cache.get(key);

    if (cachedGovernorate) {
      return JSON.parse(cachedGovernorate);
    }

    const governorate = await this.repo.findByName(normalizedName);

    await this.cache.set(key, JSON.stringify(governorate), 300);

    return governorate;
  }

  async findById(id: string) {
    const key = this.generateKey(id);

    const cachedGovernorate = await this.cache.get(key);

    if (cachedGovernorate) {
      return JSON.parse(cachedGovernorate);
    }

    const governorate = await this.repo.findById(id);

    if (!governorate) {
      throw new NotFoundException('Governorate not found');
    }

    await this.cache.set(key, JSON.stringify(governorate), 300);

    return governorate;
  }

  async update(id: string, dto: UpdateGovernorateDto) {
    await this.findById(id);

    if (dto.name) {
      const existingGovernorate = await this.findByName(dto.name);

      if (existingGovernorate && existingGovernorate.id !== id) {
        throw new ConflictException('Governorate already exists');
      }
    }

    await this.repo.update(id, dto);

    await this.invalidateCache(id);

    return this.findById(id);
  }
}
