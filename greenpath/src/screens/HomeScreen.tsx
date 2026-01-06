import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { BatteryCard } from '@/components/cards/BatteryCard';
import { QuickActionGrid } from '@/components/shared/QuickActionGrid';
import { WeatherAlertBanner } from '@/components/shared/WeatherAlert';
import { useAppState } from '@/store/AppStateContext';
import { useWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';

export function HomeScreen() {
  const { battery, vehicle, stats, setWeather, setCurrentLocation } = useAppState();
  const { weather, alerts, refresh } = useWeather();
  const { position, getCurrentPosition } = useGeolocation();

  // Initialize location on mount
  useEffect(() => {
    getCurrentPosition();
  }, []);

  // Update weather in global state
  useEffect(() => {
    if (weather) {
      setWeather(weather);
    }
  }, [weather, setWeather]);

  // Update location in global state
  useEffect(() => {
    if (position) {
      setCurrentLocation({
        lat: position.lat,
        lng: position.lng,
      });
    }
  }, [position, setCurrentLocation]);

  // Dismiss weather alert
  const handleDismissAlert = (alertIndex: number) => {
    // In a real app, we'd track dismissed alerts
    // For now, alerts will just be rendered
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <TopBar showGreeting />

      {/* Main Content */}
      <motion.main
        className="flex-1 px-4 pb-24 pt-4 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Weather Alert */}
        {alerts && alerts.length > 0 && (
          <motion.div variants={itemVariants} className="mb-4">
            <WeatherAlertBanner
              alert={alerts[0]}
              onDismiss={() => handleDismissAlert(0)}
            />
          </motion.div>
        )}

        {/* Battery Status Card */}
        <motion.div variants={itemVariants} className="mb-6">
          <BatteryCard
            battery={battery}
            weather={weather}
            vehicle={vehicle}
          />
        </motion.div>

        {/* Section Title */}
        <motion.div variants={itemVariants} className="mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Ações Rápidas
          </h2>
          <p className="text-sm text-muted-foreground">
            O que pretende fazer hoje?
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants}>
          <QuickActionGrid />
        </motion.div>

        {/* Recent Activity / Stats Preview */}
        <motion.div variants={itemVariants} className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Resumo
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Total Distance */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Distância Total
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalDistance.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  km
                </span>
              </p>
            </div>

            {/* Total Trips */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Viagens
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTrips}
              </p>
            </div>

            {/* CO2 Saved */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">
                CO₂ Poupado
              </p>
              <p className="text-2xl font-bold text-primary">
                {stats.co2Saved.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kg
                </span>
              </p>
            </div>

            {/* Average Trip */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Média / Viagem
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTrips > 0
                  ? (stats.totalDistance / stats.totalTrips).toFixed(1)
                  : '0.0'}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  km
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tip of the Day */}
        <motion.div 
          variants={itemVariants} 
          className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20"
        >
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
            💡 Dica do Dia
          </p>
          <p className="text-sm text-foreground">
            Manter a pressão correta dos pneus pode aumentar a autonomia da sua trotinete em até 15%.
          </p>
        </motion.div>
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
