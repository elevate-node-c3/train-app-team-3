import { City } from '../../../cities/domain/entities/city.entity';

export class Station {
  constructor(
    public readonly id: string,
    public name_ar: string,
    public name_en: string,
    public address: string,
    public isActive: boolean,
    public cityId: string,
    public alternativeNames: string[],
    public readonly createdAt: Date,
    public updatedAt: Date,
    public city: City,
  ) {}
}
