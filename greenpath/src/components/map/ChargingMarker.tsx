import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ChargingStation } from '@/types/charging';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation2, Zap, Star, Clock } from 'lucide-react';

interface ChargingMarkerProps {
  station: ChargingStation;
  onClick?: () => void;
}

// Custom marker icons based on status
const createChargingIcon = (status: ChargingStation['status']) => {
  const colors = {
    available: { bg: '#22c55e', border: '#16a34a' },
    limited: { bg: '#eab308', border: '#ca8a04' },
    occupied: { bg: '#ef4444', border: '#dc2626' },
    offline: { bg: '#6b7280', border: '#4b5563' },
  };

  const color = colors[status] || colors.offline;

  return L.divIcon({
    className: 'custom-charging-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: ${color.bg};
          border: 3px solid ${color.border};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export function ChargingMarker({ station, onClick }: ChargingMarkerProps) {
  const icon = createChargingIcon(station.status);

  const statusLabels = {
    available: 'Disponível',
    limited: 'Limitado',
    occupied: 'Ocupado',
    offline: 'Offline',
  };

  const statusVariants = {
    available: 'success' as const,
    limited: 'warning' as const,
    occupied: 'destructive' as const,
    offline: 'secondary' as const,
  };

  return (
    <Marker
      position={[station.coordinates.lat, station.coordinates.lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="charging-popup" minWidth={250} maxWidth={300}>
        <div className="p-1">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{station.name}</h3>
              <p className="text-xs text-gray-500">{station.address}</p>
            </div>
            <Badge variant={statusVariants[station.status]}>
              {statusLabels[station.status]}
            </Badge>
          </div>

          {/* Quick Info */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-100 p-2">
              <Zap className="mx-auto mb-1 h-4 w-4 text-green-500" />
              <p className="text-xs font-medium">{station.availableSlots}/{station.totalSlots}</p>
              <p className="text-[10px] text-gray-500">Lugares</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-2">
              <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
              <p className="text-xs font-medium">{station.rating?.toFixed(1) || 'N/A'}</p>
              <p className="text-[10px] text-gray-500">Avaliação</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-2">
              <Clock className="mx-auto mb-1 h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium">{station.estimatedTime || '~5'} min</p>
              <p className="text-[10px] text-gray-500">Distância</p>
            </div>
          </div>

          {/* Price */}
          {station.pricePerKwh && (
            <div className="mb-3 rounded-lg bg-green-50 p-2 text-center">
              <span className="text-sm font-semibold text-green-700">
                {station.pricePerKwh.toFixed(2)} €/kWh
              </span>
            </div>
          )}

          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {station.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
                >
                  {amenity}
                </span>
              ))}
              {station.amenities.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                  +{station.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Navigate Button */}
          <Button
            size="sm"
            className="w-full gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Navigation2 className="h-3 w-3" />
            Navegar
          </Button>
        </div>
      </Popup>
    </Marker>
  );
}
