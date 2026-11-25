import { DatedTrip } from '../../../datedTrip/domain/entities/dated-trip.entity';
import { FareRow } from '../policies/publishing-rules';

export interface GenerationTrain {
  id: string;
  number: number;
  type: { id: string; nameAr: string; nameEn: string };
}

export interface GenerationTimetable {
  id: string;
  status: boolean;
  publishedAt: Date | null;
  effectiveFrom: Date | string;
  effectiveTo: Date | string;
  workingDays: string[];
  version: number;
  train: GenerationTrain;
}

export interface GenerationStop {
  stationId: string;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface GenerationSeat {
  seatNumber: string;
  rowNumber: number;
  position: number;
  side: string;
  adjacencyGroup: string;
}

export interface GenerationCoach {
  id: string;
  coachNumber: number;
  classOfTrain: { id: string; nameAr: string; nameEn: string } | null;
  coachLayout: { id: string; seats: GenerationSeat[] } | null;
}

export interface GenerationInputs {
  stops: GenerationStop[];
  coaches: GenerationCoach[];
  fares: FareRow[];
}

export interface ResolvedGenerationStop extends GenerationStop {
  position: number;
  arrivalMs: number | null;
  departureMs: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
}

export interface CreateGeneratedTrip {
  id: string;
  serviceDate: string;
  timetable: GenerationTimetable;
  stops: ResolvedGenerationStop[];
  coaches: GenerationCoach[];
}

export type GeneratedTrip = DatedTrip;
