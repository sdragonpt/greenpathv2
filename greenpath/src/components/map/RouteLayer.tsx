import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Route, RouteType, Coordinates } from '@/types/route';

interface RouteLayerProps {
  route: Route;
  showMarkers?: boolean;
  animated?: boolean;
}

// Route colors by type
const routeColors: Record<RouteType, { main: string; outline: string }> = {
  fastest: { main: '#3b82f6', outline: '#1d4ed8' }, // Blue
  efficient: { main: '#22c55e', outline: '#15803d' }, // Green
  safest: { main: '#f59e0b', outline: '#d97706' }, // Amber
};

// Custom marker icons
const createMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-marker',
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
  });
};

const startIcon = createMarkerIcon('#22c55e', 'A');
const endIcon = createMarkerIcon('#ef4444', 'B');

export function RouteLayer({ route, showMarkers = true, animated = false }: RouteLayerProps) {
  const colors = routeColors[route.type];
  
  // Convert route waypoints to Leaflet format
  const positions: [number, number][] = route.waypoints.map((coord: Coordinates) => [
    coord.lat,
    coord.lng,
  ]);

  if (positions.length < 2) return null;

  return (
    <>
      {/* Route outline (wider, darker) */}
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

      {/* Main route line */}
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

      {/* Start and End markers */}
      {showMarkers && (
        <>
          <Marker position={positions[0]} icon={startIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Origem</strong>
                <p className="text-muted-foreground">
                  {route.start.name || route.start.address}
                </p>
              </div>
            </Popup>
          </Marker>

          <Marker position={positions[positions.length - 1]} icon={endIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Destino</strong>
                <p className="text-muted-foreground">
                  {route.end.name || route.end.address}
                </p>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </>
  );
}

// Multiple routes overlay (for comparison)
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
        const positions: [number, number][] = route.waypoints.map((coord: Coordinates) => [
          coord.lat,
          coord.lng,
        ]);

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
