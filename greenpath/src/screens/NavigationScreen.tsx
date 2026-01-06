import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronUp, 
  ChevronDown,
  Navigation2, 
  Battery, 
  Clock, 
  MapPin,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapContainer } from '@/components/map/MapContainer';
import { RouteLayer } from '@/components/map/RouteLayer';
import { UserMarker } from '@/components/map/UserMarker';
import { ChargingMarker } from '@/components/map/ChargingMarker';
import { useAppState } from '@/store/AppStateContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance, formatDuration, getBatteryColor } from '@/lib/utils';

export function NavigationScreen() {
  const navigate = useNavigate();
  const appState = useAppState();
  const geo = useGeolocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { selectedRoute, navigation, battery, chargingStations, setCurrentLocation, endNavigation } = appState;
  const { position, heading, speed } = geo;

  // Timer for elapsed time
  useEffect(() => {
    if (navigation.isNavigating) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [navigation.isNavigating]);

  // Update current location
  useEffect(() => {
    if (position) {
      setCurrentLocation({
        lat: position.lat,
        lng: position.lng
      });
    }
  }, [position, setCurrentLocation]);

  const handleEndNavigation = () => {
    endNavigation();
    navigate('/home');
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress (mock - would be based on actual position vs route)
  const progress = Math.min(100, (elapsedTime / (selectedRoute?.metrics.duration || 1200)) * 100);
  const remainingDistance = selectedRoute 
    ? selectedRoute.metrics.distance * (1 - progress / 100) 
    : 0;
  const remainingTime = selectedRoute
    ? Math.round(selectedRoute.metrics.duration * (1 - progress / 100))
    : 0;

  if (!selectedRoute) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-lg font-semibold">Nenhuma rota selecionada</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Por favor, planeie uma rota primeiro.
          </p>
          <Button onClick={() => navigate('/route')}>
            Planear Rota
          </Button>
        </Card>
      </div>
    );
  }

  const mapCenter = position ? [position.lat, position.lng] as [number, number] : undefined;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Fullscreen Map */}
      <div className="absolute inset-0">
        <MapContainer
          center={mapCenter}
          zoom={16}
          className="h-full w-full"
        >
          <RouteLayer route={selectedRoute} />
          {position && (
            <UserMarker 
              position={position}
              heading={heading ?? undefined}
            />
          )}
          {chargingStations.map(station => (
            <ChargingMarker 
              key={station.id} 
              station={station}
            />
          ))}
        </MapContainer>
      </div>

      {/* Top Controls */}
      <div className="absolute left-0 right-0 top-0 z-10 p-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          {/* Close button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90"
            onClick={handleEndNavigation}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Battery indicator */}
          <Card className="flex items-center gap-2 bg-white/90 px-4 py-2 backdrop-blur-sm dark:bg-gray-800/90">
            <Battery className={`h-5 w-5 ${getBatteryColor(battery.percentage)}`} />
            <span className="font-semibold">{battery.percentage}%</span>
            {battery.isCharging && (
              <Zap className="h-4 w-4 animate-pulse text-yellow-500" />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Next instruction banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute left-4 right-4 top-20 z-10"
      >
        <Card className="bg-green-600 p-4 text-white dark:bg-green-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Navigation2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-80">Em 200m</p>
              <p className="font-semibold">Vire à direita na Rua Principal</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bottom Panel */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        {/* Expand/Collapse handle */}
        <div className="flex justify-center pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-8 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        <Card className="rounded-b-none rounded-t-3xl bg-white/95 backdrop-blur-md dark:bg-gray-900/95">
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-4 pb-safe">
            {/* Main stats */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDuration(remainingTime)}</p>
                  <p className="text-sm text-muted-foreground">Tempo restante</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold">{formatDistance(remainingDistance)}</p>
                <p className="text-sm text-muted-foreground">Distância</p>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 grid grid-cols-3 gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{formatElapsedTime(elapsedTime)}</p>
                      <p className="text-xs text-muted-foreground">Tempo decorrido</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{selectedRoute.metrics.batteryUsage}%</p>
                      <p className="text-xs text-muted-foreground">Bateria estimada</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{Math.round(progress)}%</p>
                      <p className="text-xs text-muted-foreground">Progresso</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Destino</p>
                      <p className="font-medium">{selectedRoute.end.address}</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {selectedRoute.warnings && selectedRoute.warnings.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {selectedRoute.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                            warning.severity === 'danger'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : warning.severity === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span>{warning.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* End navigation button */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleEndNavigation}
            >
              Terminar Navegação
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Speed indicator (floating) */}
      <motion.div
        className="absolute bottom-48 left-4 z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90">
          <span className="text-xl font-bold">
            {speed ? Math.round(speed * 3.6) : 0}
          </span>
          <span className="text-[10px] text-muted-foreground">km/h</span>
        </Card>
      </motion.div>
    </div>
  );
}
