import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  GenerationInputs,
  GenerationTimetable,
} from './domain/entities/trip-generation.model';
import {
  TRIP_GENERATION_REPOSITORY,
  TripGenerationUniqueConflictError,
} from './domain/repositories/trip-generation.repository';
import { TripGenerationService } from './trip-generation.service';

describe('TripGenerationService', () => {
  let service: TripGenerationService;
  const repository = {
    findPublishedTimetables: jest.fn(),
    findTimetableById: jest.fn(),
    createTrip: jest.fn(),
  };
  const serviceDate = '2026-11-20';
  const timetable: GenerationTimetable = {
    id: 'timetable-id',
    status: true,
    publishedAt: new Date(),
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    workingDays: ['friday'],
    version: 1,
    train: {
      id: 'train-id',
      number: 7,
      type: { id: 'type-id', nameAr: 'قطار', nameEn: 'Train' },
    },
  };
  const inputs: GenerationInputs = {
    stops: [
      { stationId: 'origin', arrivalTime: null, departureTime: '10:00' },
      { stationId: 'destination', arrivalTime: '11:00', departureTime: null },
    ],
    coaches: [
      {
        id: 'coach-id',
        coachNumber: 1,
        classOfTrain: { id: 'class-id', nameAr: 'درجة', nameEn: 'Class' },
        coachLayout: {
          id: 'layout-id',
          seats: [
            {
              seatNumber: '1',
              rowNumber: 1,
              position: 1,
              side: 'LEFT',
              adjacencyGroup: 'R1-LEFT',
            },
          ],
        },
      },
    ],
    fares: [
      {
        classId: 'class-id',
        originStationId: 'origin',
        destinationStationId: 'destination',
        price: 100,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TripGenerationService,
        { provide: TRIP_GENERATION_REPOSITORY, useValue: repository },
      ],
    }).compile();
    service = module.get(TripGenerationService);
  });

  it('rejects invalid service dates before querying the repository', async () => {
    await expect(service.generateForDate('2026-02-30')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.findPublishedTimetables).not.toHaveBeenCalled();
  });

  it('skips when the repository finds an existing trip in its generation transaction', async () => {
    repository.findPublishedTimetables.mockResolvedValue([timetable]);
    repository.createTrip.mockResolvedValue(null);

    await expect(service.generateForDate(serviceDate)).resolves.toEqual({
      generated: 0,
      skipped: 1,
      failed: [],
    });
    expect(repository.createTrip).toHaveBeenCalledWith(
      timetable,
      serviceDate,
      expect.any(Function),
    );
  });

  it('treats a concurrent unique conflict as an idempotent scheduled skip', async () => {
    repository.findPublishedTimetables.mockResolvedValue([timetable]);
    repository.createTrip.mockImplementation((_timetable, _date, buildCommand) => {
      expect(buildCommand(inputs)).toEqual(
        expect.objectContaining({
          timetable,
          serviceDate,
          stops: expect.arrayContaining([
            expect.objectContaining({ stationId: 'origin', position: 1 }),
            expect.objectContaining({ stationId: 'destination', position: 2 }),
          ]),
        }),
      );
      throw new TripGenerationUniqueConflictError();
    });

    await expect(service.generateForDate(serviceDate)).resolves.toEqual({
      generated: 0,
      skipped: 1,
      failed: [],
    });
  });

  it('reports an existing trip as a conflict for a one-trip request', async () => {
    repository.findTimetableById.mockResolvedValue(timetable);
    repository.createTrip.mockResolvedValue(null);

    await expect(service.generateOne(timetable.id, serviceDate)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
