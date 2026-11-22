import { Fare } from '../../domain/entities/fare.entity';
import { Fare as FareOrmEntity } from '../entities/fare.typeorm.entity';

export class FareMapper {
  static toDomain(entity: FareOrmEntity): Fare {
    return new Fare(
      entity.id,
      entity.priceInPiasters,
      entity.effectiveFrom,
      { ...entity.train },
      { ...entity.trainClass },
      { ...entity.originStation },
      { ...entity.destinationStation },
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(fare: Fare): FareOrmEntity {
    const entity = new FareOrmEntity();
    if (fare.id) entity.id = fare.id;
    entity.priceInPiasters = fare.priceInPiasters;
    entity.effectiveFrom = fare.effectiveFrom;
    entity.train = { id: fare.train.id } as FareOrmEntity['train'];
    entity.trainClass = { id: fare.trainClass.id } as FareOrmEntity['trainClass'];
    entity.originStation = { id: fare.originStation.id } as FareOrmEntity['originStation'];
    entity.destinationStation = { id: fare.destinationStation.id } as FareOrmEntity['destinationStation'];
    return entity;
  }
}
