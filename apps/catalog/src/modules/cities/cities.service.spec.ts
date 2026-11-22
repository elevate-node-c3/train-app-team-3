import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CITY_REPOSITORY } from './domain/repositories/city.repository';
import { GovernoratesService } from '../governorates/governorates.service';
import { CitiesService } from './cities.service';

describe('CitiesService', () => {
  let service: CitiesService;
  const repository = {
    findByNames: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };
  const governorates = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CitiesService,
        { provide: CITY_REPOSITORY, useValue: repository },
        { provide: GovernoratesService, useValue: governorates },
      ],
    }).compile();

    service = module.get(CitiesService);
  });

  it('creates a bilingual city under an existing governorate', async () => {
    const input = {
      name_ar: 'الإسكندرية',
      name_en: 'Alexandria',
      governorateId: 'governorate-id',
    };
    const created = { id: 'city-id', ...input };
    governorates.findById.mockResolvedValue({ id: input.governorateId });
    repository.findByNames.mockResolvedValue([]);
    repository.save.mockResolvedValue(created);

    await expect(service.create(input)).resolves.toBe(created);
    expect(repository.save).toHaveBeenCalled();
  });

  it('rejects cities with a missing governorate or duplicate bilingual name', async () => {
    governorates.findById.mockRejectedValue(new NotFoundException());
    await expect(
      service.create({
        name_ar: 'مدينة',
        name_en: 'City',
        governorateId: 'missing-governorate',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    governorates.findById.mockResolvedValue({ id: 'governorate-id' });
    repository.findByNames.mockResolvedValue([{ id: 'existing-city' }]);
    await expect(
      service.create({
        name_ar: 'مدينة',
        name_en: 'City',
        governorateId: 'governorate-id',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
