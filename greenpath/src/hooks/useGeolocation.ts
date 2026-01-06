import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '@/types/route';
import { MAP_CONFIG } from '@/lib/constants';

interface GeolocationState {
  position: Coordinates | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
  watch: false,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { enableHighAccuracy, timeout, maximumAge, watch } = {
    ...defaultOptions,
    ...options,
  };

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
    isWatching: false,
    accuracy: null,
    heading: null,
    speed: null,
  });

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setState({
      position: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      },
      error: null,
      isLoading: false,
      isWatching: watch || false,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
    });
  }, [watch]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Erro de localização desconhecido';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permissão de localização negada';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Localização indisponível';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tempo limite excedido';
        break;
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
      isWatching: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
      }));
      return () => {};
    }

    setState((prev) => ({ ...prev, isWatching: true, isLoading: true }));

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState((prev) => ({ ...prev, isWatching: false }));
    };
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  // Mock position for development/demo
  const setMockPosition = useCallback((coords?: Coordinates) => {
    setState({
      position: coords || { lat: MAP_CONFIG.defaultCenter[0], lng: MAP_CONFIG.defaultCenter[1] },
      error: null,
      isLoading: false,
      isWatching: false,
      accuracy: 10,
      heading: 45,
      speed: 15,
    });
  }, []);

  useEffect(() => {
    if (watch) {
      const stopWatching = startWatching();
      return stopWatching;
    }
  }, [watch, startWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    setMockPosition,
  };
}
