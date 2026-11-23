
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

interface CoachId {
  id: string;
}

type UpdateCoachRequest = CoachId & UpdateCoachDto;

@Controller()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @GrpcMethod('CoachService', 'CreateCoach')
  createCoach(data: CreateCoachDto) {
    return this.coachesService.create(data);
  }

  @GrpcMethod('CoachService', 'GetCoaches')
  getCoaches() {
    return this.coachesService.findAll();
  }

  @GrpcMethod('CoachService', 'GetCoach')
  getCoach(data: CoachId) {
    return this.coachesService.findOne(data.id);
  }

  @GrpcMethod('CoachService', 'UpdateCoach')
  updateCoach(data: UpdateCoachRequest) {
    const { id, ...dto } = data;
    return this.coachesService.update(id, dto);
  }

  @GrpcMethod('CoachService', 'DeleteCoach')
  deleteCoach(data: CoachId) {
    return this.coachesService.remove(data.id);
  }
}
