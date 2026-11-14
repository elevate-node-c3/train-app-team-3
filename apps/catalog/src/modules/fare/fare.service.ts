import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FareRepository } from './fare.repository';
import { CreateFareDto } from './dto/create-fare.dto';
import { UpdateFareDto } from './dto/update-fare.dto';

@Injectable()
export class FareService {
  constructor(private readonly fareRepository: FareRepository) {}

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

    return this.fareRepository.save(
      this.fareRepository.create({
        priceInPiasters: dto.priceInPiasters,
        effectiveFrom: new Date(),
        train: { id: dto.trainId },
        trainClass: { id: dto.trainClassId },
        originStation: { id: dto.originStationId },
        destinationStation: { id: dto.destinationStationId },
      }),
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