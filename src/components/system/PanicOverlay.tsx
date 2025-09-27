import React from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PanicState } from '@/hooks/usePanicMonitor';

interface PanicOverlayProps {
  state: PanicState;
  retryCountdown: number;
  onRetry: () => void;
}

export const PanicOverlay: React.FC<PanicOverlayProps> = ({
  state,
  retryCountdown,
  onRetry
}) => {
  if (state === 'normal') return null;

  const getStateConfig = () => {
    switch (state) {
      case 'warning':
        return {
          title: 'Attention',
          description: 'Des erreurs mineures ont été détectées',
          color: 'border-yellow-500 bg-yellow-50',
          textColor: 'text-yellow-800',
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />
        };
      case 'critical':
        return {
          title: 'Erreur Critique',
          description: 'Plusieurs erreurs critiques détectées. Récupération automatique en cours...',
          color: 'border-red-500 bg-red-50',
          textColor: 'text-red-800',
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />
        };
      case 'recovering':
        return {
          title: 'Récupération',
          description: `Récupération en cours... ${retryCountdown}s`,
          color: 'border-blue-500 bg-blue-50',
          textColor: 'text-blue-800',
          icon: <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
        };
      default:
        return {
          title: 'État Inconnu',
          description: 'État du système non reconnu',
          color: 'border-gray-500 bg-gray-50',
          textColor: 'text-gray-800',
          icon: <Shield className="h-6 w-6 text-gray-600" />
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${config.color}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${config.textColor}`}>
            {config.icon}
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={config.textColor}>
            {config.description}
          </p>
          
          {state === 'recovering' && (
            <div className="space-y-2">
              <Progress 
                value={(5 - retryCountdown) * 20} 
                className="h-2"
              />
              <p className="text-sm text-center text-muted-foreground">
                Récupération automatique...
              </p>
            </div>
          )}
          
          {state === 'critical' && (
            <div className="space-y-2">
              <Button 
                onClick={onRetry}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer maintenant
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                La récupération automatique se lancera dans quelques secondes
              </p>
            </div>
          )}
          
          {state === 'warning' && (
            <div className="text-center">
              <Button 
                onClick={onRetry}
                variant="outline"
                size="sm"
              >
                Ignorer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};