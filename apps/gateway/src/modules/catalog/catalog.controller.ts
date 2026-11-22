import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  OnModuleInit,
  Param,
  Patch,
  Post,
  Query,
  ServiceUnavailableException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import {
  CreateStationDto,
  SearchStationRecordsDto,
  UpdateAlternativeNamesDto,
  UpdateStationDto,
  UpdateStationStatusDto,
} from "./dtos/station.dto";
import {
  CreateGovernorateDto,
  UpdateGovernorateDto,
} from "./dtos/governorate.dto";
import { CreateCityDto, UpdateCityDto } from "./dtos/city.dto";
import { CreateTrainTypeDto, UpdateTrainTypeDto } from "./dtos/train-type.dto";
import {
  CreateTrainClassDto,
  UpdateTrainClassDto,
} from "./dtos/train-class.dto";
import { CreateTrainDto, UpdateTrainDto } from "./dtos/train.dto";
import {
  CreateCoachLayoutDto,
  UpdateCoachLayoutDto,
} from "./dtos/coach-layout.dto";
import { CreateCoachDto, UpdateCoachDto } from "./dtos/coach.dto";
import { CreateTimetableDto, UpdateTimetableDto } from "./dtos/timetable.dto";
import {
  CreateTimetableStopDto,
  UpdateTimetableStopDto,
} from "./dtos/timetable-stop.dto";
import { CatalogServiceClient } from "@app/contracts/generated/catalog";
import { toCatalogGrpcMessage } from "../../../../../libs/contracts/src/catalog-message.mapper";
import { firstValueFrom, TimeoutError, timeout } from "rxjs";
import { SearchTripsDto } from "./dtos/trip-search.dto";
import { VerifiedSearchGuard } from "../../common/guards/verified-search.guard";

const CATALOG_SEARCH_DEADLINE_MS = 5_000;

