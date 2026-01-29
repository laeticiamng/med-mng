/**
 * 📴 Offline Notice Component
 * Shows a banner when user is offline
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import React from 'react';

interface OfflineNoticeProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  className = '',
  showWhenOnline = false,
}) => {
  const { isOnline } = useNetworkStatus();

  // Don't show anything if online
  if (isOnline && !showWhenOnline) {
    return null;
  }

  if (!isOnline) {
    return (
      <Alert variant="destructive" className={`animate-fade-in ${className}`}>
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Mode hors ligne</AlertTitle>
        <AlertDescription>
          Vous êtes actuellement déconnecté. Certaines fonctionnalités peuvent être limitées.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default OfflineNotice;
