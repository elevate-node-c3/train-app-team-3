
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Inject, OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import {
  StationService,
  GovernorateService,
  TrainTypeService,
  TrainClassService,
  TrainService,
  CoachLayoutService,
  CoachService,
  TimetableService,
  TimetableStopService,
} from './catalog.interfaces';

@Controller()
export class CatalogController implements OnModuleInit {
  private stationService!: StationService;
  private governorateService!: GovernorateService;
  private trainTypeService!: TrainTypeService;
  private trainClassService!: TrainClassService;
  private trainService!: TrainService;
  private coachLayoutService!: CoachLayoutService;
  private coachService!: CoachService;
  private timetableService!: TimetableService;
  private timetableStopService!: TimetableStopService;

  constructor(
    @Inject('CATALOG_SERVICE')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.stationService = this.client.getService<StationService>('StationService');
    this.governorateService = this.client.getService<GovernorateService>('GovernorateService');
    this.trainTypeService = this.client.getService<TrainTypeService>('TrainTypeService');
    this.trainClassService = this.client.getService<TrainClassService>('TrainClassService');
    this.trainService = this.client.getService<TrainService>('TrainService');
    this.coachLayoutService = this.client.getService<CoachLayoutService>('CoachLayoutService');
    this.coachService = this.client.getService<CoachService>('CoachService');
    this.timetableService = this.client.getService<TimetableService>('TimetableService');
    this.timetableStopService = this.client.getService<TimetableStopService>('TimetableStopService');
  }

  // Stations

