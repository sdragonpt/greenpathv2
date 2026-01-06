import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Location, Coordinates } from '@/types/route';
import { MAP_CONFIG } from '@/lib/constants';

interface LocationInputProps {
  value?: Location | null;
  onChange?: (location: Location | null) => void;
  placeholder?: string;
  label?: string;
  variant?: 'start' | 'end';
  allowCurrentLocation?: boolean;
  className?: string;
}

// Mock geocoding results
const mockSearchResults = (query: string): Location[] => {
  if (!query || query.length < 2) return [];

  const baseResults: Location[] = [
    {
      coordinates: { lat: 41.2925, lng: -7.7467 },
      address: 'Centro de Vila Real',
      name: 'Centro Histórico',
    },
    {
      coordinates: { lat: 41.2856, lng: -7.7392 },
      address: 'Universidade de Trás-os-Montes e Alto Douro',
      name: 'UTAD',
    },
    {
      coordinates: { lat: 41.3001, lng: -7.7589 },
      address: 'Parque Corgo',
      name: 'Parque Corgo',
    },
    {
      coordinates: { lat: 41.2789, lng: -7.7301 },
      address: 'Hospital de Vila Real',
      name: 'Hospital',
    },
    {
      coordinates: { lat: 41.2934, lng: -7.7512 },
      address: 'Estação de Vila Real',
      name: 'Estação',
    },
  ];

  return baseResults.filter(
    (r) =>
      r.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.address.toLowerCase().includes(query.toLowerCase())
  );
};

export function LocationInput({
  value,
  onChange,
  placeholder = 'Pesquisar localização...',
  label,
  variant = 'start',
  allowCurrentLocation = false,
  className,
}: LocationInputProps) {
  const [query, setQuery] = useState(value?.name || value?.address || '');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(value.name || value.address);
    }
  }, [value]);

  useEffect(() => {
    if (!isFocused || query === value?.name || query === value?.address) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResults = mockSearchResults(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isFocused, value]);

  const handleSelect = (location: Location) => {
    setQuery(location.name || location.address);
    setResults([]);
    onChange?.(location);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onChange?.(null);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          address: 'Localização atual',
          name: 'Localização atual',
        };
        handleSelect(location);
        setIsGettingLocation(false);
      },
      () => {
        // Fallback to mock location
        const location: Location = {
          coordinates: {
            lat: MAP_CONFIG.defaultCenter[0],
            lng: MAP_CONFIG.defaultCenter[1],
          },
          address: 'Vila Real, Portugal',
          name: 'Localização atual',
        };
        handleSelect(location);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const variantColors = {
    start: 'border-l-4 border-l-green-500',
    end: 'border-l-4 border-l-red-500',
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}

      <div className={cn("relative", variantColors[variant])}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          icon={<MapPin className="h-4 w-4" />}
          className="pr-20"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {allowCurrentLocation && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isFocused && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {results.map((location, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
              onClick={() => handleSelect(location)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                {location.name && (
                  <p className="font-medium truncate">{location.name}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {location.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
