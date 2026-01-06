// App configuration
export const APP_NAME = 'GreenPath';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Sustainable mobility, smarter routes';

// Default vehicle specs (electric scooter)
export const DEFAULT_VEHICLE = {
  name: 'Scooter Elétrica',
  maxRange: 45, // km at full charge
  batteryCapacity: 48, // Wh
  averageConsumption: 15, // Wh/km
  maxSpeed: 25, // km/h
};

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: [41.2925, -7.7467] as [number, number], // Vila Real, Portugal
  defaultZoom: 14,
  minZoom: 10,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

// Route types
export const ROUTE_TYPES = {
  FASTEST: 'fastest',
  EFFICIENT: 'efficient',
  SAFEST: 'safest',
} as const;

// Charging station statuses
export const CHARGING_STATUS = {
  AVAILABLE: 'available',
  LIMITED: 'limited',
  OCCUPIED: 'occupied',
} as const;

// Weather conditions
export const WEATHER_CONDITIONS = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  STORMY: 'stormy',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_USER: 'greenpath_auth_user',
  THEME: 'greenpath_theme',
  TRIP_HISTORY: 'greenpath_trip_history',
  PREFERENCES: 'greenpath_preferences',
};

// Navigation routes
export const ROUTES = {
  SPLASH: '/',
  WELCOME: '/welcome',
  LOGIN: '/login',
  SIGNUP: '/signup',
  HOME: '/home',
  ROUTE_PLANNING: '/route',
  NAVIGATION: '/navigation',
  CHARGING_STATIONS: '/charging',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HISTORY: '/history',
} as const;

// Bottom navigation items
export const NAV_ITEMS = [
  { path: ROUTES.HOME, icon: 'Home', label: 'Início' },
  { path: ROUTES.ROUTE_PLANNING, icon: 'Route', label: 'Rota' },
  { path: ROUTES.CHARGING_STATIONS, icon: 'Zap', label: 'Carregar' },
  { path: ROUTES.PROFILE, icon: 'User', label: 'Perfil' },
] as const;

// Quick actions for home screen
export const QUICK_ACTIONS = [
  { id: 'plan-route', icon: 'Navigation', label: 'Planear Rota', path: ROUTES.ROUTE_PLANNING },
  { id: 'charging', icon: 'Battery', label: 'Pontos de Carga', path: ROUTES.CHARGING_STATIONS },
  { id: 'history', icon: 'History', label: 'Histórico', path: ROUTES.HISTORY },
  { id: 'settings', icon: 'Settings', label: 'Definições', path: ROUTES.SETTINGS },
] as const;

// Animation durations (ms)
export const ANIMATION = {
  SPLASH_DURATION: 2500,
  PAGE_TRANSITION: 300,
  MODAL_TRANSITION: 200,
};

// Weather impact on autonomy (multipliers)
export const WEATHER_IMPACT = {
  sunny: 1.0,
  cloudy: 0.98,
  rainy: 0.85,
  stormy: 0.75,
};

// Terrain impact on autonomy (multipliers per 100m elevation)
export const TERRAIN_IMPACT = {
  uphill: 0.92,
  flat: 1.0,
  downhill: 1.08,
};
