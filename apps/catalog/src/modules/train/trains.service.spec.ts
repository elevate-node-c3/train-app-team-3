import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TRAIN_REPOSITORY } from './domain/repositories/train.repository';
import { TrainsService } from './trains.service';

describe('TrainsService', () => {
  let service: TrainsService;
  const repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TrainsService,
        { provide: TRAIN_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get(TrainsService);
  });

  it('creates a train through the domain repository', async () => {
    const created = { id: 'train-id' };
    repository.create.mockResolvedValue(created);

    await expect(
      service.create({ number: 12, typeOfTrainId: 'type-id' }),
    ).resolves.toBe(created);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        number: 12,
        typeOfTrain: expect.objectContaining({ id: 'type-id' }),
      }),
    );
  });

  it('reports a missing train type when creation is rejected by the repository', async () => {
    repository.create.mockResolvedValue(null);

    await expect(
      service.create({ number: 12, typeOfTrainId: 'missing-type' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