  @Post('stations')
  createStation(@Body() dto: Parameters<StationService['createStation']>[0]) {
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
  updateStation(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<StationService['updateStation']>[0], 'id'>,
  ) {
    return this.stationService.updateStation({ id, ...dto });
  }

  @Patch('stations/:id/alternative-names')
  updateAlternativeNames(
    @Param('id') id: string,
    @Body() dto: { alternativeNames: string[] },
  ) {
    return this.stationService.updateAlternativeNames({ id, ...dto });
  }

  @Patch('stations/:id/status')
  updateStationStatus(
    @Param('id') id: string,
    @Body() dto: { isActive: boolean },
  ) {
    return this.stationService.updateStationStatus({ id, ...dto });
  }

  // Governorates

  @Post('governorates')
  createGovernorate(@Body() dto: { name: string }) {
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
  updateGovernorate(
    @Param('id') id: string,
    @Body() dto: { name: string },
  ) {
    return this.governorateService.updateGovernorate({ id, ...dto });
  }

  // Train Types

  @Post('train-types')
  createTrainType(@Body() dto: Parameters<TrainTypeService['createTrainType']>[0]) {
    return this.trainTypeService.createTrainType(dto);
  }

  @Get('train-types')
  getTrainTypes() {
    return this.trainTypeService.getTrainTypes({});
  }

  @Get('train-types/:id')
  getTrainType(@Param('id') id: string) {
    return this.trainTypeService.getTrainType({ id });
  }

  @Patch('train-types/:id')
  updateTrainType(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<TrainTypeService['updateTrainType']>[0], 'id'>,
  ) {
    return this.trainTypeService.updateTrainType({ id, ...dto });
  }

  @Delete('train-types/:id')
  deleteTrainType(@Param('id') id: string) {
    return this.trainTypeService.deleteTrainType({ id });
  }

  // Train Classes

  @Post('train-classes')
  createTrainClass(@Body() dto: Parameters<TrainClassService['createTrainClass']>[0]) {
    return this.trainClassService.createTrainClass(dto);
  }

  @Get('train-classes')
  getTrainClasses() {
    return this.trainClassService.getTrainClasses({});
  }

  @Get('train-classes/:id')
  getTrainClass(@Param('id') id: string) {
    return this.trainClassService.getTrainClass({ id });
  }

  @Patch('train-classes/:id')
  updateTrainClass(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<TrainClassService['updateTrainClass']>[0], 'id'>,
  ) {
    return this.trainClassService.updateTrainClass({ id, ...dto });
  }

  @Delete('train-classes/:id')
  deleteTrainClass(@Param('id') id: string) {
    return this.trainClassService.deleteTrainClass({ id });
  }

  // Trains

  @Post('trains')
  createTrain(@Body() dto: Parameters<TrainService['createTrain']>[0]) {
    return this.trainService.createTrain(dto);
  }

  @Get('trains')
  getTrains() {
    return this.trainService.getTrains({});
  }

  @Get('trains/:id')
  getTrain(@Param('id') id: string) {
    return this.trainService.getTrain({ id });
  }

  @Patch('trains/:id')
  updateTrain(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<TrainService['updateTrain']>[0], 'id'>,
  ) {
    return this.trainService.updateTrain({ id, ...dto });
  }

  @Delete('trains/:id')
  deleteTrain(@Param('id') id: string) {
    return this.trainService.deleteTrain({ id });
  }

  // Coach Layouts

  @Post('coach-layouts')
  createCoachLayout(@Body() dto: Parameters<CoachLayoutService['createCoachLayout']>[0]) {
    return this.coachLayoutService.createCoachLayout(dto);
  }

  @Get('coach-layouts')
  getCoachLayouts() {
    return this.coachLayoutService.getCoachLayouts({});
  }

  @Get('coach-layouts/:id')
  getCoachLayout(@Param('id') id: string) {
    return this.coachLayoutService.getCoachLayout({ id });
  }

  @Patch('coach-layouts/:id')
  updateCoachLayout(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<CoachLayoutService['updateCoachLayout']>[0], 'id'>,
  ) {
    return this.coachLayoutService.updateCoachLayout({ id, ...dto });
  }

  @Delete('coach-layouts/:id')
  deleteCoachLayout(@Param('id') id: string) {
    return this.coachLayoutService.deleteCoachLayout({ id });
  }

  // Coaches

  @Post('coaches')
  createCoach(@Body() dto: Parameters<CoachService['createCoach']>[0]) {
    return this.coachService.createCoach(dto);
  }

  @Get('coaches')
  getCoaches() {
    return this.coachService.getCoaches({});
  }

  @Get('coaches/:id')
  getCoach(@Param('id') id: string) {
    return this.coachService.getCoach({ id });
  }

  @Patch('coaches/:id')
  updateCoach(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<CoachService['updateCoach']>[0], 'id'>,
  ) {
    return this.coachService.updateCoach({ id, ...dto });
  }

  @Delete('coaches/:id')
  deleteCoach(@Param('id') id: string) {
    return this.coachService.deleteCoach({ id });
  }

  // Timetables

  @Post('timetables')
  createTimetable(@Body() dto: Parameters<TimetableService['createTimetable']>[0]) {
    return this.timetableService.createTimetable(dto);
  }

  @Get('timetables')
  getTimetables() {
    return this.timetableService.getTimetables({});
  }

  @Get('timetables/:id')
  getTimetable(@Param('id') id: string) {
    return this.timetableService.getTimetable({ id });
  }

  @Patch('timetables/:id')
  updateTimetable(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<TimetableService['updateTimetable']>[0], 'id'>,
  ) {
    return this.timetableService.updateTimetable({ id, ...dto });
  }

  @Delete('timetables/:id')
  deleteTimetable(@Param('id') id: string) {
    return this.timetableService.deleteTimetable({ id });
  }

  // Timetable Stops

  @Post('timetable-stops')
  createTimetableStop(@Body() dto: Parameters<TimetableStopService['createTimetableStop']>[0]) {
    return this.timetableStopService.createTimetableStop(dto);
  }

  @Get('timetable-stops')
  getTimetableStops() {
    return this.timetableStopService.getTimetableStops({});
  }

  @Get('timetable-stops/:id')
  getTimetableStop(@Param('id') id: string) {
    return this.timetableStopService.getTimetableStop({ id });
  }

  @Patch('timetable-stops/:id')
  updateTimetableStop(
    @Param('id') id: string,
    @Body() dto: Omit<Parameters<TimetableStopService['updateTimetableStop']>[0], 'id'>,
  ) {
    return this.timetableStopService.updateTimetableStop({ id, ...dto });
  }

  @Delete('timetable-stops/:id')
  deleteTimetableStop(@Param('id') id: string) {
    return this.timetableStopService.deleteTimetableStop({ id });
  }
}
