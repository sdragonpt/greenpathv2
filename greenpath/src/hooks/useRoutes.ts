import { useState, useCallback } from 'react';
import { Route, RouteType, Location, Coordinates, RouteWarning } from '@/types/route';
import { Weather } from '@/types/weather';
import { generateId } from '@/lib/utils';
import { WEATHER_IMPACT } from '@/lib/constants';

interface UseRoutesState {
  routes: Route[];
  isCalculating: boolean;
  error: string | null;
}

interface CalculateRoutesParams {
  start: Location;
  end: Location;
  weather?: Weather | null;
  batteryLevel?: number;
}

// OSRM API response types
interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat] pairs
  };
  legs: {
    steps: {
      distance: number;
      duration: number;
      name: string;
      maneuver: {
        type: string;
        modifier?: string;
        location: [number, number];
      };
    }[];
  }[];
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

// Fetch route from OSRM API
const fetchOSRMRoute = async (
  start: Coordinates,
  end: Coordinates,
  profile: 'bike' | 'foot' | 'driving' = 'bike'
): Promise<OSRMRoute | null> => {
  try {
    // OSRM public demo server (for production, use your own server)
    // Profile: bike is best for electric scooters
    const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM request failed');

    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      throw new Error('No route found');
    }

    return data.routes[0];
  } catch (error) {
    console.error('OSRM error:', error);
    return null;
  }
};

// Convert OSRM coordinates to our format
const convertCoordinates = (osrmCoords: [number, number][]): Coordinates[] => {
  return osrmCoords.map(([lng, lat]) => ({ lat, lng }));
};

// Generate route variations for different types
const generateRouteVariation = (
  baseRoute: OSRMRoute,
  type: RouteType,
  start: Location,
  end: Location,
  weather?: Weather | null
): Route => {
  // Type factors for different route preferences
  const typeFactors: Record<RouteType, { 
    distanceMultiplier: number; 
    timeMultiplier: number; 
    batteryMultiplier: number;
    elevationFactor: number;
  }> = {
    fastest: { distanceMultiplier: 1.0, timeMultiplier: 1.0, batteryMultiplier: 1.15, elevationFactor: 1.2 },
    efficient: { distanceMultiplier: 1.05, timeMultiplier: 1.1, batteryMultiplier: 1.0, elevationFactor: 0.8 },
    safest: { distanceMultiplier: 1.1, timeMultiplier: 1.2, batteryMultiplier: 1.05, elevationFactor: 0.6 },
  };

  const factors = typeFactors[type];

  // Base distance in km
  const baseDistance = (baseRoute.distance / 1000) * factors.distanceMultiplier;
  
  // Duration in minutes
  const baseDuration = (baseRoute.duration / 60) * factors.timeMultiplier;

  // Battery usage calculation (scooter ~45km max range)
  let batteryUsage = (baseDistance / 45) * 100 * factors.batteryMultiplier;

  // Apply weather impact
  if (weather) {
    const weatherMultiplier = WEATHER_IMPACT[weather.condition] || 1;
    batteryUsage = batteryUsage / weatherMultiplier;
  }

  // Generate warnings
  const warnings: RouteWarning[] = [];

  if (weather?.condition === 'rainy' || weather?.condition === 'stormy') {
    warnings.push({
      type: 'rain',
      message: weather.condition === 'stormy' 
        ? '⚠️ Tempestade prevista! Autonomia reduzida em ~25%.' 
        : '🌧️ Chuva prevista. Autonomia pode ser reduzida em ~15%.',
      severity: weather.condition === 'stormy' ? 'danger' : 'warning',
    });
  }

  if (batteryUsage > 80) {
    warnings.push({
      type: 'low_battery',
      message: '🔋 Esta rota consumirá mais de 80% da bateria.',
      severity: 'warning',
    });
  }

  if (baseDistance > 30) {
    warnings.push({
      type: 'low_battery',
      message: '📍 Rota longa! Considere parar num posto de carregamento.',
      severity: 'info',
    });
  }

  // Estimate elevation (would need elevation API for real data)
  const elevationGain = Math.round((baseDistance * 15) * factors.elevationFactor);
  const elevationLoss = Math.round((baseDistance * 12) * factors.elevationFactor);

  // Convert waypoints - simplify for performance if too many points
  let waypoints = convertCoordinates(baseRoute.geometry.coordinates);
  
  // Reduce waypoints if too many (keep ~100 max for smooth rendering)
  if (waypoints.length > 100) {
    const step = Math.ceil(waypoints.length / 100);
    waypoints = waypoints.filter((_, i) => i % step === 0 || i === waypoints.length - 1);
  }

  // For non-fastest routes, add slight variation to waypoints
  if (type !== 'fastest' && waypoints.length > 2) {
    waypoints = waypoints.map((point, i) => {
      if (i === 0 || i === waypoints.length - 1) return point;
      
      // Add small random offset to simulate alternative route
      const offset = type === 'efficient' ? 0.0005 : 0.001;
      return {
        lat: point.lat + (Math.random() - 0.5) * offset,
        lng: point.lng + (Math.random() - 0.5) * offset,
      };
    });
  }

  return {
    id: generateId(),
    type,
    start,
    end,
    waypoints,
    metrics: {
      distance: Math.round(baseDistance * 10) / 10,
      duration: Math.round(baseDuration),
      batteryUsage: Math.round(batteryUsage * 10) / 10,
      elevationGain,
      elevationLoss,
    },
    isRecommended: type === 'efficient',
    warnings,
  };
};

