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

// Map configuration - UPDATED for Norte de Portugal
export const MAP_CONFIG = {
  // Center of Northern Portugal (between Porto and Vila Real)
  defaultCenter: [41.35, -8.0] as [number, number],
  defaultZoom: 10, // Reduced zoom to show more area
  minZoom: 8,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  
  // Northern Portugal bounds for constraining the map
  bounds: {
    north: 42.2,  // Top of Minho
    south: 40.8,  // Around Aveiro/Viseu
    west: -8.9,   // Atlantic coast
    east: -6.2,   // Spanish border
  },
  
  // Key cities in Norte de Portugal with coordinates
  cities: {
    porto: { lat: 41.1579, lng: -8.6291, name: 'Porto' },
    braga: { lat: 41.5510, lng: -8.4265, name: 'Braga' },
    guimaraes: { lat: 41.4424, lng: -8.2918, name: 'Guimarães' },
    vilaReal: { lat: 41.2925, lng: -7.7467, name: 'Vila Real' },
    vianaDoCastelo: { lat: 41.6939, lng: -8.8342, name: 'Viana do Castelo' },
    braganca: { lat: 41.8057, lng: -6.7589, name: 'Bragança' },
    chaves: { lat: 41.7400, lng: -7.4714, name: 'Chaves' },
    lamego: { lat: 41.0959, lng: -7.8108, name: 'Lamego' },
    regua: { lat: 41.1621, lng: -7.7850, name: 'Peso da Régua' },
    amarante: { lat: 41.2705, lng: -8.0830, name: 'Amarante' },
    barcelos: { lat: 41.5346, lng: -8.6176, name: 'Barcelos' },
    famalicao: { lat: 41.4089, lng: -8.5189, name: 'Famalicão' },
    povoa: { lat: 41.3823, lng: -8.7627, name: 'Póvoa de Varzim' },
    penafiel: { lat: 41.2055, lng: -8.2843, name: 'Penafiel' },
    felgueiras: { lat: 41.3669, lng: -8.1971, name: 'Felgueiras' },
    santoTirso: { lat: 41.3433, lng: -8.4779, name: 'Santo Tirso' },
    matosinhos: { lat: 41.1819, lng: -8.6919, name: 'Matosinhos' },
    gaia: { lat: 41.1246, lng: -8.6151, name: 'Vila Nova de Gaia' },
  },
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
export const WEATHER_IMPACT: Record<string, number> = {
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

// API Endpoints (for future use with your own backend)
export const API_ENDPOINTS = {
  // Geocoding - Nominatim (OpenStreetMap)
  NOMINATIM_SEARCH: 'https://nominatim.openstreetmap.org/search',
  NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
  
  // Routing - OSRM
  OSRM_ROUTE: 'https://router.project-osrm.org/route/v1',
  
  // Charging Stations - Open Charge Map
  OPEN_CHARGE_MAP: 'https://api.openchargemap.io/v3/poi',
  
  // Weather (example - would need API key)
  // OPENWEATHER: 'https://api.openweathermap.org/data/2.5/weather',
};

// API rate limiting
export const API_RATE_LIMITS = {
  NOMINATIM_DELAY_MS: 1000, // Nominatim requires 1 request per second max
  OCM_MAX_RESULTS: 100,
  OSRM_MAX_WAYPOINTS: 100,
};
