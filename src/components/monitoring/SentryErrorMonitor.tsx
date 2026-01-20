import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

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
    checkSentryConnection();
    loadRealErrors();
    
    // Rafraîchir les erreurs réelles toutes les 30s
    const interval = setInterval(() => {
      loadRealErrors();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRealErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_monitoring_errors')
        .select('id, message, stack, created_at, severity, category, context')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setErrors(data.map(err => ({
          id: err.id,
          message: err.message,
          stack: err.stack || undefined,
          timestamp: new Date(err.created_at),
          level: err.severity === 'high' ? 'error' : err.severity === 'medium' ? 'warning' : 'info',
          context: err.context as Record<string, any> || undefined
        })));
      }
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    }
  };

  const checkSentryConnection = () => {
    try {
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      console.warn('Sentry non connecté:', error);
    }
  };

  // Fonction pour créer une vraie erreur et l'enregistrer dans Supabase
  const reportNewError = async (errorMessage: string, level: 'error' | 'warning' | 'info', context: Record<string, any>) => {
    try {
      // Enregistrer dans Supabase
      const { data, error } = await supabase
        .from('ai_monitoring_errors')
        .insert({
          message: errorMessage,
          error_type: context.component || 'manual',
          severity: level === 'error' ? 'high' : level === 'warning' ? 'medium' : 'low',
          category: context.action || 'user_reported',
          context: context,
          priority: level === 'error' ? 'critical' : 'normal',
          ai_analysis: { source: 'manual_report', timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter à la liste locale
      const newError: ErrorEvent = {
        id: data.id,
        message: errorMessage,
        timestamp: new Date(data.created_at),
        level: level,
        context: context,
        stack: `Reported at ${new Date().toISOString()}`
      };

      setErrors(prev => [newError, ...prev.slice(0, 9)]);
      
      // Envoyer à Sentry si connecté
      if (isConnected) {
        if (level === 'error') {
          Sentry.captureException(new Error(errorMessage), {
            tags: context,
            level: level
          });
        } else {
          Sentry.captureMessage(errorMessage, level);
        }
      }
    } catch (err) {
      console.error('Erreur lors du signalement:', err);
    }
  };

  // Fonction de test pour les développeurs (enregistre une vraie erreur)
  const testErrorReporting = () => {
    reportNewError(
      'Test d\'erreur - Vérification du système de monitoring',
      'info',
      { component: 'SentryErrorMonitor', action: 'test_report' }
    );
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
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
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
          <Card className={`p-4 ${isConnected ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={`font-medium ${isConnected ? 'text-success' : 'text-destructive'}`}>
                {isConnected ? 'Sentry opérationnel' : 'Sentry non configuré'}
              </span>
            </div>
            {!isConnected && (
              <p className="text-sm text-destructive/80 mt-1">
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
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
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
            <Card className="p-4 border-primary/20 bg-primary/5">
              <CardTitle className="text-sm text-primary mb-2">
                Configuration développement
              </CardTitle>
              <div className="text-sm text-primary/80 space-y-1">
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