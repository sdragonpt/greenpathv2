export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export interface Weather {
  condition: WeatherCondition;
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  windDirection: string;
  precipitation: number; // mm
  uvIndex: number;
  visibility: number; // km
  description: string;
}

export interface WeatherForecast {
  current: Weather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface HourlyForecast {
  time: Date;
  condition: WeatherCondition;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
}

export interface DailyForecast {
  date: Date;
  condition: WeatherCondition;
  temperatureHigh: number;
  temperatureLow: number;
  precipitation: number;
  precipitationProbability: number;
  sunrise: Date;
  sunset: Date;
}

export interface WeatherAlert {
  type: 'rain' | 'storm' | 'wind' | 'heat' | 'cold';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  validFrom: Date;
  validTo: Date;
}
