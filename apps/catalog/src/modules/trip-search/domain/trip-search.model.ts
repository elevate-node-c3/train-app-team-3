export interface TripSearchQuery {
  departureDate: string;
  originStationId: string;
  destinationStationId: string;
  seatClassId: string;
  trainNumber?: number;
}

export interface TripSearchStation {
  id: string;
  isActive: boolean;
}

export interface TripSearchClass {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TripSearchCandidate {
  tripId: string;
  trainId: string;
  trainNumber: number;
  trainTypeId: string;
  trainTypeNameAr: string;
  trainTypeNameEn: string;
  originStationId: string;
  originStationNameAr: string;
  originStationNameEn: string;
  destinationStationId: string;
  destinationStationNameAr: string;
  destinationStationNameEn: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  intermediateStopCount: number;
  farePiastres: number;
}
