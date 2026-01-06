import React from 'react';
import { Cloud, CloudRain, Wind, Thermometer, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherAlert as WeatherAlertType } from '@/types/weather';

interface WeatherAlertProps {
  alert: WeatherAlertType;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<
  WeatherAlertType['type'],
  {
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
  }
> = {
  rain: {
    icon: CloudRain,
    gradient: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-500',
  },
  storm: {
    icon: CloudRain,
    gradient: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-500',
  },
  wind: {
    icon: Wind,
    gradient: 'from-cyan-500/20 to-cyan-600/20',
    iconColor: 'text-cyan-500',
  },
  heat: {
    icon: Thermometer,
    gradient: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-500',
  },
  cold: {
    icon: Thermometer,
    gradient: 'from-sky-500/20 to-sky-600/20',
    iconColor: 'text-sky-500',
  },
};

const severityStyles = {
  info: 'border-blue-500/30',
  warning: 'border-yellow-500/30',
  danger: 'border-red-500/30',
};

export function WeatherAlertBanner({
  alert,
  onDismiss,
  className,
}: WeatherAlertProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4",
        `bg-gradient-to-r ${config.gradient}`,
        severityStyles[alert.severity],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50", config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {alert.severity !== 'info' && (
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  alert.severity === 'warning' ? 'text-yellow-500' : 'text-red-500'
                )}
              />
            )}
            <span className="font-semibold text-sm">
              {alert.severity === 'danger' ? 'Alerta Severo' : 
               alert.severity === 'warning' ? 'Aviso' : 'Informação'}
            </span>
          </div>
          <p className="text-sm">{alert.message}</p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Compact version for inline use
interface WeatherAlertInlineProps {
  message: string;
  severity: 'info' | 'warning' | 'danger';
  className?: string;
}

export function WeatherAlertInline({
  message,
  severity,
  className,
}: WeatherAlertInlineProps) {
  const severityColors = {
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        severityColors[severity],
        className
      )}
    >
      {severity === 'info' ? (
        <Cloud className="h-4 w-4 flex-shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
