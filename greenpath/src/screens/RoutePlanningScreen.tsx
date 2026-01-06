import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Navigation, Loader2, RotateCcw, ArrowUpDown } from 'lucide-react';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { LocationInput } from '@/components/shared/LocationInput';
import { RouteOptionCard } from '@/components/cards/RouteOptionCard';
import { WeatherAlertBanner } from '@/components/shared/WeatherAlert';
import { useAppState } from '@/store/AppStateContext';
import { useRoutes } from '@/hooks/useRoutes';
import { useWeather } from '@/hooks/useWeather';
import { Location, Route } from '@/types/route';
import { ROUTES } from '@/lib/constants';

export function RoutePlanningScreen() {
  const navigate = useNavigate();
  const { battery, currentLocation, weather, setSelectedRoute: setGlobalSelectedRoute } = useAppState();
  const { calculateRoutes, routes, isCalculating, error } = useRoutes();
  const { alerts } = useWeather();

  const [startLocation, setStartLocation] = useState<Location | null>(
    currentLocation ? { coordinates: currentLocation, address: 'Localização atual' } : null
  );
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Update start location when current location changes
  useEffect(() => {
    if (currentLocation && !startLocation) {
      setStartLocation({ coordinates: currentLocation, address: 'Localização atual' });
    }
  }, [currentLocation]);

  // Handle route calculation
  const handleCalculate = async () => {
    if (!startLocation || !endLocation) return;

    await calculateRoutes({
      start: startLocation,
      end: endLocation,
      weather,
      batteryLevel: battery.percentage,
    });
    setHasCalculated(true);
    setSelectedRoute(null);
  };

  // Swap locations
  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);
    setHasCalculated(false);
    setSelectedRoute(null);
  };

  // Handle route selection
  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setGlobalSelectedRoute(route);
  };

  // Start navigation
  const handleStartNavigation = () => {
    if (!selectedRoute) return;
    navigate(ROUTES.NAVIGATION);
  };

  // Reset
  const handleReset = () => {
    setEndLocation(null);
    setHasCalculated(false);
    setSelectedRoute(null);
  };

  const canCalculate = startLocation && endLocation && !isCalculating;
  const canNavigate = selectedRoute !== null;

  // Filter alerts relevant to routing
  const routeAlerts = alerts?.filter(
    (a) => a.type === 'rain' || a.type === 'storm' || a.type === 'wind'
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Planear Rota</h1>
            <p className="text-sm text-muted-foreground">
              Escolha o seu destino
            </p>
          </div>
        </div>

        {/* Location Inputs */}
        <div className="space-y-3 relative">
          <LocationInput
            value={startLocation}
            onChange={setStartLocation}
            label="Origem"
            placeholder="Localização de partida"
            variant="start"
            allowCurrentLocation
          />

          {/* Swap Button */}
          <button
            onClick={handleSwapLocations}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
            style={{ marginTop: '12px' }}
          >
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <LocationInput
            value={endLocation}
            onChange={(loc) => {
              setEndLocation(loc);
              setHasCalculated(false);
            }}
            label="Destino"
            placeholder="Para onde vai?"
            variant="end"
          />
        </div>

        {/* Calculate Button */}
        <div className="flex gap-2 mt-4">
          {hasCalculated && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleCalculate}
            disabled={!canCalculate}
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                A calcular...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                {hasCalculated ? 'Recalcular' : 'Calcular Rotas'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 pt-4 overflow-y-auto">
        {/* Weather Alert */}
        <AnimatePresence>
          {routeAlerts && routeAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <WeatherAlertBanner alert={routeAlerts[0]} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Empty State */}
        {!hasCalculated && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Navigation className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Planear Viagem</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Introduza o seu destino para calcular as melhores rotas
              otimizadas para a sua trotinete elétrica.
            </p>
          </motion.div>
        )}

        {/* Route Options */}
        <AnimatePresence mode="wait">
          {hasCalculated && routes && routes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Rotas Disponíveis</h2>
                <span className="text-sm text-muted-foreground">
                  {routes.length} opções
                </span>
              </div>

              {routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RouteOptionCard
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onSelect={() => handleSelectRoute(route)}
                  />
                </motion.div>
              ))}

              {/* Battery Warning */}
              {selectedRoute && selectedRoute.metrics.batteryUsage > battery.percentage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-4 rounded-xl text-sm"
                >
                  ⚠️ Esta rota pode exceder a autonomia atual da sua bateria.
                  Considere carregar antes de partir ou escolher uma rota mais curta.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Start Navigation Button */}
      <AnimatePresence>
        {canNavigate && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8"
          >
            <Button
              size="xl"
              variant="eco"
              className="w-full shadow-xl"
              onClick={handleStartNavigation}
            >
              <Navigation className="h-5 w-5 mr-2" />
              Iniciar Navegação
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
