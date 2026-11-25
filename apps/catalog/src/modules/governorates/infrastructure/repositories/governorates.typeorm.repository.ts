import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Governorate } from '../../domain/entities/governorate.entity';
import { GovernorateRepository } from '../../domain/repositories/governorate.repository';
import { GovernorateOrmEntity } from '../entities/governorates.typeorm.entity';
import { GovernorateMapper } from '../mapper/governorate.mapper';

@Injectable()
export class TypeOrmGovernorateRepository implements GovernorateRepository {
  constructor(
    @InjectRepository(GovernorateOrmEntity)
    private readonly repository: Repository<GovernorateOrmEntity>,
  ) {}

  async save(governorate: Governorate): Promise<Governorate> {
    const saved = await this.repository.save(
      GovernorateMapper.toOrmEntity(governorate),
    );
    return GovernorateMapper.toDomain(saved);
  }

  async findAll(): Promise<Governorate[]> {
    const governorates = await this.repository.find({
      order: { name_ar: 'ASC' },
    });
    return governorates.map(GovernorateMapper.toDomain);
  }

  async findById(id: string): Promise<Governorate | null> {
    const governorate = await this.repository.findOne({ where: { id } });
    return governorate ? GovernorateMapper.toDomain(governorate) : null;
  }

  async findByName(name: string): Promise<Governorate | null> {
    const governorate = await this.repository.findOne({
      where: [
        { name_ar: ILike(`%${name}%`) },
        { name_en: ILike(`%${name}%`) },
      ],
    });
    return governorate ? GovernorateMapper.toDomain(governorate) : null;
  }
}