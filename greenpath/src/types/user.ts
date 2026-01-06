export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  vehicle: Vehicle;
  stats: UserStats;
  preferences: UserPreferences;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'scooter' | 'bike' | 'moped';
  brand?: string;
  model?: string;
  year?: number;
  maxRange: number; // km at full charge
  batteryCapacity: number; // Wh
  averageConsumption: number; // Wh/km
  maxSpeed: number; // km/h
  currentBattery: number; // percentage
}

export interface UserStats {
  totalTrips: number;
  totalDistance: number; // km
  totalTime: number; // minutes
  co2Saved: number; // kg
  averageEfficiency: number; // km per 10% battery
  favoriteRoute?: string;
  longestTrip?: number;
  streakDays: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  units: 'metric' | 'imperial';
  defaultRouteType: 'fastest' | 'efficient' | 'safest';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  chargingReminders: boolean;
  routeAlerts: boolean;
  weatherWarnings: boolean;
  promotions: boolean;
}

export interface PrivacyPreferences {
  shareLocation: boolean;
  shareUsageData: boolean;
  publicProfile: boolean;
}

export interface BatteryStatus {
  percentage: number;
  isCharging: boolean;
  estimatedRange: number; // km
  timeToFull?: number; // minutes
  health: number; // percentage
}
