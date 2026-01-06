import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader2, Search } from 'lucide-react';
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

// Nominatim API for geocoding (free OpenStreetMap API)
const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) return [];

  try {
    // Search in Northern Portugal with bounding box
    // North Portugal bounds: approx lat 41.0-42.2, lng -8.9 to -6.2
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '8',
      countrycodes: 'pt',
      // Bounding box for Northern Portugal (viewbox=lon1,lat1,lon2,lat2)
      viewbox: '-8.9,42.2,-6.2,40.8',
      bounded: '0', // Allow results outside viewbox but prioritize inside
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'Accept-Language': 'pt',
          'User-Agent': 'GreenPath-App/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();

    return data.map((item: any) => ({
      coordinates: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
      address: item.display_name,
      name: item.name || item.display_name.split(',')[0],
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

// Reverse geocoding to get address from coordinates
const reverseGeocode = async (coords: Coordinates): Promise<string> => {
  try {
    const params = new URLSearchParams({
      lat: coords.lat.toString(),
      lon: coords.lng.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          'Accept-Language': 'pt',
          'User-Agent': 'GreenPath-App/1.0',
        },
      }
    );

    if (!response.ok) return 'Localização atual';

    const data = await response.json();
    return data.display_name || 'Localização atual';
  } catch {
    return 'Localização atual';
  }
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const searchResults = await searchLocations(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isFocused, value]);

  const handleSelect = (location: Location) => {
    setQuery(location.name || location.address);
    setResults([]);
    setIsFocused(false);
    onChange?.(location);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onChange?.(null);
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Get address for the coordinates
        const address = await reverseGeocode(coords);

        const location: Location = {
          coordinates: coords,
          address,
          name: 'Localização atual',
        };

        setQuery(location.name);
        onChange?.(location);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        // Fallback to default location (Vila Real center)
        const fallbackLocation: Location = {
          coordinates: {
            lat: MAP_CONFIG.defaultCenter[0],
            lng: MAP_CONFIG.defaultCenter[1],
          },
          address: 'Vila Real, Portugal',
          name: 'Vila Real (padrão)',
        };
        setQuery(fallbackLocation.name || '');
        onChange?.(fallbackLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2',
            variant === 'start' ? 'text-green-500' : 'text-red-500'
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {query && !isSearching && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {allowCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isFocused && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {results.map((result, index) => (
            <button
              key={`${result.coordinates.lat}-${result.coordinates.lng}-${index}`}
              type="button"
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{result.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {result.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isFocused && query.length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm text-muted-foreground text-center">
            <Search className="inline h-4 w-4 mr-1" />
            Nenhum resultado para "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
