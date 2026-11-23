
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StationsService } from './stations.service';
import { UpdateStationDto } from './dto/update-station.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { AlternativeNamesDto } from './dto/alteranativeNames-station.dto';
import { ActivitingDto } from './dto/active.dto';

@Controller()
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @GrpcMethod('StationService', 'CreateStation')
  createStation(data: CreateStationDto) {
    return this.stationsService.createStation(data);
  }

  @GrpcMethod('StationService', 'GetStations')
  async getStations() {
    const governorates = await this.stationsService.getAllStation();
    return { governorates };
  }

  @GrpcMethod('StationService', 'SearchStations')
  async searchStations(data: { q: string }) {
    const stations = await this.stationsService.findByName(data.q);
    return { stations };
  }

  @GrpcMethod('StationService', 'UpdateStation')
  updateStation(data: UpdateStationDto & { id: string }) {
    const { id, ...updateData } = data;
    return this.stationsService.updateStation(id, updateData);
  }

  @GrpcMethod('StationService', 'UpdateAlternativeNames')
  updateAlternativeNames(data: AlternativeNamesDto & { id: string }) {
    return this.stationsService.updateAlternativeNames(
      data.id,
      data.alternativeNames,
    );
  }

  @GrpcMethod('StationService', 'UpdateStationStatus')
  updateStationStatus(data: ActivitingDto & { id: string }) {
    return this.stationsService.updateStatus(data.id, data.isActive);
  }
}
