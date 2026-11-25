import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCoachLayoutDto } from './application/dtos/create-coach-layout.dto';
import { UpdateCoachLayoutDto } from './application/dtos/update-coach-layout.dto';
import {
  COACH_LAYOUT_REPOSITORY,
  CoachLayoutRepository,
  LAYOUT_SEAT_REPOSITORY,
  LayoutSeatRepository,
} from './domain/repositories/coach-layout.repository';
import { validateLayoutSeats } from './domain/policies/layout-adjacency';

@Injectable()
export class CoachLayoutService {
  constructor(
    @Inject(COACH_LAYOUT_REPOSITORY)
    private readonly layoutRepository: CoachLayoutRepository,
    @Inject(LAYOUT_SEAT_REPOSITORY)
    private readonly seatRepository: LayoutSeatRepository,
  ) {}

  private assertValidSeats(seats: CreateCoachLayoutDto['seats']) {
    const problems = validateLayoutSeats(seats ?? []);
    if (problems.length) {
      throw new BadRequestException(`Invalid layout: ${problems.join('; ')}`);
    }
  }

  async create(dto: CreateCoachLayoutDto) {
    const { seats, ...layoutData } = dto;

    this.assertValidSeats(seats);

    const layout = this.layoutRepository.create(layoutData);
    const savedLayout = await this.layoutRepository.save(layout);

    await this.seatRepository.saveMany(savedLayout.id, seats);

    return this.findOne(savedLayout.id);
  }

  async findAll() {
    const layouts = await this.layoutRepository.findAll();

    return layouts.map((layout) => ({
      ...layout,
      capacity: layout.seats.length,
    }));
  }

  async findOne(id: string) {
    const layout = await this.layoutRepository.findById(id);

    if (!layout) {
      throw new NotFoundException('Coach layout not found');
    }

    return {
      ...layout,
      capacity: layout.seats.length,
    };
  }

  async update(id: string, dto: UpdateCoachLayoutDto) {
    const layout = await this.layoutRepository.findById(id);

    if (!layout) {
      throw new NotFoundException('Coach layout not found');
    }

    const { seats, ...layoutData } = dto;

    if (seats !== undefined) this.assertValidSeats(seats);

    if (layoutData.name_ar !== undefined) {
      layout.name_ar = layoutData.name_ar;
    }
    if (layoutData.name_en !== undefined) {
      layout.name_en = layoutData.name_en;
    }
    if (layoutData.description !== undefined) {
      layout.description = layoutData.description;
    }
    await this.layoutRepository.save(layout);

    if (seats !== undefined) {
      await this.seatRepository.deleteByLayoutId(id);
      await this.seatRepository.saveMany(id, seats);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const layout = await this.layoutRepository.findById(id);

    if (!layout) {
      throw new NotFoundException('Coach layout not found');
    }

    if (layout.coaches?.length) {
      throw new BadRequestException(
        'Cannot delete a layout assigned to coaches',
      );
    }

    await this.layoutRepository.remove(id);

    return { message: 'Coach layout deleted successfully' };
  }
}