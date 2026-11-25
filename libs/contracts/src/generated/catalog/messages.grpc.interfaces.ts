import type { TripSort } from "./methods.grpc.interfaces";

export interface EmptyRequest {}

export interface IdRequest {
  id?: string | undefined;
}

export interface DeleteResponse {
  message?: string | undefined;
}

export interface OperationResponse {
  success?: boolean | undefined;
}

export interface SearchStationsRequest {
  query?: string | undefined;
}

export interface Station {
  stationId?: string | undefined;
  nameEn?: string | undefined;
  nameAr?: string | undefined;
  governorate?: string | undefined;
}

export interface SearchStationsResponse {
  stations?: Station[] | undefined;
}

export interface SearchTripsRequest {
  originStationId?: string | undefined;
  destinationStationId?: string | undefined;
  departureDate?: string | undefined;
  seatClassId?: string | undefined;
  trainNumber?: string | undefined;
  departureTimeFrom?: string | undefined;
  departureTimeTo?: string | undefined;
  maximumFarePiastres?: number | undefined;
  trainType?: string | undefined;
  sort?: TripSort | undefined;
}

export interface TripResult {
  tripId?: string | undefined;
  trainNumber?: string | undefined;
  trainType?: string | undefined;
  seatClassId?: string | undefined;
  originStationId?: string | undefined;
  originStationNameEn?: string | undefined;
  originStationNameAr?: string | undefined;
  departureAt?: string | undefined;
  destinationStationId?: string | undefined;
  destinationStationNameEn?: string | undefined;
  destinationStationNameAr?: string | undefined;
  arrivalAt?: string | undefined;
  durationMinutes?: number | undefined;
  intermediateStopCount?: number | undefined;
  availableSeats?: number | undefined;
  farePiastres?: number | undefined;
  soldOut?: boolean | undefined;
}

export interface SearchTripsResponse {
  trips?: TripResult[] | undefined;
}

export interface GetTripStopsRequest {
  tripId?: string | undefined;
  originStationId?: string | undefined;
  destinationStationId?: string | undefined;
}

export interface TripStop {
  stationId?: string | undefined;
  stationNameEn?: string | undefined;
  stationNameAr?: string | undefined;
  arrivalAt?: string | undefined;
  departureAt?: string | undefined;
}

export interface GetTripStopsResponse {
  stops?: TripStop[] | undefined;
}

export interface RecentSearch {
  originStationId?: string | undefined;
  destinationStationId?: string | undefined;
  departureDate?: string | undefined;
  returnDate?: string | undefined;
  seatClassId?: string | undefined;
  trainNumber?: string | undefined;
}

export interface GetRecentSearchesRequest {}

export interface GetRecentSearchesResponse {
  searches?: RecentSearch[] | undefined;
}

export interface SaveRecentSearchRequest {
  search?: RecentSearch | undefined;
}

export interface QuoteFareRequest {
  tripId?: string | undefined;
  seatClassId?: string | undefined;
  originStationId?: string | undefined;
  destinationStationId?: string | undefined;
}

export interface QuoteFareResponse {
  farePiastres?: number | undefined;
}

export interface PublishTimetableRequest {
  timetableId?: string | undefined;
}

export interface ChangeFaresRequest {
  trainId?: string | undefined;
  seatClassId?: string | undefined;
  originStationId?: string | undefined;
  destinationStationId?: string | undefined;
  farePiastres?: number | undefined;
}

export interface DelayTripRequest {
  tripId?: string | undefined;
  fromStationId?: string | undefined;
  delayMinutes?: number | undefined;
}

export interface CancelTripRequest {
  tripId?: string | undefined;
}

export interface StationResponse {
  id?: string | undefined;
  name?: string | undefined;
  address?: string | undefined;
  isActive?: boolean | undefined;
  governorateId?: string | undefined;
  alternativeNames?: string[] | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  cityId?: string | undefined;
  nameEn?: string | undefined;
  nameAr?: string | undefined;
}

export interface StationListResponse {
  stations?: StationResponse[] | undefined;
}

export interface GroupedStationResponse {
  id?: string | undefined;
  name?: string | undefined;
  stations?: StationResponse[] | undefined;
}

export interface GroupedStationListResponse {
  governorates?: GroupedStationResponse[] | undefined;
}

