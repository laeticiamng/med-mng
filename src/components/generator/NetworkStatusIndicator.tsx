import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showLabel = false
}) => {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    // Ne pas afficher si tout va bien
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        label: 'Hors ligne',
        variant: 'destructive' as const,
        className: 'bg-destructive/10 text-destructive border-destructive/20'
      };
    }
    if (isSlowConnection) {
      return {
        icon: AlertTriangle,
        label: `Connexion lente (${effectiveType})`,
        variant: 'outline' as const,
        className: 'bg-warning/10 text-warning border-warning/20'
      };
    }
    return {
      icon: Wifi,
      label: 'En ligne',
      variant: 'outline' as const,
      className: 'bg-success/10 text-success border-success/20'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, 'gap-1.5', className)}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  );
};
