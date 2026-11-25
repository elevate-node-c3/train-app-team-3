import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFareDto } from './application/dtos/create-fare.dto';
import { UpdateFareDto } from './application/dtos/update-fare.dto';
import { Fare } from './domain/entities/fare.entity';
import {
  FARE_REPOSITORY,
  FareRepository,
} from './domain/repositories/fare.repository';

@Injectable()
export class FareService {
  constructor(
    @Inject(FARE_REPOSITORY)
    private readonly fareRepository: FareRepository,
  ) {}

  /** Adds a fare version taking effect now. Earlier versions stay, so history is answerable. */
  async create(dto: CreateFareDto) {
    if (dto.originStationId === dto.destinationStationId) {
      throw new BadRequestException('Origin and destination stations must be different');
    }

    const current = await this.fareRepository.findCurrent(
      dto.trainId,
      dto.trainClassId,
      dto.originStationId,
      dto.destinationStationId,
    );

    if (current && current.priceInPiasters === dto.priceInPiasters) {
      throw new ConflictException('This fare is already the current one');
    }

    const now = new Date();
    return this.fareRepository.save(
      new Fare(
        null,
        dto.priceInPiasters,
        now,
        { id: dto.trainId },
        { id: dto.trainClassId },
        { id: dto.originStationId },
        { id: dto.destinationStationId },
        now,
        now,
      ),
    );
  }

  findAll() {
    return this.fareRepository.findAll();
  }

  async findOne(id: string) {
    const fare = await this.fareRepository.findById(id);
    if (!fare) throw new NotFoundException('Fare not found');
    return fare;
  }

  /** A "change" is a new version of the same (train, class, origin, destination). */
  async update(id: string, dto: UpdateFareDto) {
    const fare = await this.findOne(id);

    return this.create({
      trainId: fare.train.id,
      trainClassId: fare.trainClass.id,
      originStationId: fare.originStation.id,
      destinationStationId: fare.destinationStation.id,
      priceInPiasters: dto.priceInPiasters,
    });
  }

  /** The price at a given instant (Sprint 3's quote reads the current one). */
  async priceAt(
    trainId: string,
    trainClassId: string,
    originStationId: string,
    destinationStationId: string,
    at: Date = new Date(),
  ) {
    const fare = await this.fareRepository.findCurrent(
      trainId,
      trainClassId,
      originStationId,
      destinationStationId,
      at,
    );
    if (!fare) throw new NotFoundException('No fare in force for this pair at that time');
    return fare.priceInPiasters;
  }
}