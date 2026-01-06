/**
 * Leaflet Setup - Correção para ícones não aparecerem
 * 
 * Problema: Os ícones padrão do Leaflet não carregam corretamente com bundlers como Vite/Webpack
 * Solução: Importar e configurar os ícones manualmente
 * 
 * USO: Importar este ficheiro no main.tsx ou App.tsx ANTES de usar o mapa
 * 
 * import '@/lib/leaflet-setup';
 */

import L from 'leaflet';

// Importar imagens dos marcadores
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Remover a função que tenta buscar os ícones automaticamente
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

// Configurar os ícones manualmente
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Exportar ícones customizados para usar na app
export const createCustomIcon = (color: string, label?: string) => {
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
        ${label ? `<span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${label}</span>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Ícones pré-definidos
export const mapIcons = {
  start: createCustomIcon('#22c55e', 'A'),
  end: createCustomIcon('#ef4444', 'B'),
  charging: createCustomIcon('#3b82f6', '⚡'),
  chargingAvailable: createCustomIcon('#22c55e', '⚡'),
  chargingLimited: createCustomIcon('#eab308', '⚡'),
  chargingOccupied: createCustomIcon('#ef4444', '⚡'),
  user: L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          top: -10px;
          left: -10px;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  }),
};

// Log para confirmar que o setup foi executado
console.log('✅ Leaflet icons configured successfully');

export default L;
