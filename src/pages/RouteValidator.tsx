import React from 'react';
import { RouteHealthCheck } from '@/components/platform/RouteHealthCheck';

export default function RouteValidator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Validateur de Routes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Vérification complète de toutes les routes et pages de la plateforme MED-MNG
          </p>
        </div>

        {/* Route Health Check Component */}
        <RouteHealthCheck />
      </div>
    </div>
  );
}