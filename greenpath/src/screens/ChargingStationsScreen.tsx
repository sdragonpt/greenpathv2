import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  List, 
  Filter,
  Navigation2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { MapContainer } from '@/components/map/MapContainer';
import { ChargingMarker } from '@/components/map/ChargingMarker';
import { UserMarker } from '@/components/map/UserMarker';
import { ChargingStationCard } from '@/components/cards/ChargingStationCard';
import { useChargingStations } from '@/hooks/useChargingStations';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ChargingStation, ChargingStatus } from '@/types/charging';

type ViewMode = 'map' | 'list';
type FilterStatus = 'all' | ChargingStatus;

export function ChargingStationsScreen() {
  const navigate = useNavigate();
  const { position } = useGeolocation();
  const { stations, isLoading, getNearestStation } = useChargingStations(position);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      if (filterStatus === 'all') return true;
      return station.status === filterStatus;
    });
  }, [stations, filterStatus]);

  const nearestStation = useMemo(() => {
    if (!position) return null;
    return getNearestStation(position);
  }, [position, getNearestStation]);

  const handleNavigateToStation = (station: ChargingStation) => {
    navigate('/route', { state: { destination: station.coordinates } });
  };

  const statusFilters: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: stations.length },
    { value: 'available', label: 'Disponíveis', count: stations.filter(s => s.status === 'available').length },
    { value: 'limited', label: 'Limitados', count: stations.filter(s => s.status === 'limited').length },
    { value: 'occupied', label: 'Ocupados', count: stations.filter(s => s.status === 'occupied').length },
  ];

  const mapCenter = position ? [position.lat, position.lng] as [number, number] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <TopBar showBack title="Pontos de Carregamento" />

      {/* View Toggle & Filter */}
      <div className="sticky top-14 z-20 border-b border-gray-200 bg-background/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800">
        <div className="flex items-center justify-between">
          {/* View mode toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-foreground shadow-sm dark:bg-gray-700'
                  : 'text-muted-foreground'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-foreground shadow-sm dark:bg-gray-700'
                  : 'text-muted-foreground'
              }`}
            >
              <Map className="h-4 w-4" />
              Mapa
            </button>
          </div>

          {/* Filter button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilter(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrar
            {filterStatus !== 'all' && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                1
              </Badge>
            )}
          </Button>
        </div>

        {/* Active filter indicator */}
        {filterStatus !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2"
          >
            <Badge variant="secondary" className="gap-1">
              {statusFilters.find(f => f.value === filterStatus)?.label}
              <button
                onClick={() => setFilterStatus('all')}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {/* Summary */}
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>{filteredStations.length} postos encontrados</span>
                {nearestStation && (
                  <span className="text-green-600 dark:text-green-400">
                    • Mais próximo a {nearestStation.distance?.toFixed(1)} km
                  </span>
                )}
              </div>

              {/* Station list */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : filteredStations.length === 0 ? (
                <Card className="p-8 text-center">
                  <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Nenhum posto encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Não existem postos com o filtro selecionado.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilterStatus('all')}
                  >
                    Limpar filtros
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredStations.map((station, index) => (
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ChargingStationCard
                        station={station}
                        onNavigate={() => handleNavigateToStation(station)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-180px)]"
            >
              <MapContainer
                center={mapCenter}
                zoom={14}
                className="h-full w-full"
              >
                {position && <UserMarker position={position} />}
                {filteredStations.map(station => (
                  <ChargingMarker
                    key={station.id}
                    station={station}
                    onClick={() => setSelectedStation(station)}
                  />
                ))}
              </MapContainer>

              {/* Floating station count */}
              <div className="absolute bottom-24 left-4 z-10">
                <Card className="flex items-center gap-2 bg-white/95 px-4 py-2 backdrop-blur-sm dark:bg-gray-900/95">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {filteredStations.length} postos
                  </span>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilter} onOpenChange={setShowFilter}>
        <div className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Filtrar por estado</h3>
          <div className="space-y-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => {
                  setFilterStatus(filter.value);
                  setShowFilter(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{filter.label}</span>
                <Badge variant="secondary">{filter.count}</Badge>
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Selected Station Sheet */}
      <Sheet 
        open={!!selectedStation} 
        onOpenChange={(open: boolean) => !open && setSelectedStation(null)}
      >
        {selectedStation && (
          <div className="p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedStation.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
              </div>
              <Badge
                variant={
                  selectedStation.status === 'available'
                    ? 'success'
                    : selectedStation.status === 'limited'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {selectedStation.status === 'available'
                  ? 'Disponível'
                  : selectedStation.status === 'limited'
                  ? 'Limitado'
                  : 'Ocupado'}
              </Badge>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Lugares</p>
                <p className="text-lg font-semibold">
                  {selectedStation.availableSlots}/{selectedStation.totalSlots}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Preço</p>
                <p className="text-lg font-semibold">
                  {selectedStation.pricePerKwh?.toFixed(2) || '0.00'} €/kWh
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Distância</p>
                <p className="text-lg font-semibold">
                  {selectedStation.distance?.toFixed(1) || '?'} km
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Avaliação</p>
                <p className="text-lg font-semibold">
                  ⭐ {selectedStation.rating?.toFixed(1) || 'N/A'}
                </p>
              </Card>
            </div>

            {selectedStation.amenities && selectedStation.amenities.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Comodidades</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStation.amenities.map((amenity, i) => (
                    <Badge key={i} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full gap-2"
              onClick={() => {
                handleNavigateToStation(selectedStation);
                setSelectedStation(null);
              }}
            >
              <Navigation2 className="h-4 w-4" />
              Navegar até aqui
            </Button>
          </div>
        )}
      </Sheet>

      <BottomNav />
    </div>
  );
}
