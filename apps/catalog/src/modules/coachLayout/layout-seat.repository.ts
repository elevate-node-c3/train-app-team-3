import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LayoutSeat } from './layout-seat.entity';
import { adjacencyGroupOf } from './layout-adjacency';

type SeatData = Pick<LayoutSeat, 'seatNumber' | 'rowNumber' | 'position' | 'side'>;

@Injectable()
export class LayoutSeatRepository {
  constructor(
    @InjectRepository(LayoutSeat)
    private readonly repository: Repository<LayoutSeat>,
  ) {}

  saveMany(layoutId: string, seats: SeatData[]) {
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

    return this.repository.save(entities);
  }

  async deleteByLayoutId(layoutId: string) {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('"coachLayout_id" = :layoutId', { layoutId })
      .execute();
  }
}