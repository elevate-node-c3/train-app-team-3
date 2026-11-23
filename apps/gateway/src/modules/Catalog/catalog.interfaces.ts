import { Observable } from 'rxjs';

export type EmptyRequest = Record<string, never>;

export interface IdRequest {
  id: string;
}

// Stations

export interface StationService {
  createStation(data: {
    name: string;
    address: string;
    governorateId: string;
  }): Observable<object>;

  getStations(data: EmptyRequest): Observable<object>;
  searchStations(data: { q: string }): Observable<object>;

  updateStation(data: {
    id: string;
    name?: string;
    address?: string;
    governorateId?: string;
  }): Observable<object>;

  updateAlternativeNames(data: {
    id: string;
    alternativeNames: string[];
  }): Observable<object>;

  updateStationStatus(data: {
    id: string;
    isActive: boolean;
  }): Observable<object>;
}

// Governorates

export interface GovernorateService {
  createGovernorate(data: { name: string }): Observable<object>;
  getGovernorates(data: EmptyRequest): Observable<object>;
  getGovernorateById(data: IdRequest): Observable<object>;
  updateGovernorate(data: { id: string; name: string }): Observable<object>;
}

// Train Types

export interface TrainTypeService {
  createTrainType(data: { name_ar: string; name_en: string }): Observable<object>;
  getTrainTypes(data: EmptyRequest): Observable<object>;
  getTrainType(data: IdRequest): Observable<object>;
  updateTrainType(data: { id: string; name_ar?: string; name_en?: string }): Observable<object>;
  deleteTrainType(data: IdRequest): Observable<object>;
}

// Train Classes

export interface TrainClassService {
  createTrainClass(data: { name_ar: string; name_en: string }): Observable<object>;
  getTrainClasses(data: EmptyRequest): Observable<object>;
  getTrainClass(data: IdRequest): Observable<object>;
  updateTrainClass(data: { id: string; name_ar?: string; name_en?: string }): Observable<object>;
  deleteTrainClass(data: IdRequest): Observable<object>;
}

// Trains

export interface TrainService {
  createTrain(data: { number: number; type_of_train_id: string }): Observable<object>;
  getTrains(data: EmptyRequest): Observable<object>;
  getTrain(data: IdRequest): Observable<object>;
  updateTrain(data: { id: string; number?: number; type_of_train_id?: string }): Observable<object>;
  deleteTrain(data: IdRequest): Observable<object>;
}

// Coach Layouts

export interface CoachLayoutService {
  createCoachLayout(data: {
    name_ar: string;
    name_en: string;
    description: string;
  }): Observable<object>;

  getCoachLayouts(data: EmptyRequest): Observable<object>;
  getCoachLayout(data: IdRequest): Observable<object>;

  updateCoachLayout(data: {
    id: string;
    name_ar?: string;
    name_en?: string;
    description?: string;
  }): Observable<object>;

  deleteCoachLayout(data: IdRequest): Observable<object>;
}

// Coaches

export interface CoachService {
  createCoach(data: {
    coach_number: number;
    train_id: string;
    class_of_train_id: string;
    coach_layout_id: string;
  }): Observable<object>;

  getCoaches(data: EmptyRequest): Observable<object>;
  getCoach(data: IdRequest): Observable<object>;

  updateCoach(data: {
    id: string;
    coach_number?: number;
    train_id?: string;
    class_of_train_id?: string;
    coach_layout_id?: string;
  }): Observable<object>;

  deleteCoach(data: IdRequest): Observable<object>;
}

// Timetables

export interface TimetableService {
  createTimetable(data: {
    departure_time: string;
    effective_from: string;
    effective_to: string;
    working_days: string[];
    status: boolean;
    train_id: string;
  }): Observable<object>;

  getTimetables(data: EmptyRequest): Observable<object>;
  getTimetable(data: IdRequest): Observable<object>;

  updateTimetable(data: {
    id: string;
    departure_time?: string;
    effective_from?: string;
    effective_to?: string;
    working_days?: string[];
    status?: boolean;
    train_id?: string;
  }): Observable<object>;

  deleteTimetable(data: IdRequest): Observable<object>;
}

// Timetable Stops

export interface TimetableStopService {
  createTimetableStop(data: {
    arrival_time?: string;
    departure_time?: string;
    stop_order: number;
    timetable_id: string;
    station_id: string;
  }): Observable<object>;

  getTimetableStops(data: EmptyRequest): Observable<object>;
  getTimetableStop(data: IdRequest): Observable<object>;

  updateTimetableStop(data: {
    id: string;
    arrival_time?: string;
    departure_time?: string;
    stop_order?: number;
    timetable_id?: string;
    station_id?: string;
  }): Observable<object>;

  deleteTimetableStop(data: IdRequest): Observable<object>;
}