// Fallback mock route generation when API fails
const generateFallbackRoute = (
  type: RouteType,
  start: Location,
  end: Location,
  weather?: Weather | null
): Route => {
  const distance = calculateHaversineDistance(start.coordinates, end.coordinates);
  const roadFactor = 1.3 + Math.random() * 0.2;
  const adjustedDistance = Math.max(distance * roadFactor, 0.5);

  const typeFactors = {
    fastest: { distance: 1.0, time: 1.0, battery: 1.15 },
    efficient: { distance: 1.1, time: 1.15, battery: 1.0 },
    safest: { distance: 1.2, time: 1.25, battery: 1.05 },
  };

  const factors = typeFactors[type];
  const finalDistance = adjustedDistance * factors.distance;
  const avgSpeed = type === 'fastest' ? 22 : type === 'efficient' ? 18 : 16;
  const duration = (finalDistance / avgSpeed) * 60;
  let batteryUsage = (finalDistance / 45) * 100 * factors.battery;

  if (weather) {
    const weatherMultiplier = WEATHER_IMPACT[weather.condition] || 1;
    batteryUsage = batteryUsage / weatherMultiplier;
  }

  // Generate straight-line waypoints with some variation
  const waypoints = generateWaypoints(start.coordinates, end.coordinates, 20);

  return {
    id: generateId(),
    type,
    start,
    end,
    waypoints,
    metrics: {
      distance: Math.round(finalDistance * 10) / 10,
      duration: Math.round(duration),
      batteryUsage: Math.round(batteryUsage * 10) / 10,
      elevationGain: Math.round(50 + Math.random() * 100),
      elevationLoss: Math.round(40 + Math.random() * 80),
    },
    isRecommended: type === 'efficient',
    warnings: [],
  };
};

// Haversine distance calculation
const calculateHaversineDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371;
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate fallback waypoints
const generateWaypoints = (start: Coordinates, end: Coordinates, numPoints: number = 10): Coordinates[] => {
  const waypoints: Coordinates[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const variation = Math.sin(t * Math.PI) * 0.003 * (Math.random() - 0.5);
    
    waypoints.push({
      lat: start.lat + (end.lat - start.lat) * t + variation,
      lng: start.lng + (end.lng - start.lng) * t + variation * 1.5,
    });
  }
  
  return waypoints;
};

export function useRoutes() {
  const [state, setState] = useState<UseRoutesState>({
    routes: [],
    isCalculating: false,
    error: null,
  });

  const calculateRoutes = useCallback(async ({
    start,
    end,
    weather,
    batteryLevel = 100,
  }: CalculateRoutesParams): Promise<Route[]> => {
    setState({ routes: [], isCalculating: true, error: null });

    try {
      // Try to fetch real route from OSRM
      const osrmRoute = await fetchOSRMRoute(start.coordinates, end.coordinates, 'bike');

      let routes: Route[];

      if (osrmRoute) {
        // Generate route variations based on real OSRM data
        routes = [
          generateRouteVariation(osrmRoute, 'fastest', start, end, weather),
          generateRouteVariation(osrmRoute, 'efficient', start, end, weather),
          generateRouteVariation(osrmRoute, 'safest', start, end, weather),
        ];
      } else {
        // Fallback to mock routes if API fails
        console.warn('OSRM API failed, using fallback routes');
        routes = [
          generateFallbackRoute('fastest', start, end, weather),
          generateFallbackRoute('efficient', start, end, weather),
          generateFallbackRoute('safest', start, end, weather),
        ];
      }

      // Add battery warnings
      routes.forEach((route) => {
        if (route.metrics.batteryUsage > batteryLevel) {
          if (!route.warnings?.some(w => w.type === 'low_battery')) {
            route.warnings = route.warnings || [];
            route.warnings.push({
              type: 'low_battery',
              message: '⚠️ Bateria insuficiente para completar esta rota. Carregue antes de partir.',
              severity: 'danger',
            });
          }
        }
      });

      setState({
        routes,
        isCalculating: false,
        error: null,
      });

      return routes;
    } catch (error) {
      const errorMessage = 'Erro ao calcular rotas. Tente novamente.';
      setState({
        routes: [],
        isCalculating: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  }, []);

  const clearRoutes = useCallback(() => {
    setState({
      routes: [],
      isCalculating: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    calculateRoutes,
    clearRoutes,
  };
}
