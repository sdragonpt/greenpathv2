import { useState, useEffect, useCallback } from 'react';
import { ChargingStation, ChargingStatus, ChargerType, StationAmenity } from '@/types/charging';
import { Coordinates } from '@/types/route';
import { generateId } from '@/lib/utils';
import { MAP_CONFIG } from '@/lib/constants';

interface UseChargingStationsState {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  isLoading: boolean;
  error: string | null;
}

// Open Charge Map API types
interface OCMConnection {
  ConnectionTypeID: number;
  ConnectionType?: { Title: string };
  PowerKW?: number;
  Quantity?: number;
  StatusType?: { IsOperational: boolean };
}

interface OCMStation {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Latitude: number;
    Longitude: number;
    Distance?: number;
  };
  Connections?: OCMConnection[];
  StatusType?: {
    IsOperational: boolean;
    ID: number;
  };
  UsageCost?: string;
  NumberOfPoints?: number;
  UserComments?: { Rating?: number }[];
  MediaItems?: any[];
}

// Map OCM data to our ChargingStation type
const mapOCMToStation = (ocm: OCMStation, userLocation?: Coordinates): ChargingStation => {
  const maxPower = Math.max(...(ocm.Connections?.map(c => c.PowerKW || 0) || [0]));
  let chargerType: ChargerType = 'standard';
  if (maxPower >= 50) chargerType = 'ultra_fast';
  else if (maxPower >= 22) chargerType = 'fast';

  let status: ChargingStatus = 'available';
  if (ocm.StatusType) {
    if (!ocm.StatusType.IsOperational) {
      status = 'occupied';
    } else if (ocm.StatusType.ID === 50) {
      status = 'limited';
    }
  }

  const totalSlots = ocm.NumberOfPoints || ocm.Connections?.reduce((sum, c) => sum + (c.Quantity || 1), 0) || 2;
  const availableSlots = status === 'available' ? totalSlots : status === 'limited' ? Math.floor(totalSlots / 2) : 0;

  let pricePerKwh = 0.25;
  if (ocm.UsageCost) {
    const priceMatch = ocm.UsageCost.match(/(\d+[.,]\d+)/);
    if (priceMatch) {
      pricePerKwh = parseFloat(priceMatch[1].replace(',', '.'));
    }
  }

  let distance: number | undefined;
  let estimatedTime: number | undefined;
  if (userLocation) {
    distance = ocm.AddressInfo.Distance || calculateDistance(
      userLocation,
      { lat: ocm.AddressInfo.Latitude, lng: ocm.AddressInfo.Longitude }
    );
    estimatedTime = Math.round(distance * 3);
  }

  const amenities = inferAmenities(ocm.AddressInfo.Title, ocm.AddressInfo.AddressLine1);

  const comments = ocm.UserComments || [];
  const ratings = comments.filter(c => c.Rating).map(c => c.Rating!);
  const rating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : 3.5 + Math.random() * 1.5;

  return {
    id: `ocm-${ocm.ID}`,
    name: ocm.AddressInfo.Title || 'Posto de Carregamento',
    address: [
      ocm.AddressInfo.AddressLine1,
      ocm.AddressInfo.Town,
      ocm.AddressInfo.StateOrProvince
    ].filter(Boolean).join(', '),
    coordinates: {
      lat: ocm.AddressInfo.Latitude,
      lng: ocm.AddressInfo.Longitude,
    },
    status,
    chargerType,
    availableSlots,
    totalSlots,
    pricePerKwh: Math.round(pricePerKwh * 100) / 100,
    rating: Math.round(rating * 10) / 10,
    reviews: comments.length || Math.floor(Math.random() * 50),
    amenities,
    openingHours: { is24h: true },
    distance,
    estimatedTime,
  };
};

