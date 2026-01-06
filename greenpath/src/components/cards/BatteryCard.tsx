import React from 'react';
import { Battery, BatteryCharging, Gauge, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDistance, getBatteryColor, getBatteryBgColor } from '@/lib/utils';
import { BatteryStatus, Vehicle } from '@/types/user';
import { Weather } from '@/types/weather';

interface BatteryCardProps {
  battery: BatteryStatus;
  vehicle: Vehicle;
  weather?: Weather | null;
  className?: string;
}

const getWeatherIcon = (condition: Weather['condition']) => {
  const icons: Record<Weather['condition'], string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
  };
  return icons[condition];
};

export function BatteryCard({ battery, vehicle, weather, className }: BatteryCardProps) {
  const BatteryIcon = battery.isCharging ? BatteryCharging : Battery;

  return (
    <Card variant="elevated" className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        {/* Battery Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-xl",
                battery.isCharging ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
              )}
            >
              <BatteryIcon
                className={cn(
                  "h-6 w-6",
                  battery.isCharging ? "text-green-500 animate-pulse" : getBatteryColor(battery.percentage)
                )}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bateria</p>
              <p className={cn("text-2xl font-bold", getBatteryColor(battery.percentage))}>
                {Math.round(battery.percentage)}%
              </p>
            </div>
          </div>

          {/* Weather Info */}
          {weather && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl">
              <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
              <div className="text-right">
                <p className="font-semibold">{weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">{weather.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Battery Bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={cn("battery-fill h-full rounded-full transition-all duration-500", getBatteryBgColor(battery.percentage))}
            style={{ width: `${battery.percentage}%` }}
          />
          {battery.isCharging && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Autonomy */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <Gauge className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Autonomia</p>
              <p className="font-semibold">{formatDistance(battery.estimatedRange)}</p>
            </div>
          </div>

          {/* Charging Time */}
          {battery.isCharging && battery.timeToFull ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Tempo restante</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {battery.timeToFull} min
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Saúde</p>
                <p className="font-semibold">{battery.health}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{vehicle.name}</span>
            <span className="text-muted-foreground">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
