export const CATALOG_ROUTING_KEYS = {
  TRIP_PUBLISHED: 'trip-published',
  TRIP_WITHDRAWN: 'trip-withdrawn',
  TIMETABLE_PUBLISHED: 'timetable-published',
} as const;

export interface TripPublishedEvent {
  version: 1;
  eventId: string;
  eventType: 'trip-published';
  occurredAt: string;
  tripId: string;
  trainId: string;
  trainNumber: number;
  trainType: { id: string; nameAr: string; nameEn: string };
  timetableId: string;
  timetableVersion: number;
  serviceDate: string; // Cairo calendar date of the trip's start

  stops: {
    stationId: string;
    position: number; // 1-based, stable for the life of the trip
    arrivalTime: string | null; // Cairo wall clock
    departureTime: string | null;
    arrivalAt: string | null; // UTC instant (ISO 8601)
    departureAt: string | null;
    arrivalDate: string | null; // Cairo calendar date of this stop
    departureDate: string | null;
  }[];

  coaches: {
    coachId: string;
    coachNumber: number;
    class: { id: string; nameAr: string; nameEn: string };
    layoutId: string;
    seats: {
      seatNumber: string;
      rowNumber: number;
      position: number; // 1..k inside its adjacency group, left to right
      side: string; // LEFT | RIGHT of the aisle
      adjacencyGroup: string; // seats sharing a group are side by side with no aisle between
    }[];
  }[];
}

export interface TripWithdrawnEvent {
  version: 1;
  eventId: string;
  eventType: 'trip-withdrawn';
  occurredAt: string;
  tripId: string;
  trainId: string;
  serviceDate: string;
}

export interface TimetablePublishedEvent {
  version: 1;
  eventId: string;
  eventType: 'timetable-published';
  occurredAt: string;
  timetableId: string;
  trainId: string;
  timetableVersion: number;
  effectiveFrom: string;
  effectiveTo: string;
}