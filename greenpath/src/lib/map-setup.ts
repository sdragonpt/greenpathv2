/**
 * IMPORTANTE: Este ficheiro DEVE ser importado no main.tsx ou App.tsx
 * ANTES de qualquer componente que use o mapa!
 * 
 * Adicionar no topo do main.tsx:
 * import '@/lib/map-setup';
 */

import L from 'leaflet';

// Fix para os ícones do Leaflet não carregarem com Vite/Webpack
// Este é um problema conhecido quando se usa bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore - Remover a função interna que tenta carregar ícones automaticamente
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

// Log de confirmação
if (typeof window !== 'undefined') {
  console.log('✅ Leaflet map setup complete');
}

export default L;