export interface CreateStationRequest {
  address?: string | undefined;
  alternativeNames?: string[] | undefined;
  cityId?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface UpdateStationRequest {
  id?: string | undefined;
  address?: string | undefined;
  cityId?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface UpdateAlternativeNamesRequest {
  id?: string | undefined;
  alternativeNames?: string[] | undefined;
}

export interface UpdateStationStatusRequest {
  id?: string | undefined;
  isActive?: boolean | undefined;
}

export interface SearchStationRequest {
  q?: string | undefined;
}

export interface GovernorateResponse {
  id?: string | undefined;
  nameAr?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  nameEn?: string | undefined;
}

export interface GovernorateListResponse {
  governorates?: GovernorateResponse[] | undefined;
}

export interface CreateGovernorateRequest {
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface GetGovernorateByIdRequest {
  id?: string | undefined;
}

export interface UpdateGovernorateRequest {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface CityResponse {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  governorateId?: string | undefined;
  governorateNameAr?: string | undefined;
  governorateNameEn?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface CityListResponse {
  cities?: CityResponse[] | undefined;
}

export interface CreateCityRequest {
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  governorateId?: string | undefined;
}

export interface UpdateCityRequest {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  governorateId?: string | undefined;
}

export interface CreateTrainTypeRequest {
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface UpdateTrainTypeRequest {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface TrainTypeResponse {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface TrainTypeListResponse {
  items?: TrainTypeResponse[] | undefined;
}

export interface CreateTrainClassRequest {
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface UpdateTrainClassRequest {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface TrainClassResponse {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface TrainClassListResponse {
  items?: TrainClassResponse[] | undefined;
}

export interface CreateTrainRequest {
  number?: number | undefined;
  typeOfTrainId?: string | undefined;
}

export interface UpdateTrainRequest {
  id?: string | undefined;
  number?: number | undefined;
  typeOfTrainId?: string | undefined;
}

export interface TrainTypeRef {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface TrainResponse {
  id?: string | undefined;
  number?: number | undefined;
  typeOfTrain?: TrainTypeRef | undefined;
}

export interface TrainListResponse {
  items?: TrainResponse[] | undefined;
}

export interface CreateCoachLayoutRequest {
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  description?: string | undefined;
}

export interface UpdateCoachLayoutRequest {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  description?: string | undefined;
}

export interface CoachLayoutResponse {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
  description?: string | undefined;
}

export interface CoachLayoutListResponse {
  items?: CoachLayoutResponse[] | undefined;
}

export interface CreateCoachRequest {
  coachNumber?: number | undefined;
  trainId?: string | undefined;
  classOfTrainId?: string | undefined;
  coachLayoutId?: string | undefined;
}

export interface UpdateCoachRequest {
  id?: string | undefined;
  coachNumber?: number | undefined;
  trainId?: string | undefined;
  classOfTrainId?: string | undefined;
  coachLayoutId?: string | undefined;
}

export interface TrainRef {
  id?: string | undefined;
  number?: number | undefined;
}

export interface TrainClassRef {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface CoachLayoutRef {
  id?: string | undefined;
  nameAr?: string | undefined;
  nameEn?: string | undefined;
}

export interface CoachResponse {
  id?: string | undefined;
  coachNumber?: number | undefined;
  train?: TrainRef | undefined;
  classOfTrain?: TrainClassRef | undefined;
  coachLayout?: CoachLayoutRef | undefined;
}

export interface CoachListResponse {
  items?: CoachResponse[] | undefined;
}

export interface CreateTimetableRequest {
  departureTime?: string | undefined;
  effectiveFrom?: string | undefined;
  effectiveTo?: string | undefined;
  workingDays?: string[] | undefined;
  status?: boolean | undefined;
  trainId?: string | undefined;
}

export interface UpdateTimetableRequest {
  id?: string | undefined;
  departureTime?: string | undefined;
  effectiveFrom?: string | undefined;
  effectiveTo?: string | undefined;
  workingDays?: string[] | undefined;
  status?: boolean | undefined;
  trainId?: string | undefined;
}

export interface TimetableResponse {
  id?: string | undefined;
  departureTime?: string | undefined;
  effectiveFrom?: string | undefined;
  effectiveTo?: string | undefined;
  workingDays?: string[] | undefined;
  status?: boolean | undefined;
  train?: TrainRef | undefined;
}

export interface TimetableListResponse {
  items?: TimetableResponse[] | undefined;
}

export interface CreateTimetableStopRequest {
  arrivalTime?: string | undefined;
  departureTime?: string | undefined;
  stopOrder?: number | undefined;
  timetableId?: string | undefined;
  stationId?: string | undefined;
}

export interface UpdateTimetableStopRequest {
  id?: string | undefined;
  arrivalTime?: string | undefined;
  departureTime?: string | undefined;
  stopOrder?: number | undefined;
  timetableId?: string | undefined;
  stationId?: string | undefined;
}

export interface TimetableRef {
  id?: string | undefined;
}

export interface StationRef {
  id?: string | undefined;
}

export interface TimetableStopResponse {
  id?: string | undefined;
  arrivalTime?: string | undefined;
  departureTime?: string | undefined;
  stopOrder?: number | undefined;
  timetable?: TimetableRef | undefined;
  station?: StationRef | undefined;
}

export interface TimetableStopListResponse {
  items?: TimetableStopResponse[] | undefined;
}
