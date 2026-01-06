import React from 'react';
import { Route as RouteIcon, Clock, Battery, TrendingUp, AlertTriangle, Leaf, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDistance, formatDuration, getBatteryColor } from '@/lib/utils';
import { Route, RouteType } from '@/types/route';

interface RouteOptionCardProps {
  route: Route;
  isSelected?: boolean;
  onSelect?: (route: Route) => void;
  className?: string;
}

const routeTypeConfig: Record<RouteType, { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  description: string;
}> = {
  fastest: {
    icon: Zap,
    label: 'Mais Rápida',
    color: 'text-blue-500',
    description: 'Chega mais rápido, mas consome mais bateria',
  },
  efficient: {
    icon: Leaf,
    label: 'Mais Eficiente',
    color: 'text-green-500',
    description: 'Otimizada para poupar bateria e energia',
  },
  safest: {
    icon: Shield,
    label: 'Mais Segura',
    color: 'text-purple-500',
    description: 'Evita declives acentuados e zonas perigosas',
  },
};

export function RouteOptionCard({
  route,
  isSelected = false,
  onSelect,
  className,
}: RouteOptionCardProps) {
  const config = routeTypeConfig[route.type];
  const TypeIcon = config.icon;

  const hasWarnings = route.warnings && route.warnings.length > 0;
  const severityColors = {
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <Card
      variant="default"
      interactive
      className={cn(
        "route-option",
        isSelected && "border-primary bg-primary/5",
        route.isRecommended && "ring-2 ring-green-500/50",
        className
      )}
      onClick={() => onSelect?.(route)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-muted", isSelected && "bg-primary/10")}>
              <TypeIcon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <p className="font-semibold">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {route.isRecommended && (
            <Badge variant="success" className="text-xs">
              Recomendada
            </Badge>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Distance */}
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <RouteIcon className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-sm font-semibold">{formatDistance(route.metrics.distance)}</p>
            <p className="text-xs text-muted-foreground">Distância</p>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-sm font-semibold">{formatDuration(route.metrics.duration)}</p>
            <p className="text-xs text-muted-foreground">Tempo</p>
          </div>

          {/* Battery */}
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Battery className={cn("h-4 w-4 mb-1", getBatteryColor(100 - route.metrics.batteryUsage))} />
            <p className={cn("text-sm font-semibold", getBatteryColor(100 - route.metrics.batteryUsage))}>
              -{Math.round(route.metrics.batteryUsage)}%
            </p>
            <p className="text-xs text-muted-foreground">Bateria</p>
          </div>
        </div>

        {/* Elevation Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-red-400" />
            <span>+{route.metrics.elevationGain}m</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-400 rotate-180" />
            <span>-{route.metrics.elevationLoss}m</span>
          </div>
        </div>

        {/* Warnings */}
        {hasWarnings && (
          <div className="space-y-2">
            {route.warnings?.map((warning, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-xs",
                  severityColors[warning.severity]
                )}
              >
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">✓ Rota Selecionada</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
