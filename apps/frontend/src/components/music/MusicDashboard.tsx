/**
 * 🎵 Dashboard de Monitoring du Générateur Musical
 *
 * Affiche:
 * - Statistiques de cache
 * - État de la file d'attente
 * - Métriques de génération
 * - Coûts et performances
 */

import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Clock,
  Database,
  DollarSign,
  Music,
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useMusicCache } from '@/hooks/music/useMusicCache';
import { MusicQueueService } from '@shared/services/musicQueueService';
import { musicService } from '@shared/services/musicService';

interface DashboardStats {
  cache: {
    totalCached: number;
    totalHits: number;
    cacheHitRate: number;
    topTracks: Array<{ itemCode: string; rang: string; hits: number }>;
  };
  queue: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  generation: {
    total_generations: number;
    success_rate: number;
    average_duration: number;
    last_24h_count: number;
  };
}

export const MusicDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getCacheStats, cleanExpiredCache } = useMusicCache();

  const loadStats = async () => {
    setLoading(true);
    try {
      const [cacheStats, queueStatus, generationStats] = await Promise.all([
        getCacheStats(),
        MusicQueueService.getQueueStatus(),
        musicService.getGenerationStats()
      ]);

      setStats({
        cache: cacheStats || {
          totalCached: 0,
          totalHits: 0,
          cacheHitRate: 0,
          topTracks: []
        },
        queue: {
          pending: queueStatus.pending,
          processing: queueStatus.processing,
          completed: queueStatus.completed,
          failed: queueStatus.failed
        },
        generation: generationStats
      });
    } catch (error) {
      logger.error('❌ Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCleanCache = async () => {
    await cleanExpiredCache();
    loadStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        Impossible de charger les statistiques
      </div>
    );
  }

  // Calculs de métriques
  const totalGenerations = stats.generation.total_generations;
  const cacheEconomies = stats.cache.totalHits * 0.5; // Estimation 0.5€ par génération évitée
  const queueLoad = stats.queue.processing + stats.queue.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Musical</h2>
          <p className="text-muted-foreground">
            Monitoring et analytics du générateur musical
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Générations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Générations Totales</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGenerations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.generation.last_24h_count} dernières 24h
            </p>
          </CardContent>
        </Card>

        {/* Taux de Succès */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generation.success_rate}%</div>
            <Progress value={stats.generation.success_rate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cache.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.cache.totalHits} hits / {stats.cache.totalCached} entrées
            </p>
          </CardContent>
        </Card>

        {/* Économies Estimées */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies Cache</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheEconomies.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Coûts API évités
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">
            <Activity className="h-4 w-4 mr-2" />
            File d'Attente
          </TabsTrigger>
          <TabsTrigger value="cache">
            <Database className="h-4 w-4 mr-2" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Clock className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* File d'Attente */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État de la File d'Attente</CardTitle>
              <CardDescription>
                Visualisation en temps réel des générations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* État de la charge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Charge Actuelle</span>
                    <span className="text-sm text-muted-foreground">{queueLoad} / 10</span>
                  </div>
                  <Progress value={(queueLoad / 10) * 100} />
                </div>

                {/* Compteurs par statut */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.queue.pending}
                    </div>
                    <div className="text-xs text-muted-foreground">En Attente</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.queue.processing}
                    </div>
                    <div className="text-xs text-muted-foreground">En Cours</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.queue.completed}
                    </div>
                    <div className="text-xs text-muted-foreground">Complétés</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.queue.failed}
                    </div>
                    <div className="text-xs text-muted-foreground">Échoués</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Tracks en Cache</CardTitle>
              <CardDescription>
                Les générations les plus réutilisées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.cache.topTracks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun track en cache pour le moment
                  </div>
                ) : (
                  stats.cache.topTracks.map((track, index) => (
                    <div
                      key={`${track.itemCode}-${track.rang}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{track.itemCode}</div>
                          <div className="text-sm text-muted-foreground">Rang {track.rang}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {track.hits} réutilisations
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleCleanCache}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Nettoyer les caches expirés
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Performance</CardTitle>
              <CardDescription>
                Temps de génération et fiabilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Durée Moyenne */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Durée Moyenne de Génération</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold">
                    {stats.generation.average_duration}s
                  </div>
                  <Progress
                    value={Math.min((stats.generation.average_duration / 180) * 100, 100)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Objectif: &lt; 60s
                  </p>
                </div>

                {/* Taux de Succès Détaillé */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fiabilité du Système</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {stats.generation.success_rate}%
                    </div>
                    <Badge
                      variant={stats.generation.success_rate >= 95 ? 'default' : 'destructive'}
                    >
                      {stats.generation.success_rate >= 95 ? 'Excellent' : 'À améliorer'}
                    </Badge>
                  </div>
                </div>

                {/* Activité Récente */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Activité 24h</span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold">
                    {stats.generation.last_24h_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    générations dans les dernières 24 heures
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
