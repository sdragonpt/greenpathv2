import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronUp,
  ChevronDown,
  Navigation2,
  Battery,
  Clock,
  MapPin,
  AlertTriangle,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { RouteLayer } from "@/components/map/RouteLayer";
import { UserMarker } from "@/components/map/UserMarker";
import { ChargingMarker } from "@/components/map/ChargingMarker";
import { useAppState } from "@/store/AppStateContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  formatDistance,
  formatDuration,
  getBatteryColor,
  cn,
} from "@/lib/utils";
import { MAP_CONFIG } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

// Componente para ajustar o mapa à rota
function FitBounds({ route }: { route: any }) {
  const map = useMap();

  useEffect(() => {
    if (route?.waypoints && route.waypoints.length > 0) {
      const bounds = route.waypoints.map(
        (wp: any) => [wp.lat, wp.lng] as [number, number]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route]);

  return null;
}

// Componente para seguir a posição do utilizador
function FollowUser({
  position,
  enabled,
}: {
  position: { lat: number; lng: number } | null;
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (enabled && position) {
      map.setView([position.lat, position.lng], 16, { animate: true });
    }
  }, [map, position, enabled]);

  return null;
}

export function NavigationScreen() {
  const navigate = useNavigate();
  const appState = useAppState();
  const geo = useGeolocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [followUser, setFollowUser] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const {
    selectedRoute,
    navigation,
    battery,
    chargingStations,
    setCurrentLocation,
    endNavigation,
    startNavigation,
  } = appState;
  const { position, heading, speed, isLoading: geoLoading } = geo;

  // Iniciar navegação se houver rota selecionada
  useEffect(() => {
    if (selectedRoute && !navigation.isNavigating) {
      startNavigation(selectedRoute);
    }
  }, [selectedRoute, navigation.isNavigating, startNavigation]);

  // Timer para tempo decorrido
  useEffect(() => {
    if (navigation.isNavigating) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [navigation.isNavigating]);

  // Atualizar localização atual
  useEffect(() => {
    if (position) {
      setCurrentLocation({
        lat: position.lat,
        lng: position.lng,
      });
    }
  }, [position, setCurrentLocation]);

  const handleEndNavigation = () => {
    endNavigation();
    navigate("/home");
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calcular progresso
  const progress = useMemo(() => {
    if (!selectedRoute) return 0;
    return Math.min(
      100,
      (elapsedTime / (selectedRoute.metrics.duration * 60)) * 100
    );
  }, [elapsedTime, selectedRoute]);

  const remainingDistance = useMemo(() => {
    if (!selectedRoute) return 0;
    return selectedRoute.metrics.distance * (1 - progress / 100);
  }, [selectedRoute, progress]);

  const remainingTime = useMemo(() => {
    if (!selectedRoute) return 0;
    return Math.round(selectedRoute.metrics.duration * (1 - progress / 100));
  }, [selectedRoute, progress]);

  // Centro do mapa - usar posição atual ou centro da rota
  const mapCenter = useMemo(() => {
    if (position) {
      return [position.lat, position.lng] as [number, number];
    }
    if (selectedRoute?.waypoints?.length > 0) {
      const midIndex = Math.floor(selectedRoute.waypoints.length / 2);
      return [
        selectedRoute.waypoints[midIndex].lat,
        selectedRoute.waypoints[midIndex].lng,
      ] as [number, number];
    }
    return MAP_CONFIG.defaultCenter;
  }, [position, selectedRoute]);

  // Se não há rota selecionada, mostrar aviso
  if (!selectedRoute) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-sm w-full">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-lg font-semibold">
            Nenhuma rota selecionada
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Por favor, planeie uma rota primeiro antes de iniciar a navegação.
          </p>
          <Button onClick={() => navigate("/route")} className="w-full">
            <Navigation2 className="h-4 w-4 mr-2" />
            Planear Rota
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Mapa Fullscreen */}
      <div className="absolute inset-0">
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                A carregar mapa...
              </p>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            url={MAP_CONFIG.tileUrl}
            attribution={MAP_CONFIG.attribution}
          />

          {/* Ajustar bounds à rota inicialmente */}
          {selectedRoute && <FitBounds route={selectedRoute} />}

          {/* Seguir utilizador */}
          <FollowUser position={position} enabled={followUser} />

          {/* Desenhar a rota */}
          {selectedRoute && <RouteLayer route={selectedRoute} />}

          {/* Marcador do utilizador */}
          {position && (
            <UserMarker
              position={position}
              heading={heading ?? undefined}
              accuracy={10}
            />
          )}

          {/* Postos de carregamento próximos */}
          {chargingStations.slice(0, 5).map((station) => (
            <ChargingMarker
              key={station.id}
              station={station}
              onClick={() => {}}
            />
          ))}
        </MapContainer>
      </div>

      {/* Header - Botão Fechar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-white/90 dark:bg-black/80 backdrop-blur"
          onClick={handleEndNavigation}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Botão para centrar no utilizador */}
        <Button
          variant={followUser ? "default" : "secondary"}
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={() => setFollowUser(!followUser)}
        >
          <Navigation2 className={cn("h-5 w-5", followUser && "text-white")} />
        </Button>
      </div>

      {/* Próxima instrução */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-20 left-4 right-4 z-10"
      >
        <Card className="p-4 bg-primary text-primary-foreground shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Navigation2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-80">
                Em {Math.round(remainingDistance * 100) / 100} km
              </p>
              <p className="font-semibold">
                {selectedRoute.end.name || selectedRoute.end.address}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Painel inferior com informações */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <Card className="rounded-t-3xl border-t shadow-2xl">
          {/* Handle para expandir */}
          <button
            className="w-full py-2 flex justify-center"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </button>

          <div className="px-4 pb-6">
            {/* Barra de progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stats principais */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold">{remainingTime} min</p>
                <p className="text-xs text-muted-foreground">Restante</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold">
                  {remainingDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-muted-foreground">Distância</p>
              </div>

              <div className="text-center">
                <div
                  className="flex items-center justify-center gap-1 mb-1"
                  style={{ color: getBatteryColor(battery.percentage) }}
                >
                  <Battery className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold">{battery.percentage}%</p>
                <p className="text-xs text-muted-foreground">Bateria</p>
              </div>
            </div>

            {/* Informação expandida */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Tempo decorrido
                      </span>
                      <span className="font-medium">
                        {formatElapsedTime(elapsedTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Velocidade</span>
                      <span className="font-medium">
                        {speed ? `${Math.round(speed * 3.6)} km/h` : "-- km/h"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Consumo estimado
                      </span>
                      <span className="font-medium">
                        {selectedRoute.metrics.batteryUsage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Tipo de rota
                      </span>
                      <span className="font-medium capitalize">
                        {selectedRoute.type === "fastest"
                          ? "Mais rápida"
                          : selectedRoute.type === "efficient"
                          ? "Mais eficiente"
                          : "Mais segura"}
                      </span>
                    </div>

                    {/* Botão para ver postos próximos */}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => navigate("/charging")}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Ver postos de carregamento
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão expandir/colapsar */}
            <button
              className="w-full flex items-center justify-center gap-1 pt-2 text-sm text-muted-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Menos detalhes
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Mais detalhes
                </>
              )}
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Avisos de bateria baixa */}
      <AnimatePresence>
        {battery.percentage < 20 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-36 left-4 right-4 z-10"
          >
            <Card className="p-3 bg-red-500/90 text-white">
              <div className="flex items-center gap-2">
                <Battery className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Bateria baixa! Considere parar num posto de carregamento.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
