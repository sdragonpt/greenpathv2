import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import { MAP_CONFIG } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  onMapReady?: (map: L.Map) => void;
}

// Component to handle map events
function MapController({ 
  center, 
  zoom, 
  onMapReady 
}: { 
  center?: [number, number]; 
  zoom?: number;
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

export function MapContainer({
  center = MAP_CONFIG.defaultCenter as [number, number],
  zoom = MAP_CONFIG.defaultZoom,
  className,
  children,
  onMapReady,
}: MapContainerProps) {
  return (
    <div className={cn('w-full h-full relative', className)}>
      <LeafletMap
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Map Tiles - Using CartoDB for cleaner look */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        {/* Dark mode alternative (can be toggled) */}
        {/* <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        /> */}

        <MapController center={center} zoom={zoom} onMapReady={onMapReady} />
        
        {children}
      </LeafletMap>

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 text-[10px] text-muted-foreground/50 z-10">
        © CartoDB © OpenStreetMap
      </div>
    </div>
  );
}

// Custom hooks for map operations
export function useMapControls(map: L.Map | null) {
  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();
  const setView = (center: [number, number], zoom?: number) => {
    map?.setView(center, zoom);
  };
  const fitBounds = (bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions) => {
    map?.fitBounds(bounds, options);
  };

  return { zoomIn, zoomOut, setView, fitBounds };
}
