import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white",
        warning:
          "border-transparent bg-yellow-500 text-white",
        info:
          "border-transparent bg-blue-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Status badge with pulsing dot
interface StatusBadgeProps extends BadgeProps {
  status: 'available' | 'limited' | 'occupied' | 'online' | 'offline';
  showDot?: boolean;
}

function StatusBadge({ status, showDot = true, className, children, ...props }: StatusBadgeProps) {
  const statusConfig = {
    available: { variant: 'success' as const, label: 'Disponível' },
    limited: { variant: 'warning' as const, label: 'Limitado' },
    occupied: { variant: 'destructive' as const, label: 'Ocupado' },
    online: { variant: 'success' as const, label: 'Online' },
    offline: { variant: 'secondary' as const, label: 'Offline' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)} {...props}>
      {showDot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === 'available' || status === 'online' ? 'bg-white animate-pulse' : 'bg-white/80'
        )} />
      )}
      {children || config.label}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
