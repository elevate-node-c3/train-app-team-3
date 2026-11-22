import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDatedTripDto } from './application/dtos/create-dated-trip.dto';
import { UpdateDatedTripDto } from './application/dtos/update-dated-trip.dto';
import { TripGenerationService } from '../trip-generation/trip-generation.service';
import { DatedTripStatus } from './domain/entities/dated-trip.entity';
import {
  DATED_TRIP_REPOSITORY,
  DatedTripRepository,
} from './domain/repositories/dated-trip.repository';

@Injectable()
export class DatedTripService {
  constructor(
    @Inject(DATED_TRIP_REPOSITORY)
    private readonly tripRepository: DatedTripRepository,
    private readonly tripGeneration: TripGenerationService,
  ) {}

  async create(dto: CreateDatedTripDto) {
    const trainId = await this.tripRepository.findTimetableTrainId(dto.timetableId);
    if (!trainId) {
      throw new NotFoundException('Timetable not found');
    }

    if (trainId !== dto.trainId) {
      throw new BadRequestException('Timetable does not belong to this train');
    }

    const trip = await this.tripGeneration.generateOne(dto.timetableId, dto.serviceDate);

    return this.findOne(trip.id);
  }

  async findAll() {
    return this.tripRepository.findAll();
  }

  async findOne(id: string) {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw new NotFoundException('Dated trip not found');
    }

    return trip;
  }

  /** The only supported change: withdraw a trip that will no longer run. */
  async update(id: string, dto: UpdateDatedTripDto) {
    if (dto.status !== DatedTripStatus.CANCELLED) {
      throw new BadRequestException(
        'Trips are published when generated; the only supported change is CANCELLED (withdraw)',
      );
    }

    await this.withdraw(id);

    return this.findOne(id);
  }

  /** Marks the trip withdrawn and announces it in the same transaction. Safe to call twice. */
  async withdraw(id: string) {
    await this.tripRepository.withdraw(id);
  }

  async remove(id: string) {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw new NotFoundException('Dated trip not found');
    }

    if (trip.status !== DatedTripStatus.DRAFT) {
      throw new BadRequestException(
        'Only a draft trip can be deleted; withdraw a published trip instead',
      );
    }

    await this.tripRepository.delete(id);

    return { message: 'Dated trip deleted successfully' };
  }
}