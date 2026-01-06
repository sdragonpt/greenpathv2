import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Route, Zap, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { path: ROUTES.HOME, icon: Home, label: 'Início' },
  { path: ROUTES.ROUTE_PLANNING, icon: Route, label: 'Rota' },
  { path: ROUTES.CHARGING_STATIONS, icon: Zap, label: 'Carregar' },
  { path: ROUTES.PROFILE, icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on certain screens
  const hiddenRoutes = [ROUTES.SPLASH, ROUTES.WELCOME, ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.NAVIGATION];
  if (hiddenRoutes.some(route => location.pathname === route)) {
    return null;
  }

  return (
    <nav className="bottom-nav bg-background/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 touch-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 relative z-10 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-xs mt-1 relative z-10 font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
