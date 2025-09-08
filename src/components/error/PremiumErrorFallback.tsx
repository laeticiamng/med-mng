/**
 * ⚠️ PREMIUM ERROR FALLBACK - MED-MNG v4.0
 * Gestion d'erreurs premium avec récupération intelligente
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '@/lib/logger';

interface PremiumErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const PremiumErrorFallback: React.FC<PremiumErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  
  const handleReportError = () => {
    logger.error('error-boundary', 'User reported error', {
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold">Une erreur s'est produite</CardTitle>
          <CardDescription>
            L'application MED-MNG a rencontré un problème inattendu. 
            Nos équipes ont été automatiquement notifiées.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          
          {/* Actions de récupération */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          </div>

          {/* Détails de l'erreur en mode développement */}
          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Détails techniques (dev uniquement)
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-32">
                <strong>Message:</strong> {error.message}
                <br />
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
              </div>
            </details>
          )}

          {/* Signaler l'erreur */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReportError}
            className="w-full flex items-center gap-2 text-muted-foreground"
          >
            <Bug className="w-3 h-3" />
            Signaler cette erreur
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};