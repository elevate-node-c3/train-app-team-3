import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Governorate } from './governorates.entity';
import { UpdateGovernorateDto } from './dto/update-governorate.dto';
import { CreateGovernorateDto } from './dto/create-governorate.dto';

@Injectable()
export class GovernoratesRepository {
  constructor(
    @InjectRepository(Governorate)
    private readonly repository: Repository<Governorate>,
  ) {}

  create(data: CreateGovernorateDto) {
    const governorate = this.repository.create(data);
    return this.repository.save(governorate);
  }

  findAll() {
    return this.repository.find({
      order: { name_ar: 'ASC' },
    });
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string) {
    return this.repository.findOne({
      where: [
        { name_ar: ILike(`%${name}%`) },
        { name_en: ILike(`%${name}%`) },
      ],
    });
  }

  update(id: string, data: UpdateGovernorateDto) {
    return this.repository.update(id, data);
  }
}