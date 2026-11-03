
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GovernoratesService } from './governorates.service';
import { Governorate } from './governorates.entity';

@Controller()
export class GovernoratesController {
  constructor(private readonly governoratesService: GovernoratesService) {}

  private toResponse(governorate: Governorate) {
    return {
      id: governorate.id,
      name: governorate.name,
      createdAt: governorate.createdAt.toISOString(),
      updatedAt: governorate.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('GovernorateService', 'CreateGovernorate')
  async createGovernorate(data: { name: string }) {
    const governorate = await this.governoratesService.create(data);
    return this.toResponse(governorate);
  }

  @GrpcMethod('GovernorateService', 'GetGovernorates')
  async getGovernorates() {
    const governorates = await this.governoratesService.findAll();
    return { governorates: governorates.map((governorate) => this.toResponse(governorate)) };
  }

  @GrpcMethod('GovernorateService', 'GetGovernorateById')
  async getGovernorateById(data: { id: string }) {
    const governorate = await this.governoratesService.findById(data.id);
    return this.toResponse(governorate);
  }

  @GrpcMethod('GovernorateService', 'UpdateGovernorate')
  async updateGovernorate(data: { id: string; name: string }) {
    const governorate = await this.governoratesService.update(data.id, {
      name: data.name,
    });
    return this.toResponse(governorate);
  }
}
