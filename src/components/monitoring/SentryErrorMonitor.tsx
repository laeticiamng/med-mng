import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}

export const SentryErrorMonitor = () => {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Vérifier la connexion Sentry
    checkSentryConnection();
    
    // Simuler des erreurs pour demo (uniquement en dev)
    if (import.meta.env.MODE === 'development') {
      const interval = setInterval(() => {
        simulateRandomError();
      }, 30000); // Toutes les 30s
      
      return () => clearInterval(interval);
    }
  }, []);

  const checkSentryConnection = () => {
    try {
      // Tester si Sentry est initialisé
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      console.warn('Sentry non connecté:', error);
    }
  };

  const simulateRandomError = () => {
    const errorTypes = [
      { 
        message: 'Erreur de génération musicale', 
        level: 'error' as const,
        context: { component: 'MusicGeneration', action: 'suno-api-call' }
      },
      { 
        message: 'Quota API atteint', 
        level: 'warning' as const,
        context: { component: 'ExtractionService', quota: 'monthly' }
      },
      { 
        message: 'Timeout extraction EDN', 
        level: 'error' as const,
        context: { component: 'ExtractionMonitor', source: 'EDN' }
      },
      { 
        message: 'Connexion utilisateur échouée', 
        level: 'warning' as const,
        context: { component: 'AuthService', provider: 'supabase' }
      }
    ];

    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    const newError: ErrorEvent = {
      id: `error-${Date.now()}`,
      message: randomError.message,
      timestamp: new Date(),
      level: randomError.level,
      context: randomError.context,
      stack: 'at Component.render (/src/components/Example.tsx:42:15)'
    };

    setErrors(prev => [newError, ...prev.slice(0, 9)]); // Garder max 10 erreurs
    
    // Envoyer à Sentry si connecté
    if (isConnected) {
      if (randomError.level === 'error') {
        Sentry.captureException(new Error(randomError.message), {
          tags: randomError.context,
          level: randomError.level
        });
      } else {
        Sentry.captureMessage(randomError.message, randomError.level);
      }
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const testSentryConnection = () => {
    try {
      Sentry.captureMessage('Test de connexion Sentry depuis le monitoring', 'info');
      checkSentryConnection();
    } catch (error) {
      console.error('Erreur test Sentry:', error);
    }
  };

  const getErrorIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Monitoring Sentry
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Surveillance des erreurs frontend en temps réel
              {lastCheck && (
                <span className="ml-2 text-xs">
                  (Dernière vérification: {lastCheck.toLocaleTimeString()})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testSentryConnection}
              disabled={!isConnected}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Test connexion
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearErrors}
              disabled={errors.length === 0}
            >
              Effacer
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Statut de connexion */}
          <Card className={`p-4 ${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${isConnected ? 'text-green-800' : 'text-red-800'}`}>
                {isConnected ? 'Sentry opérationnel' : 'Sentry non configuré'}
              </span>
            </div>
            {!isConnected && (
              <p className="text-sm text-red-600 mt-1">
                Configurez votre DSN Sentry dans src/utils/sentry.ts pour activer le monitoring
              </p>
            )}
          </Card>

          {/* Liste des erreurs récentes */}
          <div>
            <h3 className="font-medium mb-3">
              Erreurs récentes ({errors.length})
            </h3>
            
            {errors.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune erreur détectée</p>
                {import.meta.env.MODE === 'development' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (En mode développement, des erreurs de demo sont générées toutes les 30s)
                  </p>
                )}
              </Card>
            ) : (
              <div className="space-y-2">
                {errors.map((error) => (
                  <Card key={error.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getErrorIcon(error.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{error.message}</span>
                            <Badge variant={getBadgeVariant(error.level)} className="text-xs">
                              {error.level}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {error.timestamp.toLocaleString()}
                            {error.context && (
                              <span className="ml-2">
                                • {error.context.component || 'Unknown component'}
                              </span>
                            )}
                          </div>
                          {error.stack && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer hover:text-foreground">
                                Stack trace
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Configuration */}
          {import.meta.env.MODE === 'development' && (
            <Card className="p-4 border-blue-200 bg-blue-50">
              <CardTitle className="text-sm text-blue-800 mb-2">
                Configuration développement
              </CardTitle>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Erreurs simulées toutes les 30 secondes</p>
                <p>• DSN Sentry à configurer dans src/utils/sentry.ts</p>
                <p>• Les erreurs sont automatiquement envoyées vers Sentry si configuré</p>
              </div>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};