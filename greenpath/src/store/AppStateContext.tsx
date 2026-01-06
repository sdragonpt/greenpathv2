import React, { createContext, useContext, useState, useCallback } from 'react';
import { Vehicle, BatteryStatus, UserStats } from '@/types/user';
import { Route, NavigationState, Coordinates, Trip } from '@/types/route';
import { Weather } from '@/types/weather';
import { ChargingStation } from '@/types/charging';
import { DEFAULT_VEHICLE } from '@/lib/constants';
import { generateId } from '@/lib/utils';

interface AppState {
  // Vehicle & Battery
  vehicle: Vehicle;
  battery: BatteryStatus;
  
  // Weather
  weather: Weather | null;
  
  // Navigation
  navigation: NavigationState;
  selectedRoute: Route | null;
  
  // Charging
  chargingStations: ChargingStation[];
  
  // User stats
  stats: UserStats;
  
  // Trip history
  tripHistory: Trip[];
  
  // Current location
  currentLocation: Coordinates | null;
}

interface AppStateContextType extends AppState {
  // Battery actions
  setBatteryLevel: (level: number) => void;
  setCharging: (isCharging: boolean) => void;
  
  // Weather actions
  setWeather: (weather: Weather) => void;
  
  // Navigation actions
  setSelectedRoute: (route: Route | null) => void;
  startNavigation: (route: Route) => void;
  endNavigation: () => void;
  updateNavigationStats: (stats: Partial<NavigationState['tripStats']>) => void;
  
  // Location actions
  setCurrentLocation: (coords: Coordinates) => void;
  
  // Charging stations
  setChargingStations: (stations: ChargingStation[]) => void;
  
  // Trip history
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  
  // Stats
  updateStats: (stats: Partial<UserStats>) => void;
}

// Initial mock data
const initialVehicle: Vehicle = {
  id: 'v1',
  ...DEFAULT_VEHICLE,
  type: 'scooter',
  brand: 'EcoRide',
  model: 'City Pro',
  year: 2024,
  currentBattery: 78,
};

const initialBattery: BatteryStatus = {
  percentage: 78,
  isCharging: false,
  estimatedRange: 35.1,
  health: 95,
};

const initialStats: UserStats = {
  totalTrips: 47,
  totalDistance: 312.5,
  totalTime: 1890,
  co2Saved: 48.2,
  averageEfficiency: 4.2,
  streakDays: 5,
  longestTrip: 18.3,
};

const initialNavigation: NavigationState = {
  currentRoute: null,
  currentPosition: null,
  currentStep: 0,
  isNavigating: false,
  tripStats: {
    elapsedTime: 0,
    distanceTraveled: 0,
    batteryUsed: 0,
  },
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [vehicle] = useState<Vehicle>(initialVehicle);
  const [battery, setBattery] = useState<BatteryStatus>(initialBattery);
  const [weather, setWeatherState] = useState<Weather | null>(null);
  const [navigation, setNavigation] = useState<NavigationState>(initialNavigation);
  const [selectedRoute, setSelectedRouteState] = useState<Route | null>(null);
  const [chargingStations, setChargingStationsState] = useState<ChargingStation[]>([]);
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [currentLocation, setCurrentLocationState] = useState<Coordinates | null>(null);

  const setBatteryLevel = useCallback((level: number) => {
    setBattery((prev) => ({
      ...prev,
      percentage: level,
      estimatedRange: (level / 100) * vehicle.maxRange,
    }));
  }, [vehicle.maxRange]);

  const setCharging = useCallback((isCharging: boolean) => {
    setBattery((prev) => ({ ...prev, isCharging }));
  }, []);

  const setWeather = useCallback((w: Weather) => {
    setWeatherState(w);
  }, []);

  const setSelectedRoute = useCallback((route: Route | null) => {
    setSelectedRouteState(route);
  }, []);

  const startNavigation = useCallback((route: Route) => {
    setNavigation({
      currentRoute: route,
      currentPosition: route.start.coordinates,
      currentStep: 0,
      isNavigating: true,
      tripStats: {
        elapsedTime: 0,
        distanceTraveled: 0,
        batteryUsed: 0,
      },
    });
  }, []);

  const endNavigation = useCallback(() => {
    setNavigation((prev) => ({
      ...prev,
      isNavigating: false,
      currentRoute: null,
    }));
  }, []);

  const updateNavigationStats = useCallback((tripStats: Partial<NavigationState['tripStats']>) => {
    setNavigation((prev) => ({
      ...prev,
      tripStats: { ...prev.tripStats, ...tripStats },
    }));
  }, []);

  const setCurrentLocation = useCallback((coords: Coordinates) => {
    setCurrentLocationState(coords);
  }, []);

  const setChargingStations = useCallback((stations: ChargingStation[]) => {
    setChargingStationsState(stations);
  }, []);

  const addTrip = useCallback((trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = { ...trip, id: generateId() };
    setTripHistory((prev) => [newTrip, ...prev]);
  }, []);

  const updateStats = useCallback((newStats: Partial<UserStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        vehicle,
        battery,
        weather,
        navigation,
        selectedRoute,
        chargingStations,
        stats,
        tripHistory,
        currentLocation,
        setBatteryLevel,
        setCharging,
        setWeather,
        setSelectedRoute,
        startNavigation,
        endNavigation,
        updateNavigationStats,
        setCurrentLocation,
        setChargingStations,
        addTrip,
        updateStats,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
