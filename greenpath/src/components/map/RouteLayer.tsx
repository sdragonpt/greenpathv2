import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Route, RouteType, Coordinates } from '@/types/route';

interface RouteLayerProps {
  route: Route;
  showMarkers?: boolean;
  animated?: boolean;
}

// Cores das rotas por tipo
const routeColors: Record<RouteType, { main: string; outline: string }> = {
  fastest: { main: '#3b82f6', outline: '#1d4ed8' }, // Azul
  efficient: { main: '#22c55e', outline: '#15803d' }, // Verde
  safest: { main: '#f59e0b', outline: '#d97706' }, // Amarelo
};

// Criar ícones customizados para marcadores
const createMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-route-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const startIcon = createMarkerIcon('#22c55e', 'A');
const endIcon = createMarkerIcon('#ef4444', 'B');

export function RouteLayer({ route, showMarkers = true, animated = false }: RouteLayerProps) {
  // Verificar se a rota tem waypoints válidos
  if (!route?.waypoints || route.waypoints.length < 2) {
    console.warn('RouteLayer: Invalid or empty waypoints');
    return null;
  }

  const colors = routeColors[route.type] || routeColors.efficient;
  
  // Converter waypoints para formato Leaflet [lat, lng]
  const positions: [number, number][] = route.waypoints
    .filter((coord: Coordinates) => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng)
    )
    .map((coord: Coordinates) => [coord.lat, coord.lng] as [number, number]);

  if (positions.length < 2) {
    console.warn('RouteLayer: Not enough valid positions after filtering');
    return null;
  }

  return (
    <>
      {/* Linha de contorno (mais grossa, mais escura) */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: colors.outline,
          weight: 8,
          opacity: 0.5,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Linha principal da rota */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: colors.main,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: animated ? '10, 10' : undefined,
          className: animated ? 'route-animated' : undefined,
        }}
      />

      {/* Marcadores de início e fim */}
      {showMarkers && (
        <>
          <Marker position={positions[0]} icon={startIcon}>
            <Popup>
              <div className="text-sm p-1">
                <strong className="text-green-600">Origem</strong>
                <p className="text-gray-600 mt-1">
                  {route.start?.name || route.start?.address || 'Ponto de partida'}
                </p>
              </div>
            </Popup>
          </Marker>

          <Marker position={positions[positions.length - 1]} icon={endIcon}>
            <Popup>
              <div className="text-sm p-1">
                <strong className="text-red-600">Destino</strong>
                <p className="text-gray-600 mt-1">
                  {route.end?.name || route.end?.address || 'Ponto de chegada'}
                </p>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </>
  );
}

// Componente para múltiplas rotas (comparação)
interface MultiRouteLayerProps {
  routes: Route[];
  selectedRouteId?: string;
  onRouteClick?: (route: Route) => void;
}

export function MultiRouteLayer({
  routes,
  selectedRouteId,
  onRouteClick,
}: MultiRouteLayerProps) {
  return (
    <>
      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        const colors = routeColors[route.type];
        
        const positions: [number, number][] = route.waypoints
          .filter((coord: Coordinates) => 
            coord && typeof coord.lat === 'number' && typeof coord.lng === 'number'
          )
          .map((coord: Coordinates) => [coord.lat, coord.lng] as [number, number]);

        if (positions.length < 2) return null;

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: isSelected ? colors.main : '#94a3b8',
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 0.9 : 0.5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => onRouteClick?.(route),
            }}
          />
        );
      })}
    </>
  );
}
