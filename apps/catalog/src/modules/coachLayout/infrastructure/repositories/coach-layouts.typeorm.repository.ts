import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CoachLayout as CoachLayoutModel } from '../../domain/entities/coach-layout.entity';
import { CoachLayoutRepository as CoachLayoutRepositoryPort } from '../../domain/repositories/coach-layout.repository';
import { CoachLayout } from '../entities/coach-layout.typeorm.entity';
import { CoachLayoutMapper } from '../mapper/coach-layout.mapper';

@Injectable()
export class TypeOrmCoachLayoutRepository implements CoachLayoutRepositoryPort {
  constructor(
    @InjectRepository(CoachLayout)
    private readonly repository: Repository<CoachLayout>,
  ) {}

  create(
    data: Pick<CoachLayoutModel, 'name_ar' | 'name_en' | 'description'>,
  ): CoachLayoutModel {
    const now = new Date();
    return new CoachLayoutModel(
      randomUUID(),
      data.name_ar,
      data.name_en,
      data.description,
      [],
      [],
      now,
      now,
    );
  }

  async save(layout: CoachLayoutModel): Promise<CoachLayoutModel> {
    const saved = await this.repository.save(CoachLayoutMapper.toOrmEntity(layout));
    const loaded = await this.findById(saved.id);
    if (!loaded) throw new Error('Saved coach layout could not be loaded');
    return loaded;
  }

  async findAll(): Promise<CoachLayoutModel[]> {
    const layouts = await this.repository.find({ relations: ['seats'] });
    return layouts.map(CoachLayoutMapper.toDomain);
  }

  async findById(id: string): Promise<CoachLayoutModel | null> {
    const layout = await this.repository.findOne({
      where: { id },
      relations: ['seats', 'coaches'],
    });
    return layout ? CoachLayoutMapper.toDomain(layout) : null;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
