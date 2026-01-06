import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function formatBatteryPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getBatteryColor(percentage: number): string {
  if (percentage > 60) return 'text-green-500';
  if (percentage > 30) return 'text-yellow-500';
  return 'text-red-500';
}

export function getBatteryBgColor(percentage: number): string {
  if (percentage > 60) return 'bg-green-500';
  if (percentage > 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getStatusColor(status: 'available' | 'limited' | 'occupied'): string {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'limited': return 'bg-yellow-500';
    case 'occupied': return 'bg-red-500';
  }
}

export function calculateEstimatedAutonomy(batteryPercentage: number, maxRange: number): number {
  return (batteryPercentage / 100) * maxRange;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
