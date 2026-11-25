import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LayoutSeatRepository as LayoutSeatRepositoryPort } from '../../domain/repositories/coach-layout.repository';
import { LayoutSeat } from '../entities/layout-seat.typeorm.entity';
import { adjacencyGroupOf } from '../../domain/policies/layout-adjacency';

type SeatData = Pick<LayoutSeat, 'seatNumber' | 'rowNumber' | 'position' | 'side'>;

@Injectable()
export class TypeOrmLayoutSeatRepository implements LayoutSeatRepositoryPort {
  constructor(
    @InjectRepository(LayoutSeat)
    private readonly repository: Repository<LayoutSeat>,
  ) {}

  async saveMany(layoutId: string, seats: SeatData[]): Promise<void> {
    const entities = seats.map((seat) =>
      this.repository.create({
        seatNumber: seat.seatNumber,
        rowNumber: seat.rowNumber,
        position: seat.position,
        side: seat.side,
        adjacencyGroup: adjacencyGroupOf(seat),
        coachLayout: { id: layoutId },
      }),
    );

    await this.repository.save(entities);
  }

  async deleteByLayoutId(layoutId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('"coachLayout_id" = :layoutId', { layoutId })
      .execute();
  }
}
