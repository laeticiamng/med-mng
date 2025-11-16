import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Music, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMusicMetrics } from '@/hooks/useMusicMetrics';

export default function Monitoring() {
  const {
    globalStats,
    contentTypeStats,
    styleStats,
    dailyStats,
    loading,
    error
  } = useMusicMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">📊 Monitoring Génération Musicale</h1>
        <p className="text-muted-foreground">
          Métriques et statistiques en temps réel (30 derniers jours)
        </p>
      </div>

      {/* Global Stats Cards */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Générations</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.total_generations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.successful_generations} réussies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
              {globalStats.success_rate_percent >= 90 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalStats.success_rate_percent?.toFixed(1) || 0}%
              </div>
              <Progress value={globalStats.success_rate_percent} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalStats.avg_duration_seconds?.toFixed(0) || 0}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.avg_polling_attempts?.toFixed(1) || 0} tentatives polling
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Échecs</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {globalStats.failed_generations + globalStats.timeout_generations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.failed_generations} erreurs, {globalStats.timeout_generations} timeouts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats Tabs */}
      <Tabs defaultValue="content-type" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content-type">Par Type de Contenu</TabsTrigger>
          <TabsTrigger value="style">Par Style Musical</TabsTrigger>
          <TabsTrigger value="daily">Historique 7 Jours</TabsTrigger>
        </TabsList>

        <TabsContent value="content-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques par Type de Contenu</CardTitle>
              <CardDescription>EDN, ECOS, OIC - Performance comparée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentTypeStats.map((stat) => (
                  <div key={stat.content_type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="uppercase">
                          {stat.content_type}
                        </Badge>
                        <span className="text-sm font-medium">{stat.total} générations</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {stat.avg_duration?.toFixed(0)}s moy.
                        </span>
                        <Badge
                          variant={stat.success_rate >= 90 ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {stat.success_rate >= 90 ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {stat.success_rate?.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={stat.success_rate} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{stat.completed} réussies</span>
                      <span>{stat.failed} échouées</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Styles Musicaux</CardTitle>
              <CardDescription>Styles les plus utilisés et leur performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {styleStats.map((stat, index) => (
                  <div key={stat.style} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{stat.style}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{stat.total} générations</Badge>
                      <span className="text-sm text-muted-foreground">
                        {stat.avg_duration?.toFixed(0)}s
                      </span>
                      <Badge>
                        {((stat.completed / stat.total) * 100).toFixed(0)}% succès
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des 7 Derniers Jours</CardTitle>
              <CardDescription>Évolution quotidienne des générations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.map((stat) => (
                  <div key={stat.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {new Date(stat.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{stat.total} total</Badge>
                        <span className="text-sm text-muted-foreground">
                          {stat.avg_duration?.toFixed(0)}s moy.
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{stat.completed} réussies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>{stat.failed} échouées</span>
                      </div>
                    </div>
                    <Progress
                      value={(stat.completed / stat.total) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Performance */}
      {globalStats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance API</CardTitle>
            <CardDescription>Temps de réponse et métriques techniques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Réponse API Moyenne
                </div>
                <div className="text-2xl font-bold">
                  {globalStats.avg_api_response_ms?.toFixed(0) || 0}ms
                </div>
                <Progress
                  value={Math.min((globalStats.avg_api_response_ms / 3000) * 100, 100)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cible: &lt; 3000ms
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Tentatives Polling Moyennes
                </div>
                <div className="text-2xl font-bold">
                  {globalStats.avg_polling_attempts?.toFixed(1) || 0}
                </div>
                <Progress
                  value={Math.min((globalStats.avg_polling_attempts / 12) * 100, 100)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal: 6-12 tentatives
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Durée Génération Moyenne
                </div>
                <div className="text-2xl font-bold">
                  {Math.floor((globalStats.avg_duration_seconds || 0) / 60)}m{' '}
                  {Math.floor((globalStats.avg_duration_seconds || 0) % 60)}s
                </div>
                <Progress
                  value={Math.min((globalStats.avg_duration_seconds / 180) * 100, 100)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cible: &lt; 3 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