const inferAmenities = (title: string, address?: string): StationAmenity[] => {
  const text = `${title} ${address || ''}`.toLowerCase();
  const amenities: StationAmenity[] = [];

  if (text.includes('shopping') || text.includes('centro comercial') || text.includes('mall')) {
    amenities.push('shop', 'restroom', 'cafe');
  }
  if (text.includes('hotel') || text.includes('pousada')) {
    amenities.push('wifi', 'restroom', 'cafe');
  }
  if (text.includes('restaurante') || text.includes('restaurant')) {
    amenities.push('restaurant', 'restroom');
  }
  if (text.includes('café') || text.includes('coffee')) {
    amenities.push('cafe');
  }
  if (text.includes('supermercado') || text.includes('continente') || text.includes('pingo doce') || text.includes('lidl')) {
    amenities.push('shop', 'parking');
  }
  if (text.includes('parque') || text.includes('parking')) {
    amenities.push('parking', 'shelter');
  }
  if (text.includes('gasolineira') || text.includes('galp') || text.includes('bp') || text.includes('repsol')) {
    amenities.push('shop', 'restroom', '24h');
  }
  if (text.includes('24h') || text.includes('galp') || text.includes('bp') || text.includes('repsol')) {
    if (!amenities.includes('24h')) amenities.push('24h');
  }
  if (amenities.length === 0) {
    const random = Math.random();
    if (random < 0.3) amenities.push('parking');
    if (random < 0.5) amenities.push('wifi');
  }

  return amenities;
};

const calculateDistance = (start: Coordinates, end: Coordinates): number => {
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
  return Math.round(R * c * 10) / 10;
};

// Fetch charging stations - USANDO PROXY CORS
const fetchChargingStations = async (
  location: Coordinates,
  radiusKm: number = 50
): Promise<ChargingStation[]> => {
  try {
    const params = new URLSearchParams({
      output: 'json',
      countrycode: 'PT',
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      distance: radiusKm.toString(),
      distanceunit: 'km',
      maxresults: '100',
      compact: 'true',
      verbose: 'false',
    });

    // URL original da API
    const apiUrl = `https://api.openchargemap.io/v3/poi?${params}`;
    
    // Usar proxy CORS para contornar o bloqueio
    // Opção 1: corsproxy.io (mais fiável)
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    // Opção 2: allorigins (alternativa)
    // const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Open Charge Map API failed');
    }

    const data: OCMStation[] = await response.json();

    const stations = data
      .map(ocm => mapOCMToStation(ocm, location))
      .sort((a, b) => (a.distance || 999) - (b.distance || 999));

    console.log(`✅ Loaded ${stations.length} charging stations from API`);
    return stations;
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    return [];
  }
};

