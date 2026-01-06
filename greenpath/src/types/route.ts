export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  coordinates: Coordinates;
  address: string;
  name?: string;
}

export type RouteType = 'fastest' | 'efficient' | 'safest';

export interface RouteMetrics {
  distance: number; // km
  duration: number; // minutes
  batteryUsage: number; // percentage
  elevationGain: number; // meters
  elevationLoss: number; // meters
}

export interface Route {
  id: string;
  type: RouteType;
  start: Location;
  end: Location;
  waypoints: Coordinates[];
  metrics: RouteMetrics;
  isRecommended: boolean;
  warnings?: RouteWarning[];
}

export interface RouteWarning {
  type: 'rain' | 'low_battery' | 'steep_hill' | 'construction';
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface Trip {
  id: string;
  route: Route;
  startTime: Date;
  endTime?: Date;
  actualDistance?: number;
  actualBatteryUsed?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface NavigationState {
  currentRoute: Route | null;
  currentPosition: Coordinates | null;
  currentStep: number;
  isNavigating: boolean;
  tripStats: {
    elapsedTime: number;
    distanceTraveled: number;
    batteryUsed: number;
  };
}
