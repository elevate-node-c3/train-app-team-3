export class Governorate {
  constructor(
    public readonly id: string,
    public name_ar: string,
    public name_en: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