// Dados de fallback completos para Norte de Portugal
const generateMockStations = (center: Coordinates): ChargingStation[] => {
  const stationData = [
    // Vila Real
    { name: 'MOBI.E - Vila Real Centro', address: 'Av. Carvalho Araújo, Vila Real', lat: 41.2925, lng: -7.7467 },
    { name: 'MOBI.E - UTAD', address: 'Universidade de Trás-os-Montes, Vila Real', lat: 41.2856, lng: -7.7392 },
    { name: 'Galp - Vila Real', address: 'EN 2, Vila Real', lat: 41.3001, lng: -7.7589 },
    { name: 'EDP - Hospital Vila Real', address: 'Hospital de Vila Real', lat: 41.2789, lng: -7.7301 },
    
    // Porto
    { name: 'MOBI.E - Ribeira Porto', address: 'Cais da Ribeira, Porto', lat: 41.1403, lng: -8.6131 },
    { name: 'EDP - Boavista', address: 'Rotunda da Boavista, Porto', lat: 41.1579, lng: -8.6291 },
    { name: 'Galp - Gaia', address: 'Av. República, Gaia', lat: 41.1246, lng: -8.6151 },
    { name: 'Tesla Supercharger - Mar Shopping', address: 'Mar Shopping Matosinhos', lat: 41.2113, lng: -8.6952 },
    { name: 'MOBI.E - Aliados', address: 'Praça dos Aliados, Porto', lat: 41.1496, lng: -8.6109 },
    { name: 'Ionity - NorteShopping', address: 'NorteShopping, Matosinhos', lat: 41.1872, lng: -8.6558 },
    
    // Braga
    { name: 'MOBI.E - Braga Centro', address: 'Av. Central, Braga', lat: 41.5510, lng: -8.4265 },
    { name: 'EDP - Bom Jesus', address: 'Santuário Bom Jesus, Braga', lat: 41.5549, lng: -8.3770 },
    { name: 'Galp - Braga', address: 'EN 14, Braga', lat: 41.5387, lng: -8.4455 },
    { name: 'MOBI.E - Universidade Minho', address: 'Campus de Gualtar, Braga', lat: 41.5608, lng: -8.3970 },
    
    // Guimarães
    { name: 'MOBI.E - Guimarães Centro', address: 'Centro Histórico, Guimarães', lat: 41.4424, lng: -8.2918 },
    { name: 'Prio - Guimarães', address: 'Zona Industrial, Guimarães', lat: 41.4512, lng: -8.3021 },
    
    // Viana do Castelo
    { name: 'MOBI.E - Viana Centro', address: 'Praça da República, Viana do Castelo', lat: 41.6939, lng: -8.8342 },
    { name: 'EDP - Marina Viana', address: 'Marina de Viana, Viana do Castelo', lat: 41.6880, lng: -8.8390 },
    
    // Bragança
    { name: 'MOBI.E - Bragança', address: 'Av. João da Cruz, Bragança', lat: 41.8057, lng: -6.7589 },
    { name: 'Galp - Bragança', address: 'EN 15, Bragança', lat: 41.8102, lng: -6.7512 },
    
    // Chaves
    { name: 'MOBI.E - Chaves', address: 'Jardim Público, Chaves', lat: 41.7400, lng: -7.4714 },
    { name: 'EDP - Termas Chaves', address: 'Zona Termal, Chaves', lat: 41.7350, lng: -7.4680 },
    
    // Lamego
    { name: 'MOBI.E - Lamego', address: 'Santuário Remédios, Lamego', lat: 41.0959, lng: -7.8108 },
    
    // Peso da Régua
    { name: 'MOBI.E - Régua', address: 'Av. da Galiza, Peso da Régua', lat: 41.1621, lng: -7.7850 },
    { name: 'EDP - Douro', address: 'Marginal do Douro, Régua', lat: 41.1580, lng: -7.7920 },
    
    // Amarante
    { name: 'MOBI.E - Amarante', address: 'Largo Conselheiro António Cândido, Amarante', lat: 41.2705, lng: -8.0830 },
    
    // Barcelos
    { name: 'MOBI.E - Barcelos', address: 'Campo da República, Barcelos', lat: 41.5346, lng: -8.6176 },
    
    // Famalicão
    { name: 'EDP - Famalicão', address: 'Av. 25 de Abril, Famalicão', lat: 41.4089, lng: -8.5189 },
    { name: 'MOBI.E - Famalicão Centro', address: 'Centro de Famalicão', lat: 41.4050, lng: -8.5220 },
    
    // Póvoa de Varzim
    { name: 'MOBI.E - Póvoa', address: 'Av. dos Banhos, Póvoa de Varzim', lat: 41.3823, lng: -8.7627 },
    
    // Penafiel
    { name: 'MOBI.E - Penafiel', address: 'Praça Municipal, Penafiel', lat: 41.2055, lng: -8.2843 },
    
    // Felgueiras
    { name: 'MOBI.E - Felgueiras', address: 'Centro de Felgueiras', lat: 41.3669, lng: -8.1971 },
    
    // Santo Tirso
    { name: 'MOBI.E - Santo Tirso', address: 'Praça Camilo Castelo Branco, Santo Tirso', lat: 41.3433, lng: -8.4779 },
    
    // Paredes
    { name: 'MOBI.E - Paredes', address: 'Centro de Paredes', lat: 41.2050, lng: -8.3314 },
    
    // Paços de Ferreira
    { name: 'MOBI.E - Paços Ferreira', address: 'Centro de Paços de Ferreira', lat: 41.2778, lng: -8.3867 },
    
    // Valongo
    { name: 'MOBI.E - Valongo', address: 'Centro de Valongo', lat: 41.1869, lng: -8.4983 },
    
    // Gondomar
    { name: 'MOBI.E - Gondomar', address: 'Centro de Gondomar', lat: 41.1500, lng: -8.5333 },
    
    // Maia
    { name: 'MOBI.E - Maia', address: 'Fórum da Maia', lat: 41.2356, lng: -8.6200 },
    { name: 'EDP - Aeroporto', address: 'Aeroporto Francisco Sá Carneiro', lat: 41.2481, lng: -8.6814 },
    
    // Espinho
    { name: 'MOBI.E - Espinho', address: 'Centro de Espinho', lat: 41.0078, lng: -8.6411 },
    
    // Ovar
    { name: 'MOBI.E - Ovar', address: 'Centro de Ovar', lat: 40.8594, lng: -8.6253 },
    
    // Feira
    { name: 'MOBI.E - Santa Maria da Feira', address: 'Centro da Feira', lat: 40.9250, lng: -8.5422 },
    
    // São João da Madeira
    { name: 'MOBI.E - S. João Madeira', address: 'Centro de S. João da Madeira', lat: 40.9006, lng: -8.4906 },
    
    // Oliveira de Azeméis
    { name: 'MOBI.E - Oliveira Azeméis', address: 'Centro de Oliveira de Azeméis', lat: 40.8394, lng: -8.4772 },
  ];

  const statuses: ChargingStatus[] = ['available', 'available', 'available', 'limited', 'limited', 'occupied'];
  const chargerTypes: ChargerType[] = ['standard', 'standard', 'fast', 'fast', 'ultra_fast'];

  return stationData.map((station) => {
    const distance = calculateDistance(center, { lat: station.lat, lng: station.lng });
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalSlots = 2 + Math.floor(Math.random() * 4);
    const chargerType = chargerTypes[Math.floor(Math.random() * chargerTypes.length)];

    return {
      id: generateId(),
      name: station.name,
      address: station.address,
      coordinates: { lat: station.lat, lng: station.lng },
      status,
      chargerType,
      availableSlots: status === 'available' ? totalSlots : status === 'limited' ? Math.floor(totalSlots / 2) : 0,
      totalSlots,
      pricePerKwh: 0.15 + Math.random() * 0.15,
      rating: 3.5 + Math.random() * 1.5,
      reviews: Math.floor(10 + Math.random() * 100),
      amenities: inferAmenities(station.name, station.address),
      openingHours: { is24h: Math.random() > 0.2 },
      distance,
      estimatedTime: Math.round(distance * 3),
    };
  }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
};

export function useChargingStations(userLocation?: Coordinates | null) {
  const [state, setState] = useState<UseChargingStationsState>({
    stations: [],
    selectedStation: null,
    isLoading: false,
    error: null,
  });

  const fetchStations = useCallback(async (location?: Coordinates) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const center = location || {
      lat: MAP_CONFIG.defaultCenter[0],
      lng: MAP_CONFIG.defaultCenter[1],
    };

    try {
      // Tentar API com proxy CORS
      let stations = await fetchChargingStations(center, 75);

      // Se falhar, usar dados de fallback
      if (stations.length === 0) {
        console.warn('⚠️ Using fallback charging stations data');
        stations = generateMockStations(center);
      }

      setState({
        stations,
        selectedStation: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading charging stations:', error);
      
      // Usar fallback
      const stations = generateMockStations(center);
      
      setState({
        stations,
        selectedStation: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const selectStation = useCallback((station: ChargingStation | null) => {
    setState((prev) => ({ ...prev, selectedStation: station }));
  }, []);

  const getStationById = useCallback((id: string): ChargingStation | undefined => {
    return state.stations.find((s) => s.id === id);
  }, [state.stations]);

  const getAvailableStations = useCallback((): ChargingStation[] => {
    return state.stations.filter((s) => s.status === 'available');
  }, [state.stations]);

  const getNearestStation = useCallback((location: Coordinates): ChargingStation | null => {
    if (state.stations.length === 0) return null;
    
    return state.stations.reduce((nearest, station) => {
      const distance = station.distance || Infinity;
      const nearestDistance = nearest.distance || Infinity;
      return distance < nearestDistance ? station : nearest;
    });
  }, [state.stations]);

  const getStationsByCity = useCallback((city: string): ChargingStation[] => {
    const cityLower = city.toLowerCase();
    return state.stations.filter(s => 
      s.address.toLowerCase().includes(cityLower) ||
      s.name.toLowerCase().includes(cityLower)
    );
  }, [state.stations]);

  useEffect(() => {
    fetchStations(userLocation || undefined);
  }, [fetchStations, userLocation?.lat, userLocation?.lng]);

  return {
    ...state,
    fetchStations,
    selectStation,
    getStationById,
    getAvailableStations,
    getNearestStation,
    getStationsByCity,
  };
}
