import { Governorate } from '../../../governorates/domain/entities/governorate.entity';

export class City {
  constructor(
    public readonly id: string,
    public name_ar: string,
    public name_en: string,
    public governorateId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public governorate: Governorate,
  ) {}
}
