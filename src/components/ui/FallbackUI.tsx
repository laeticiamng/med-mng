import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { AlertTriangle, Database, RefreshCw, Zap } from 'lucide-react';
import React, { useEffect } from 'react';

interface FallbackUIProps {
  context: 'library' | 'generation' | 'edn' | 'oic' | 'playlist' | 'quiz';
  children?: React.ReactNode;
}

export function FallbackUI({ context, children }: FallbackUIProps) {
  const { _status, dataCompleteness, isLoading, refresh, needsUpgrade, isOperational, completenessScore } = useSystemStatus();
  const { logActivity } = useActivityTracking();

  // Track system status view when there are issues
  useEffect(() => {
    if (!isOperational || needsUpgrade || completenessScore < 90) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { 
          type: 'view_system_fallback', 
          context, 
          isOperational, 
          needsUpgrade, 
          completenessScore 
        }
      });
    }
  }, [isOperational, needsUpgrade, completenessScore, context, logActivity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Vérification du système...</span>
      </div>
    );
  }

  // Critical system issues
  if (!isOperational || needsUpgrade) {
    return (
      <div className="space-y-4 p-4">
        {needsUpgrade && (
          <Alert variant="destructive">
            <Zap className="h-4 w-4" />
            <AlertTitle>Mise à jour requise</AlertTitle>
            <AlertDescription>
              Une nouvelle version est disponible. Actualisez la page pour bénéficier des dernières améliorations.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => window.location.reload()}
              >
                Actualiser
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isOperational && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Service temporairement dégradé</AlertTitle>
            <AlertDescription>
              Certaines fonctionnalités peuvent être limitées. Nous travaillons à résoudre le problème.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={refresh}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Data completeness warnings
  if (completenessScore < 90) {
    const contextMessages = {
      library: "Votre bibliothèque musicale est en cours de finalisation.",
      generation: "La génération musicale peut être temporairement limitée.",
      edn: "Certains items EDN sont en cours de migration.",
      oic: "Les compétences OIC sont en cours d'intégration.",
      playlist: "Vos playlists sont en cours de synchronisation.",
      quiz: "Certains quiz peuvent être temporairement indisponibles."
    };

    return (
      <div className="space-y-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Données en finalisation
            <Badge variant="secondary">{completenessScore}% complet</Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{contextMessages[context]}</p>
              <Progress value={completenessScore} className="w-full" />
              {dataCompleteness?.gaps && dataCompleteness.gaps.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer hover:text-primary">
                    Voir les détails
                  </summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    {dataCompleteness.gaps.map((gap, index) => (
                      <li key={index} className="text-muted-foreground">• {gap}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // All good, render children
  return <>{children}</>;
}

// Specific fallback components for different contexts
export function LibraryFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="library">{children}</FallbackUI>;
}

export function GenerationFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="generation">{children}</FallbackUI>;
}

export function EdnFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="edn">{children}</FallbackUI>;
}

export function OicFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="oic">{children}</FallbackUI>;
}

export function PlaylistFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="playlist">{children}</FallbackUI>;
}

export function QuizFallback({ children }: { children: React.ReactNode }) {
  return <FallbackUI context="quiz">{children}</FallbackUI>;
}