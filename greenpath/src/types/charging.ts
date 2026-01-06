import { Coordinates } from './route';

export type ChargingStatus = 'available' | 'limited' | 'occupied';

export type ChargerType = 'standard' | 'fast' | 'ultra_fast';

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  status: ChargingStatus;
  chargerType: ChargerType;
  availableSlots: number;
  totalSlots: number;
  pricePerKwh: number;
  rating: number;
  reviews: number;
  amenities: StationAmenity[];
  openingHours: OpeningHours;
  distance?: number; // km from user's position
  estimatedTime?: number; // minutes to reach
}

export type StationAmenity = 
  | 'wifi'
  | 'restroom'
  | 'cafe'
  | 'restaurant'
  | 'shop'
  | 'parking'
  | 'shelter'
  | '24h';

export interface OpeningHours {
  is24h: boolean;
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface TimeRange {
  open: string;
  close: string;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number; // kWh
  cost: number; // €
  status: 'charging' | 'completed' | 'cancelled';
}
