import logger from '@/lib/logger';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock, Ban } from 'lucide-react';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  currentCount: number;
  resetTime: Date;
  blocked: boolean;
}

interface RequestAttempt {
  endpoint: string;
  timestamp: Date;
  blocked: boolean;
}

export const ClientRateLimiter = () => {
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([
    {
      endpoint: '/generate-music',
      maxRequests: 5,
      windowMs: 60000, // 1 minute
      currentCount: 0,
      resetTime: new Date(Date.now() + 60000),
      blocked: false
    },
    {
      endpoint: '/extract-data',
      maxRequests: 10,
      windowMs: 300000, // 5 minutes
      currentCount: 0,
      resetTime: new Date(Date.now() + 300000),
      blocked: false
    },
    {
      endpoint: '/auth/login',
      maxRequests: 3,
      windowMs: 900000, // 15 minutes
      currentCount: 0,
      resetTime: new Date(Date.now() + 900000),
      blocked: false
    }
  ]);

  const [recentAttempts, setRecentAttempts] = useState<RequestAttempt[]>([]);
  const requestCounts = useRef<Map<string, number[]>>(new Map());

  useEffect(() => {
    // Nettoyer les compteurs expirés toutes les 10 secondes
    const interval = setInterval(() => {
      cleanupExpiredRequests();
      updateRateLimitStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const cleanupExpiredRequests = () => {
    const now = Date.now();
    const newCounts = new Map();

    requestCounts.current.forEach((timestamps, endpoint) => {
      const rateLimitConfig = rateLimits.find(rl => rl.endpoint === endpoint);
      if (rateLimitConfig) {
        const validTimestamps = timestamps.filter(
          ts => now - ts < rateLimitConfig.windowMs
        );
        if (validTimestamps.length > 0) {
          newCounts.set(endpoint, validTimestamps);
        }
      }
    });

    requestCounts.current = newCounts;
  };

  const updateRateLimitStatus = () => {
    setRateLimits(prevLimits => 
      prevLimits.map(limit => {
        const counts = requestCounts.current.get(limit.endpoint) || [];
        const currentCount = counts.length;
        const blocked = currentCount >= limit.maxRequests;
        
        // Calculer le temps de reset
        const oldestRequest = counts[0];
        const resetTime = oldestRequest 
          ? new Date(oldestRequest + limit.windowMs)
          : new Date(Date.now() + limit.windowMs);

        return {
          ...limit,
          currentCount,
          resetTime,
          blocked
        };
      })
    );
  };

  const checkRateLimit = (endpoint: string): { allowed: boolean; retryAfter?: number } => {
    const rateLimitConfig = rateLimits.find(rl => rl.endpoint === endpoint);
    if (!rateLimitConfig) {
      return { allowed: true };
    }

    const now = Date.now();
    const counts = requestCounts.current.get(endpoint) || [];
    
    // Supprimer les requêtes expirées
    const validCounts = counts.filter(ts => now - ts < rateLimitConfig.windowMs);
    
    if (validCounts.length >= rateLimitConfig.maxRequests) {
      const oldestRequest = validCounts[0];
      const retryAfter = Math.ceil((oldestRequest + rateLimitConfig.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  };

  const makeRequest = (endpoint: string): boolean => {
    const rateCheck = checkRateLimit(endpoint);
    
    if (!rateCheck.allowed) {
      // Ajouter à l'historique des tentatives bloquées
      setRecentAttempts(prev => [
        {
          endpoint,
          timestamp: new Date(),
          blocked: true
        },
        ...prev.slice(0, 19) // Garder max 20 tentatives
      ]);
      
      return false;
    }

    // Enregistrer la requête
    const now = Date.now();
    const counts = requestCounts.current.get(endpoint) || [];
    requestCounts.current.set(endpoint, [...counts, now]);

    // Ajouter à l'historique des tentatives réussies
    setRecentAttempts(prev => [
      {
        endpoint,
        timestamp: new Date(),
        blocked: false
      },
      ...prev.slice(0, 19)
    ]);

    // Mettre à jour l'état
    updateRateLimitStatus();
    
    return true;
  };

  const simulateApiCall = (endpoint: string) => {
    const success = makeRequest(endpoint);
    
    if (!success) {
      const rateLimitConfig = rateLimits.find(rl => rl.endpoint === endpoint);
      const retryAfter = rateLimitConfig ? 
        Math.ceil((rateLimitConfig.resetTime.getTime() - Date.now()) / 1000) : 60;
      
      alert(`Rate limit atteint pour ${endpoint}! Réessayez dans ${retryAfter} secondes.`);
    } else {
      logger.debug(`✅ Requête ${endpoint} autorisée`);
    }
  };

  const getRemainingTime = (resetTime: Date): string => {
    const remaining = Math.max(0, resetTime.getTime() - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgressPercentage = (current: number, max: number): number => {
    return Math.min(100, (current / max) * 100);
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limiting Client-Side
          </CardTitle>
          <CardDescription>
            Protection contre les abus et limitation des requêtes côté frontend
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Configuration des limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rateLimits.map((limit) => (
                <Card key={limit.endpoint} className={`p-4 ${limit.blocked ? 'border-red-200 bg-red-50' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{limit.endpoint}</span>
                      {limit.blocked ? (
                        <Badge variant="destructive" className="text-xs">
                          <Ban className="h-3 w-3 mr-1" />
                          Bloqué
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          Actif
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Requêtes</span>
                        <span>{limit.currentCount}/{limit.maxRequests}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            limit.blocked ? 'bg-red-500' : 
                            getProgressPercentage(limit.currentCount, limit.maxRequests) > 75 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${getProgressPercentage(limit.currentCount, limit.maxRequests)}%` 
                          }}
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Reset dans: {getRemainingTime(limit.resetTime)}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => simulateApiCall(limit.endpoint)}
                      disabled={limit.blocked}
                      variant={limit.blocked ? "outline" : "default"}
                    >
                      {limit.blocked ? 'Bloqué' : 'Tester API'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Alertes actives */}
            {rateLimits.some(limit => limit.blocked) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>Rate limits actifs:</strong> Certains endpoints sont temporairement bloqués.
                  Les requêtes seront automatiquement réactivées après la période de cooldown.
                </AlertDescription>
              </Alert>
            )}

            {/* Historique des tentatives */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des requêtes</CardTitle>
                <CardDescription>
                  Dernières tentatives de requêtes API (max 20)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttempts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune tentative de requête enregistrée
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recentAttempts.map((attempt, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          attempt.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <span className="font-medium">{attempt.endpoint}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {attempt.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge 
                            variant={attempt.blocked ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {attempt.blocked ? 'Bloquée' : 'Autorisée'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration pour développement */}
            {import.meta.env.MODE === 'development' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-800">
                    Configuration de développement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• Rate limiting implémenté côté client uniquement (demo)</p>
                    <p>• En production, combiner avec rate limiting serveur (Supabase/Edge Functions)</p>
                    <p>• Persistance en localStorage possible pour survie entre sessions</p>
                    <p>• Intégration avec le monitoring Sentry pour alertes</p>
                    
                    <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                      <strong>Endpoints configurés:</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Génération musicale: 5 req/min</li>
                        <li>Extraction de données: 10 req/5min</li>
                        <li>Tentatives de connexion: 3 req/15min</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};