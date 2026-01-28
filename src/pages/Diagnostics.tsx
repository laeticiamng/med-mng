/**
 * 🔧 Diagnostics Page - Dev Only
 * Shows userId, auth status, env, last API error, and average latency
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, RefreshCw, Shield, User, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface DiagnosticState {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  environment: 'development' | 'production';
  lastApiError: string | null;
  lastApiErrorTime: string | null;
  latencyHistory: number[];
  averageLatency: number;
  isOnline: boolean;
  supabaseStatus: 'connected' | 'error' | 'checking';
  sessionExpiry: string | null;
}

const Diagnostics = () => {
  const [state, setState] = useState<DiagnosticState>({
    userId: null,
    email: null,
    isAuthenticated: false,
    environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
    lastApiError: null,
    lastApiErrorTime: null,
    latencyHistory: [],
    averageLatency: 0,
    isOnline: navigator.onLine,
    supabaseStatus: 'checking',
    sessionExpiry: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      const start = performance.now();
      const { data: { user }, error } = await supabase.auth.getUser();
      const latency = performance.now() - start;

      if (error) {
        setState(prev => ({
          ...prev,
          lastApiError: `Auth error: ${error.message}`,
          lastApiErrorTime: new Date().toISOString(),
        }));
      }

      const { data: { session } } = await supabase.auth.getSession();

      setState(prev => {
        const newLatencyHistory = [...prev.latencyHistory, latency].slice(-5);
        const avgLatency = newLatencyHistory.reduce((a, b) => a + b, 0) / newLatencyHistory.length;

        return {
          ...prev,
          userId: user?.id || null,
          email: user?.email || null,
          isAuthenticated: !!user,
          latencyHistory: newLatencyHistory,
          averageLatency: Math.round(avgLatency),
          sessionExpiry: session?.expires_at 
            ? new Date(session.expires_at * 1000).toLocaleString('fr-FR')
            : null,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        lastApiError: `Exception: ${error instanceof Error ? error.message : 'Unknown'}`,
        lastApiErrorTime: new Date().toISOString(),
      }));
    }
  }, []);

  // Check Supabase connection
  const checkSupabaseConnection = useCallback(async () => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('onboarding_steps').select('id').limit(1);
      const latency = performance.now() - start;

      if (error) {
        setState(prev => ({
          ...prev,
          supabaseStatus: 'error',
          lastApiError: `DB error: ${error.message}`,
          lastApiErrorTime: new Date().toISOString(),
        }));
      } else {
        setState(prev => {
          const newLatencyHistory = [...prev.latencyHistory, latency].slice(-5);
          const avgLatency = newLatencyHistory.reduce((a, b) => a + b, 0) / newLatencyHistory.length;
          return {
            ...prev,
            supabaseStatus: 'connected',
            latencyHistory: newLatencyHistory,
            averageLatency: Math.round(avgLatency),
          };
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        supabaseStatus: 'error',
        lastApiError: `Connection error: ${error instanceof Error ? error.message : 'Unknown'}`,
        lastApiErrorTime: new Date().toISOString(),
      }));
    }
  }, []);

  // Refresh all diagnostics
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await checkAuth();
    await checkSupabaseConnection();
    setIsRefreshing(false);
  }, [checkAuth, checkSupabaseConnection]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Cette page n'est disponible qu'en mode développement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Diagnostics
          </h1>
          <p className="text-muted-foreground">
            Surveillance système et debug (dev only)
          </p>
        </div>
        <Button onClick={refreshAll} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Auth Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Authentification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={state.isAuthenticated ? 'default' : 'secondary'}>
                {state.isAuthenticated ? 'Connecté' : 'Anonyme'}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <code className="text-xs bg-muted px-1 rounded">
                  {state.userId || 'null'}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-xs">{state.email || '-'}</span>
              </div>
              {state.sessionExpiry && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session expire</span>
                  <span className="text-xs">{state.sessionExpiry}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Environnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mode</span>
              <Badge variant={state.environment === 'development' ? 'outline' : 'destructive'}>
                {state.environment}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Réseau</span>
                <div className="flex items-center gap-1">
                  {state.isOnline ? (
                    <>
                      <Wifi className="h-3 w-3 text-primary" />
                      <span className="text-primary">En ligne</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">Hors ligne</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase</span>
                <div className="flex items-center gap-1">
                  {state.supabaseStatus === 'connected' && (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  )}
                  {state.supabaseStatus === 'error' && (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                  {state.supabaseStatus === 'checking' && (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  )}
                  <span className={
                    state.supabaseStatus === 'connected' ? 'text-primary' :
                    state.supabaseStatus === 'error' ? 'text-destructive' : ''
                  }>
                    {state.supabaseStatus}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Latence moyenne</span>
              <Badge variant={state.averageLatency < 200 ? 'default' : state.averageLatency < 500 ? 'outline' : 'destructive'}>
                {state.averageLatency}ms
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <span className="text-muted-foreground">Historique (5 derniers)</span>
              <div className="flex gap-1 flex-wrap">
                {state.latencyHistory.map((latency, i) => (
                  <code key={i} className="text-xs bg-muted px-1 rounded">
                    {Math.round(latency)}ms
                  </code>
                ))}
                {state.latencyHistory.length === 0 && (
                  <span className="text-muted-foreground text-xs">Aucune mesure</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last API Error */}
      {state.lastApiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dernière erreur API</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{state.lastApiError}</p>
            {state.lastApiErrorTime && (
              <p className="text-xs opacity-70">
                {new Date(state.lastApiErrorTime).toLocaleString('fr-FR')}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Actions rapides
          </CardTitle>
          <CardDescription>
            Outils de debug pour développeurs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            Déconnexion forcée
          </Button>
          <Button variant="outline" size="sm" onClick={() => localStorage.clear()}>
            Clear localStorage
          </Button>
          <Button variant="outline" size="sm" onClick={() => sessionStorage.clear()}>
            Clear sessionStorage
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Hard Reload
          </Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User Agent</span>
              <span className="text-xs text-right max-w-[200px] truncate" title={navigator.userAgent}>
                {navigator.userAgent.split(' ').slice(-2).join(' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Langue</span>
              <span>{navigator.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Écran</span>
              <span>{window.innerWidth}x{window.innerHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heure locale</span>
              <span>{new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Diagnostics;
