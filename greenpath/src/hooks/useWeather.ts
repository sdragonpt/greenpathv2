import { useState, useEffect, useCallback } from 'react';
import { Weather, WeatherCondition, WeatherAlert } from '@/types/weather';
import { Coordinates } from '@/types/route';

interface UseWeatherState {
  weather: Weather | null;
  alerts: WeatherAlert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Mock weather data generator
const generateMockWeather = (): Weather => {
  const conditions: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'stormy'];
  const condition = conditions[Math.floor(Math.random() * 3)]; // Bias towards better weather
  
  const baseTemperature = 18;
  const temperatureVariation = Math.random() * 10 - 5;
  
  return {
    condition,
    temperature: Math.round(baseTemperature + temperatureVariation),
    humidity: Math.round(40 + Math.random() * 40),
    windSpeed: Math.round(5 + Math.random() * 20),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    precipitation: condition === 'rainy' ? Math.round(Math.random() * 10) : 0,
    uvIndex: condition === 'sunny' ? Math.round(3 + Math.random() * 5) : Math.round(1 + Math.random() * 2),
    visibility: condition === 'rainy' ? Math.round(5 + Math.random() * 5) : Math.round(10 + Math.random() * 10),
    description: getWeatherDescription(condition),
  };
};

const getWeatherDescription = (condition: WeatherCondition): string => {
  const descriptions: Record<WeatherCondition, string[]> = {
    sunny: ['Céu limpo', 'Sol radiante', 'Tempo excelente'],
    cloudy: ['Parcialmente nublado', 'Céu encoberto', 'Nuvens dispersas'],
    rainy: ['Chuva ligeira', 'Aguaceiros', 'Tempo chuvoso'],
    stormy: ['Trovoada', 'Tempestade', 'Condições severas'],
  };
  
  const options = descriptions[condition];
  return options[Math.floor(Math.random() * options.length)];
};

const generateAlerts = (weather: Weather): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  
  if (weather.condition === 'rainy' || weather.condition === 'stormy') {
    alerts.push({
      type: 'rain',
      severity: weather.condition === 'stormy' ? 'danger' : 'warning',
      message: weather.condition === 'stormy' 
        ? 'Tempestade prevista. Considere adiar a viagem.'
        : 'Chuva prevista no percurso. A autonomia pode ser reduzida.',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 3600000 * 3),
    });
  }
  
  if (weather.windSpeed > 25) {
    alerts.push({
      type: 'wind',
      severity: 'warning',
      message: 'Ventos fortes previstos. Tenha cuidado extra.',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 3600000 * 2),
    });
  }
  
  if (weather.temperature > 35) {
    alerts.push({
      type: 'heat',
      severity: 'info',
      message: 'Temperaturas elevadas. Mantenha-se hidratado.',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 3600000 * 6),
    });
  }
  
  return alerts;
};

export function useWeather(location?: Coordinates | null) {
  const [state, setState] = useState<UseWeatherState>({
    weather: null,
    alerts: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchWeather = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const weather = generateMockWeather();
      const alerts = generateAlerts(weather);
      
      setState({
        weather,
        alerts,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao obter dados meteorológicos',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Fetch weather on mount or when location changes
  useEffect(() => {
    fetchWeather();
    
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather, location?.lat, location?.lng]);

  const hasRainAlert = state.alerts.some((alert) => alert.type === 'rain');
  const hasSevereAlert = state.alerts.some((alert) => alert.severity === 'danger');

  return {
    ...state,
    refresh,
    hasRainAlert,
    hasSevereAlert,
  };
}
