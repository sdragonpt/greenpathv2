import { useMemo } from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates } from '@/types/route';

interface UserMarkerProps {
  position: Coordinates;
  heading?: number;
  accuracy?: number;
  showAccuracy?: boolean;
}

// Criar ícone do utilizador com indicador de direção
const createUserIcon = (heading?: number) => {
  const rotation = heading ?? 0;
  
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
      ">
        <!-- Círculo de pulse animado -->
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          top: -12px;
          left: -12px;
          animation: user-pulse 2s ease-out infinite;
        "></div>
        
        <!-- Indicador de direção (seta) -->
        ${heading !== undefined ? `
          <div style="
            position: absolute;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 16px solid #3b82f6;
            top: -14px;
            left: 4px;
            transform: rotate(${rotation}deg);
            transform-origin: center bottom;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
          "></div>
        ` : ''}
        
        <!-- Círculo principal -->
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
          top: 2px;
          left: 2px;
        "></div>
      </div>
      
      <style>
        @keyframes user-pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function UserMarker({ 
  position, 
  heading, 
  accuracy = 10, 
  showAccuracy = true 
}: UserMarkerProps) {
  const icon = useMemo(() => createUserIcon(heading), [heading]);
  
  if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    return null;
  }

  return (
    <>
      {/* Círculo de precisão */}
      {showAccuracy && accuracy > 0 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1,
            opacity: 0.3,
          }}
        />
      )}
      
      {/* Marcador do utilizador */}
      <Marker
        position={[position.lat, position.lng]}
        icon={icon}
        zIndexOffset={1000}
      />
    </>
  );
}
