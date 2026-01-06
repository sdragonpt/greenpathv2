import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ChevronLeft, Bell } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth, useTheme } from '@/store';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showGreeting?: boolean;
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export function TopBar({
  title,
  showBack = false,
  showGreeting = false,
  showThemeToggle = true,
  showNotifications = false,
  className,
}: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 19) return 'Boa tarde';
    return 'Boa noite';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-lg sticky top-0 z-40 border-b border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {showGreeting && user ? (
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              <p className="font-semibold text-foreground">{user.name}</p>
            </div>
          </div>
        ) : title ? (
          <h1 className="text-lg font-semibold">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {showGreeting && (
          <p className="text-xs text-muted-foreground hidden sm:block">
            {formatDate(new Date())}
          </p>
        )}

        {showNotifications && (
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
        )}

        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
