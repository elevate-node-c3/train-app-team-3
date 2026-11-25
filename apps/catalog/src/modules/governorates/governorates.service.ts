
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateGovernorateDto } from './application/dtos/create-governorate.dto';
import { UpdateGovernorateDto } from './application/dtos/update-governorate.dto';
import { CacheService } from '../../../../../libs/cache/src';
import { Governorate } from './domain/entities/governorate.entity';
import {
  GOVERNORATE_REPOSITORY,
  GovernorateRepository,
} from './domain/repositories/governorate.repository';

@Injectable()
export class GovernoratesService {
  constructor(
    @Inject(GOVERNORATE_REPOSITORY)
    private readonly repo: GovernorateRepository,
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
    if (
      (await this.repo.findByName(data.name_ar)) ||
      (await this.repo.findByName(data.name_en))
    ) {
      throw new ConflictException('Governorate already exists');
    }

    const now = new Date();
    const newGovernorate = await this.repo.save(
      new Governorate(
        randomUUID(),
        data.name_ar,
        data.name_en,
        now,
        now,
      ),
    );

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

    const cachedGovernorates = await this.cache.get<Governorate[]>(key);

    if (cachedGovernorates) {
      return cachedGovernorates;
    }

    const governorates = await this.repo.findAll();

    await this.cache.set(key, JSON.stringify(governorates), 300);

    return governorates;
  }

  async findByName(name: string) {
    const normalizedName = this.normalizeName(name);
    const key = `governorates:search:${normalizedName}`;

    const cachedGovernorate = await this.cache.get<Governorate>(key);

    if (cachedGovernorate) {
      return cachedGovernorate;
    }

    const governorate = await this.repo.findByName(normalizedName);

    await this.cache.set(key, JSON.stringify(governorate), 300);

    return governorate;
  }

  async findById(id: string) {
    const key = this.generateKey(id);

    const cachedGovernorate = await this.cache.get<Governorate>(key);

    if (cachedGovernorate) {
      return cachedGovernorate;
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

    const governorate = await this.findById(id);

    for (const name of [dto.name_ar, dto.name_en]) {
      if (!name) continue;
      const existingGovernorate = await this.findByName(name);
      if (existingGovernorate && existingGovernorate.id !== id) {
        throw new ConflictException('Governorate already exists');
      }
    }

    governorate.name_ar = dto.name_ar ?? governorate.name_ar;
    governorate.name_en = dto.name_en ?? governorate.name_en;
    governorate.updatedAt = new Date();
    await this.repo.save(governorate);

    await this.invalidateCache(id);

    return this.findById(id);
  }
}
