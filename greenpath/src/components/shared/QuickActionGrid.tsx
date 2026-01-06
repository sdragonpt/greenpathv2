import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Battery, History, Settings, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  color?: string;
  badge?: string | number;
}

const quickActions: QuickAction[] = [
  {
    id: 'plan-route',
    icon: Navigation,
    label: 'Planear Rota',
    path: ROUTES.ROUTE_PLANNING,
    color: 'text-primary',
  },
  {
    id: 'charging',
    icon: Battery,
    label: 'Pontos de Carga',
    path: ROUTES.CHARGING_STATIONS,
    color: 'text-green-500',
  },
  {
    id: 'history',
    icon: History,
    label: 'Histórico',
    path: ROUTES.HISTORY,
    color: 'text-blue-500',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Definições',
    path: ROUTES.SETTINGS,
    color: 'text-muted-foreground',
  },
];

interface QuickActionGridProps {
  className?: string;
}

export function QuickActionGrid({ className }: QuickActionGridProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="quick-action group"
          >
            <div
              className={cn(
                "p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors",
                action.color
              )}
            >
              <Icon className={cn("h-6 w-6", action.color)} />
            </div>
            <span className="text-sm font-medium text-foreground">
              {action.label}
            </span>
            {action.badge && (
              <span className="absolute top-2 right-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {action.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