@Controller()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class CatalogController implements OnModuleInit {
  private catalogService!: CatalogServiceClient;

  constructor(
    @Inject("CATALOG_PACKAGE")
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.catalogService =
      this.client.getService<CatalogServiceClient>("CatalogService");
  }

  private toGrpcRequest<Payload>(payload: Payload) {
    return toCatalogGrpcMessage(payload);
  }

  private getSearchLanguage(acceptLanguage?: string): "ar" | "en" {
    const firstLanguage = acceptLanguage
      ?.split(",")[0]
      ?.trim()
      .split(";")[0]
      ?.split("-")[0]
      ?.toLowerCase();
    if (!firstLanguage || firstLanguage === "en") return "en";
    if (firstLanguage === "ar") return "ar";
    throw new BadRequestException(
      "accept-language must request either en or ar.",
    );
  }

  // Stations

  @Post("stations")
  createStation(@Body() dto: CreateStationDto) {
    return this.catalogService.createStation(this.toGrpcRequest(dto));
  }

  @Get("stations")
  getStations() {
    return this.catalogService.getStations({});
  }

  @Get("stations/search")
  searchStations(@Query() dto: SearchStationRecordsDto) {
    return this.catalogService.searchStationRecords(this.toGrpcRequest(dto));
  }

  @Get("trips/search")
  @UseGuards(VerifiedSearchGuard)
  async searchTrips(
    @Query() dto: SearchTripsDto,
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    try {
      return await firstValueFrom(
        this.catalogService
          .searchTrips({
            ...this.toGrpcRequest(dto),
            language: this.getSearchLanguage(acceptLanguage),
          })
          .pipe(timeout({ first: CATALOG_SEARCH_DEADLINE_MS })),
      );
    } catch (error) {
      if (
        error instanceof TimeoutError ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === status.UNAVAILABLE)
      ) {
        throw new ServiceUnavailableException({
          code: "SEARCH_UNAVAILABLE",
          message: "Search unavailable. Try again.",
        });
      }
      throw error;
    }
  }

  @Patch("stations/:id")
  updateStation(@Param("id") id: string, @Body() dto: UpdateStationDto) {
    return this.catalogService.updateStation(this.toGrpcRequest({ id, ...dto }));
  }

  @Patch("stations/:id/alternative-names")
  updateAlternativeNames(
    @Param("id") id: string,
    @Body() dto: UpdateAlternativeNamesDto,
  ) {
    return this.catalogService.updateAlternativeNames(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Patch("stations/:id/status")
  updateStationStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStationStatusDto,
  ) {
    return this.catalogService.updateStationStatus(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  // Governorates

  @Post("governorates")
  createGovernorate(@Body() dto: CreateGovernorateDto) {
    return this.catalogService.createGovernorate(this.toGrpcRequest(dto));
  }

  @Get("governorates")
  getGovernorates() {
    return this.catalogService.getGovernorates({});
  }

  @Get("governorates/:id")
  getGovernorateById(@Param("id") id: string) {
    return this.catalogService.getGovernorateById({ id });
  }

  @Patch("governorates/:id")
  updateGovernorate(
    @Param("id") id: string,
    @Body() dto: UpdateGovernorateDto,
  ) {
    return this.catalogService.updateGovernorate(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  // Cities

  @Post("cities")
  createCity(@Body() dto: CreateCityDto) {
    return this.catalogService.createCity(this.toGrpcRequest(dto));
  }

  @Get("cities")
  getCities() {
    return this.catalogService.getCities({});
  }

  @Get("cities/:id")
  getCityById(@Param("id") id: string) {
    return this.catalogService.getCityById({ id });
  }

  @Patch("cities/:id")
  updateCity(@Param("id") id: string, @Body() dto: UpdateCityDto) {
    return this.catalogService.updateCity(this.toGrpcRequest({ id, ...dto }));
  }

  // Train Types

  @Post("train-types")
  createTrainType(@Body() dto: CreateTrainTypeDto) {
    return this.catalogService.createTrainType(this.toGrpcRequest(dto));
  }

  @Get("train-types")
  getTrainTypes() {
    return this.catalogService.getTrainTypes({});
  }

  @Get("train-types/:id")
  getTrainType(@Param("id") id: string) {
    return this.catalogService.getTrainType({ id });
  }

  @Patch("train-types/:id")
  updateTrainType(@Param("id") id: string, @Body() dto: UpdateTrainTypeDto) {
    return this.catalogService.updateTrainType(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Delete("train-types/:id")
  deleteTrainType(@Param("id") id: string) {
    return this.catalogService.deleteTrainType({ id });
  }

  // Train Classes

  @Post("train-classes")
  createTrainClass(@Body() dto: CreateTrainClassDto) {
    return this.catalogService.createTrainClass(this.toGrpcRequest(dto));
  }

  @Get("train-classes")
  getTrainClasses() {
    return this.catalogService.getTrainClasses({});
  }

  @Get("train-classes/:id")
  getTrainClass(@Param("id") id: string) {
    return this.catalogService.getTrainClass({ id });
  }

  @Patch("train-classes/:id")
  updateTrainClass(@Param("id") id: string, @Body() dto: UpdateTrainClassDto) {
    return this.catalogService.updateTrainClass(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Delete("train-classes/:id")
  deleteTrainClass(@Param("id") id: string) {
    return this.catalogService.deleteTrainClass({ id });
  }

  // Trains

  @Post("trains")
  createTrain(@Body() dto: CreateTrainDto) {
    return this.catalogService.createTrain(this.toGrpcRequest(dto));
  }

  @Get("trains")
  getTrains() {
    return this.catalogService.getTrains({});
  }

  @Get("trains/:id")
  getTrain(@Param("id") id: string) {
    return this.catalogService.getTrain({ id });
  }

  @Patch("trains/:id")
  updateTrain(@Param("id") id: string, @Body() dto: UpdateTrainDto) {
    return this.catalogService.updateTrain(this.toGrpcRequest({ id, ...dto }));
  }

  @Delete("trains/:id")
  deleteTrain(@Param("id") id: string) {
    return this.catalogService.deleteTrain({ id });
  }

  // Coach Layouts

  @Post("coach-layouts")
  createCoachLayout(@Body() dto: CreateCoachLayoutDto) {
    return this.catalogService.createCoachLayout(this.toGrpcRequest(dto));
  }

  @Get("coach-layouts")
  getCoachLayouts() {
    return this.catalogService.getCoachLayouts({});
  }

  @Get("coach-layouts/:id")
  getCoachLayout(@Param("id") id: string) {
    return this.catalogService.getCoachLayout({ id });
  }

  @Patch("coach-layouts/:id")
  updateCoachLayout(
    @Param("id") id: string,
    @Body() dto: UpdateCoachLayoutDto,
  ) {
    return this.catalogService.updateCoachLayout(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Delete("coach-layouts/:id")
  deleteCoachLayout(@Param("id") id: string) {
    return this.catalogService.deleteCoachLayout({ id });
  }

  // Coaches

  @Post("coaches")
  createCoach(@Body() dto: CreateCoachDto) {
    return this.catalogService.createCoach(this.toGrpcRequest(dto));
  }

  @Get("coaches")
  getCoaches() {
    return this.catalogService.getCoaches({});
  }

  @Get("coaches/:id")
  getCoach(@Param("id") id: string) {
    return this.catalogService.getCoach({ id });
  }

  @Patch("coaches/:id")
  updateCoach(@Param("id") id: string, @Body() dto: UpdateCoachDto) {
    return this.catalogService.updateCoach(this.toGrpcRequest({ id, ...dto }));
  }

  @Delete("coaches/:id")
  deleteCoach(@Param("id") id: string) {
    return this.catalogService.deleteCoach({ id });
  }

  // Timetables

  @Post("timetables")
  createTimetable(@Body() dto: CreateTimetableDto) {
    return this.catalogService.createTimetable(this.toGrpcRequest(dto));
  }

  @Get("timetables")
  getTimetables() {
    return this.catalogService.getTimetables({});
  }

  @Get("timetables/:id")
  getTimetable(@Param("id") id: string) {
    return this.catalogService.getTimetable({ id });
  }

  @Patch("timetables/:id")
  updateTimetable(@Param("id") id: string, @Body() dto: UpdateTimetableDto) {
    return this.catalogService.updateTimetable(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Delete("timetables/:id")
  deleteTimetable(@Param("id") id: string) {
    return this.catalogService.deleteTimetable({ id });
  }

  // Timetable Stops

  @Post("timetable-stops")
  createTimetableStop(@Body() dto: CreateTimetableStopDto) {
    return this.catalogService.createTimetableStop(this.toGrpcRequest(dto));
  }

  @Get("timetable-stops")
  getTimetableStops() {
    return this.catalogService.getTimetableStops({});
  }

  @Get("timetable-stops/:id")
  getTimetableStop(@Param("id") id: string) {
    return this.catalogService.getTimetableStop({ id });
  }

  @Patch("timetable-stops/:id")
  updateTimetableStop(
    @Param("id") id: string,
    @Body() dto: UpdateTimetableStopDto,
  ) {
    return this.catalogService.updateTimetableStop(
      this.toGrpcRequest({ id, ...dto }),
    );
  }

  @Delete("timetable-stops/:id")
  deleteTimetableStop(@Param("id") id: string) {
    return this.catalogService.deleteTimetableStop({ id });
  }
}
