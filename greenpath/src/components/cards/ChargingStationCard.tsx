import React from 'react';
import { MapPin, Clock, Star, Zap, Wifi, Coffee, Car, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDistance, formatDuration } from '@/lib/utils';
import { ChargingStation, StationAmenity } from '@/types/charging';

interface ChargingStationCardProps {
  station: ChargingStation;
  onNavigate?: (station: ChargingStation) => void;
  onSelect?: (station: ChargingStation) => void;
  isSelected?: boolean;
  compact?: boolean;
  className?: string;
}

const amenityIcons: Record<StationAmenity, { icon: React.ElementType; label: string }> = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  restroom: { icon: () => <span>🚻</span>, label: 'WC' },
  cafe: { icon: Coffee, label: 'Café' },
  restaurant: { icon: () => <span>🍽️</span>, label: 'Restaurante' },
  shop: { icon: () => <span>🛒</span>, label: 'Loja' },
  parking: { icon: Car, label: 'Parque' },
  shelter: { icon: () => <span>🏠</span>, label: 'Abrigo' },
  '24h': { icon: Clock, label: '24h' },
};

const chargerTypeLabels = {
  standard: 'Standard',
  fast: 'Rápido',
  ultra_fast: 'Ultra-Rápido',
};

export function ChargingStationCard({
  station,
  onNavigate,
  onSelect,
  isSelected = false,
  compact = false,
  className,
}: ChargingStationCardProps) {
  return (
    <Card
      variant="default"
      interactive={!!onSelect}
      className={cn(
        "transition-all duration-200",
        isSelected && "border-primary bg-primary/5",
        className
      )}
      onClick={() => onSelect?.(station)}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{station.name}</h3>
              <StatusBadge status={station.status} />
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{station.address}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{station.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({station.reviews})</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          {/* Distance */}
          {station.distance !== undefined && (
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span>{formatDistance(station.distance)}</span>
            </div>
          )}

          {/* Time */}
          {station.estimatedTime !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(station.estimatedTime)}</span>
            </div>
          )}

          {/* Slots */}
          <div className="flex items-center gap-1">
            <Zap className={cn(
              "h-4 w-4",
              station.status === 'available' ? 'text-green-500' : 
              station.status === 'limited' ? 'text-yellow-500' : 'text-red-500'
            )} />
            <span className={cn(
              station.status === 'available' ? 'text-green-600 dark:text-green-400' : 
              station.status === 'limited' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
            )}>
              {station.availableSlots}/{station.totalSlots}
            </span>
          </div>

          {/* Charger Type */}
          <span className="text-muted-foreground">
            {chargerTypeLabels[station.chargerType]}
          </span>
        </div>

        {!compact && (
          <>
            {/* Price */}
            <div className="flex items-center justify-between mb-3 py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Preço</span>
              <span className="font-semibold">
                {station.pricePerKwh.toFixed(2)}€/kWh
              </span>
            </div>

            {/* Amenities */}
            {station.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {station.amenities.slice(0, 4).map((amenity) => {
                  const config = amenityIcons[amenity];
                  const Icon = config.icon;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg text-xs"
                      title={config.label}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{config.label}</span>
                    </div>
                  );
                })}
                {station.amenities.length > 4 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{station.amenities.length - 4}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        {onNavigate && (
          <Button
            variant={station.status === 'occupied' ? 'secondary' : 'default'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(station);
            }}
            disabled={station.status === 'occupied'}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {station.status === 'occupied' ? 'Ocupado' : 'Navegar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
