import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { COACH_REPOSITORY } from './domain/repositories/coach.repository';
import { CoachesService } from './coaches.service';

describe('CoachesService', () => {
  let service: CoachesService;
  const repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CoachesService,
        { provide: COACH_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get(CoachesService);
  });

  it('creates a coach through the domain repository', async () => {
    repository.create.mockImplementation(async (coach) => coach);

    await service.create({
      coachNumber: 3,
      trainId: 'train-id',
      classOfTrainId: 'class-id',
      coachLayoutId: 'layout-id',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coachNumber: 3,
        train: { id: 'train-id' },
        classOfTrain: { id: 'class-id' },
        coachLayout: { id: 'layout-id' },
      }),
    );
  });

  it('rejects updates for a missing coach', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update('missing-coach', {
        coachNumber: 4,
        trainId: 'train-id',
        classOfTrainId: 'class-id',
        coachLayoutId: 'layout-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
