import React, { useEffect, useState } from 'react';
import { Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates } from '@/types/route';

interface UserMarkerProps {
  position: Coordinates;
  heading?: number;
  accuracy?: number;
  showAccuracy?: boolean;
  followUser?: boolean;
}

// Create pulsing user marker icon
const createUserIcon = (heading?: number) => {
  const rotation = heading !== undefined ? heading : 0;
  
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div class="user-marker-container" style="
        position: relative;
        width: 48px;
        height: 48px;
      ">
        <!-- Pulse ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        "></div>
        
        <!-- Direction indicator -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${rotation}deg);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 20px solid rgba(34, 197, 94, 0.6);
          margin-top: -14px;
        "></div>
        
        <!-- Main dot -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #22c55e;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Inject CSS animation
const injectPulseAnimation = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'user-marker-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        .user-marker-container {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
      `;
      document.head.appendChild(style);
    }
  }
};

export function UserMarker({
  position,
  heading,
  accuracy,
  showAccuracy = true,
  followUser = false,
}: UserMarkerProps) {
  const map = useMap();
  const [icon, setIcon] = useState(() => createUserIcon(heading));

  // Inject styles on mount
  useEffect(() => {
    injectPulseAnimation();
  }, []);

  // Update icon when heading changes
  useEffect(() => {
    setIcon(createUserIcon(heading));
  }, [heading]);

  // Follow user if enabled
  useEffect(() => {
    if (followUser && position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, followUser, map]);

  if (!position) return null;

  return (
    <>
      {/* Accuracy circle */}
      {showAccuracy && accuracy && accuracy > 10 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            fillColor: '#22c55e',
            fillOpacity: 0.1,
            color: '#22c55e',
            weight: 1,
            opacity: 0.3,
          }}
        />
      )}

      {/* User marker */}
      <Marker
        position={[position.lat, position.lng]}
        icon={icon}
        zIndexOffset={1000}
      />
    </>
  );
}

// Simple static user position (for overview maps)
export function UserPositionDot({ position }: { position: Coordinates }) {
  const dotIcon = L.divIcon({
    className: 'user-dot',
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: #22c55e;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={dotIcon}
      zIndexOffset={500}
    />
  );
}
