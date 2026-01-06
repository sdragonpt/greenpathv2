import { useState, useEffect, useCallback } from 'react';
import { ChargingStation, ChargingStatus } from '@/types/charging';
import { Coordinates } from '@/types/route';
import { generateId } from '@/lib/utils';
import { MAP_CONFIG } from '@/lib/constants';

interface UseChargingStationsState {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  isLoading: boolean;
  error: string | null;
}

// Mock charging station data
const generateMockStations = (center: Coordinates): ChargingStation[] => {
  const stationNames = [
    { name: 'EcoCharge Centro', address: 'Rua Central, 45' },
    { name: 'GreenPoint Parque', address: 'Av. do Parque, 120' },
    { name: 'VoltUp Estação', address: 'Praça da República, 8' },
    { name: 'ChargeNow Shopping', address: 'Centro Comercial Norte' },
    { name: 'EcoStation Campus', address: 'Universidade, Edifício A' },
    { name: 'PowerHub Mercado', address: 'Mercado Municipal, P1' },
    { name: 'GreenWatt Terminal', address: 'Terminal Rodoviário' },
    { name: 'ElectroPoint Hospital', address: 'Hospital Central, P2' },
  ];

  const statuses: ChargingStatus[] = ['available', 'available', 'available', 'limited', 'limited', 'occupied'];
  
  return stationNames.map((station, index) => {
    const angle = (index / stationNames.length) * 2 * Math.PI;
    const distance = 0.5 + Math.random() * 2; // 0.5 to 2.5 km
    
    const lat = center.lat + (distance / 111) * Math.cos(angle);
    const lng = center.lng + (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalSlots = 2 + Math.floor(Math.random() * 4);
    const availableSlots = status === 'available' 
      ? totalSlots 
      : status === 'limited' 
        ? Math.floor(totalSlots / 2) 
        : 0;

    return {
      id: generateId(),
      name: station.name,
      address: station.address,
      coordinates: { lat, lng },
      status,
      chargerType: Math.random() > 0.7 ? 'fast' : 'standard',
      availableSlots,
      totalSlots,
      pricePerKwh: 0.15 + Math.random() * 0.15,
      rating: 3.5 + Math.random() * 1.5,
      reviews: Math.floor(10 + Math.random() * 200),
      amenities: generateRandomAmenities(),
      openingHours: { is24h: Math.random() > 0.3 },
      distance: Math.round(distance * 10) / 10,
      estimatedTime: Math.round(distance * 3), // ~20km/h average
    };
  });
};

const generateRandomAmenities = () => {
  const allAmenities: ChargingStation['amenities'] = [
    'wifi', 'restroom', 'cafe', 'restaurant', 'shop', 'parking', 'shelter', '24h'
  ];
  
  const numAmenities = 1 + Math.floor(Math.random() * 4);
  const shuffled = [...allAmenities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numAmenities);
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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const center = location || {
        lat: MAP_CONFIG.defaultCenter[0],
        lng: MAP_CONFIG.defaultCenter[1],
      };

      const stations = generateMockStations(center);

      setState({
        stations,
        selectedStation: null,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar pontos de carregamento',
      }));
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

  // Fetch stations on mount or when user location changes
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
  };
}
