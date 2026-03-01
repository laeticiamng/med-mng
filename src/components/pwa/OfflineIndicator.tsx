import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const OfflineIndicator = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <Badge 
        variant="outline" 
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success/10 text-success border-success/30 gap-1 animate-in fade-in slide-in-from-top-2"
      >
        <Wifi className="h-3 w-3" />
        Reconnecté
      </Badge>
    );
  }

  if (!isOffline) return null;

  return (
    <Badge 
      variant="outline" 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-warning/10 text-warning border-warning/30 gap-1"
    >
      <WifiOff className="h-3 w-3" />
      Hors-ligne
    </Badge>
  );
});
OfflineIndicator.displayName = 'OfflineIndicator';
