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

// Generate mock route waypoints between two points
const generateWaypoints = (start: Coordinates, end: Coordinates, numPoints: number = 10): Coordinates[] => {
  const waypoints: Coordinates[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Add some random variation to make the route look more natural
    const variation = Math.sin(t * Math.PI) * 0.005 * (Math.random() - 0.5);
    
    waypoints.push({
      lat: start.lat + (end.lat - start.lat) * t + variation,
      lng: start.lng + (end.lng - start.lng) * t + variation * 1.5,
    });
  }
  
  return waypoints;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371; // Earth's radius in km
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

// Generate mock route based on type
const generateMockRoute = (
  type: RouteType,
  start: Location,
  end: Location,
  baseDistance: number,
  weather?: Weather | null
): Route => {
  // Different multipliers for each route type
  const typeFactors: Record<RouteType, { distance: number; time: number; battery: number; elevation: number }> = {
    fastest: { distance: 1.0, time: 1.0, battery: 1.15, elevation: 1.2 },
    efficient: { distance: 1.1, time: 1.15, battery: 1.0, elevation: 0.8 },
    safest: { distance: 1.2, time: 1.25, battery: 1.05, elevation: 0.6 },
  };

  const factors = typeFactors[type];
  const distance = baseDistance * factors.distance;
  
  // Calculate duration based on average speed (20 km/h for scooter)
  const averageSpeed = type === 'fastest' ? 22 : type === 'efficient' ? 18 : 16;
  const duration = (distance / averageSpeed) * 60; // in minutes
  
  // Battery usage calculation
  const baseBatteryUsage = (distance / 45) * 100; // 45km max range
  let batteryUsage = baseBatteryUsage * factors.battery;
  
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
      message: 'Chuva prevista no percurso. Autonomia pode ser reduzida em 15%.',
      severity: weather.condition === 'stormy' ? 'danger' : 'warning',
    });
  }
  
  if (batteryUsage > 80) {
    warnings.push({
      type: 'low_battery',
      message: 'Esta rota consumirá mais de 80% da bateria.',
      severity: 'warning',
    });
  }
  
  const elevationGain = Math.round(50 + Math.random() * 100 * factors.elevation);
  const elevationLoss = Math.round(40 + Math.random() * 80 * factors.elevation);

  return {
    id: generateId(),
    type,
    start,
    end,
    waypoints: generateWaypoints(start.coordinates, end.coordinates),
    metrics: {
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration),
      batteryUsage: Math.round(batteryUsage * 10) / 10,
      elevationGain,
      elevationLoss,
    },
    isRecommended: type === 'efficient',
    warnings,
  };
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const baseDistance = calculateDistance(start.coordinates, end.coordinates);
      
      // Add realistic minimum distance (accounting for roads)
      const roadFactor = 1.3 + Math.random() * 0.2;
      const adjustedDistance = Math.max(baseDistance * roadFactor, 0.5);

      const routes: Route[] = [
        generateMockRoute('fastest', start, end, adjustedDistance, weather),
        generateMockRoute('efficient', start, end, adjustedDistance, weather),
        generateMockRoute('safest', start, end, adjustedDistance, weather),
      ];

      // Check if any route exceeds battery
      routes.forEach((route) => {
        if (route.metrics.batteryUsage > batteryLevel && 
            !route.warnings?.some(w => w.type === 'low_battery')) {
          route.warnings = route.warnings || [];
          route.warnings.push({
            type: 'low_battery',
            message: 'Bateria insuficiente para completar esta rota.',
            severity: 'danger',
          });
        }
      });

      setState({ routes, isCalculating: false, error: null });
      return routes;
    } catch {
      setState({
        routes: [],
        isCalculating: false,
        error: 'Erro ao calcular rotas. Tente novamente.',
      });
      return [];
    }
  }, []);

  const clearRoutes = useCallback(() => {
    setState({ routes: [], isCalculating: false, error: null });
  }, []);

  return {
    ...state,
    calculateRoutes,
    clearRoutes,
  };
}
