/**
 * Indicateur de statut réseau avec notifications
 * ✅ Enrichi: Notifications toast lors des changements de connexion
 */

import React, { useEffect, useRef } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  notifyOnChange?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showLabel = false,
  notifyOnChange = true
}) => {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();
  const prevOnlineRef = useRef(isOnline);
  const prevSlowRef = useRef(isSlowConnection);

  // ✅ Notifier les changements de connexion
  useEffect(() => {
    if (!notifyOnChange) return;

    // Passage hors ligne
    if (prevOnlineRef.current && !isOnline) {
      toast.error('📴 Connexion perdue', {
        description: 'La génération reprendra automatiquement une fois reconnecté.',
        duration: 5000
      });
    }
    
    // Retour en ligne
    if (!prevOnlineRef.current && isOnline) {
      toast.success('✅ Connexion rétablie', {
        description: 'Vous pouvez continuer à générer des musiques.',
        duration: 3000
      });
    }

    // Connexion devenue lente
    if (prevOnlineRef.current && isOnline && !prevSlowRef.current && isSlowConnection) {
      toast.warning('⚠️ Connexion lente détectée', {
        description: `La génération peut prendre plus de temps (${effectiveType}).`,
        duration: 4000
      });
    }

    prevOnlineRef.current = isOnline;
    prevSlowRef.current = isSlowConnection;
  }, [isOnline, isSlowConnection, effectiveType, notifyOnChange]);

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
