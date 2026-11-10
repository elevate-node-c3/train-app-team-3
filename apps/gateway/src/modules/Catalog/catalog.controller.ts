
import { Controller, Get, Post, Patch, Body, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface StationService {
  createStation(data: any): Observable<any>;
  getStations(data: {}): Observable<any>;
  searchStations(data: { q: string }): Observable<any>;
  updateStation(data: any): Observable<any>;
  updateAlternativeNames(data: any): Observable<any>;
  updateStationStatus(data: any): Observable<any>;
}

interface GovernorateService {
  createGovernorate(data: any): Observable<any>;
  getGovernorates(data: {}): Observable<any>;
  getGovernorateById(data: { id: string }): Observable<any>;
  updateGovernorate(data: any): Observable<any>;
}

@Controller()
export class CatalogController implements OnModuleInit {
  private stationService!: StationService;
  private governorateService!: GovernorateService;

  constructor(@Inject('CATALOG_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.stationService = this.client.getService<StationService>('StationService');
    this.governorateService = this.client.getService<GovernorateService>('GovernorateService');
  }

  @Post('stations')
  createStation(@Body() dto: any) {
    return this.stationService.createStation(dto);
  }

  @Get('stations')
  getStations() {
    return this.stationService.getStations({});
  }

  @Get('stations/search')
  searchStations(@Query('q') q: string) {
    return this.stationService.searchStations({ q });
  }

  @Patch('stations/:id')
  updateStation(@Param('id') id: string, @Body() dto: any) {
    return this.stationService.updateStation({ id, ...dto });
  }

  @Patch('stations/:id/alternative-names')
  updateAlternativeNames(@Param('id') id: string, @Body() dto: any) {
    return this.stationService.updateAlternativeNames({
      id,
      alternativeNames: dto.alternativeNames,
    });
  }

  @Patch('stations/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: any) {
    return this.stationService.updateStationStatus({
      id,
      isActive: dto.isActive,
    });
  }

  @Post('governorates')
  createGovernorate(@Body() dto: any) {
    return this.governorateService.createGovernorate(dto);
  }

  @Get('governorates')
  getGovernorates() {
    return this.governorateService.getGovernorates({});
  }

  @Get('governorates/:id')
  getGovernorateById(@Param('id') id: string) {
    return this.governorateService.getGovernorateById({ id });
  }

  @Patch('governorates/:id')
  updateGovernorate(@Param('id') id: string, @Body() dto: any) {
    return this.governorateService.updateGovernorate({ id, ...dto });
  }
}
