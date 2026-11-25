import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  SearchTripsRequest,
  SearchTripsResponse,
} from '@app/contracts/generated/catalog';
import { TripSearchService } from './trip-search.service';

@Controller()
export class TripSearchController {
  constructor(private readonly tripSearchService: TripSearchService) {}

  @GrpcMethod('CatalogService', 'SearchTrips')
  searchTrips(
    request: SearchTripsRequest,
  ): Promise<SearchTripsResponse> {
    return this.tripSearchService.search(request);
  }
}
