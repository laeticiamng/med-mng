import React, { useEffect } from 'react';
import { PlatformStatus } from '@/components/platform/PlatformStatus';
import { useActivityTracking } from '@/hooks/useActivityTracking';

export default function PlatformStatusPage() {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_platform_status' } });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            État de la Plateforme
          </h1>
          <p className="text-muted-foreground">
            Supervision et statut de toutes les fonctionnalités de la plateforme MED-MNG
          </p>
        </div>

        <PlatformStatus />
      </div>
    </div>
  );
}