import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Music, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Target
} from "lucide-react"
import { musicService, GenerationStats } from "@/services/musicService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function MusicGenerationDashboard() {
  const [stats, setStats] = useState<GenerationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const data = await musicService.getGenerationStats()
      setStats(data)
      setLastUpdate(new Date().toLocaleString('fr-FR'))
    } catch (error) {
      console.error('❌ Error fetching generation stats:', error)
      toast.error('Erreur de chargement', {
        description: 'Impossible de récupérer les statistiques'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 95) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (rate >= 80) return <Activity className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getDurationStatus = (avgDuration: number) => {
    if (avgDuration <= 30) return { color: 'text-green-600', status: 'Excellent' }
    if (avgDuration <= 45) return { color: 'text-yellow-600', status: 'Correct' }
    return { color: 'text-red-600', status: 'Lent' }
  }

  if (isLoading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Chargement des statistiques...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Impossible de charger les statistiques de génération musicale.
            </AlertDescription>
          </Alert>
          <Button onClick={fetchStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            Monitoring Génération Musicale
          </h2>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour: {lastUpdate}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total générations */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Générations</p>
                <p className="text-2xl font-bold">{stats.total_generations}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Music className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taux de succès */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Succès</p>
                <p className={cn("text-2xl font-bold", getSuccessRateColor(stats.success_rate))}>
                  {stats.success_rate}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                {getSuccessRateIcon(stats.success_rate)}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={stats.success_rate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Durée moyenne */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Durée Moyenne</p>
                <p className={cn("text-2xl font-bold", getDurationStatus(stats.average_duration).color)}>
                  {stats.average_duration}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {getDurationStatus(stats.average_duration).status}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dernières 24h */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernières 24h</p>
                <p className="text-2xl font-bold">{stats.last_24h_count}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par statut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Répartition par Statut
          </CardTitle>
          <CardDescription>
            Distribution des générations selon leur état final
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.status_breakdown).map(([status, count]) => {
              const total = stats.total_generations
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              
              const getStatusInfo = (status: string) => {
                switch (status) {
                  case 'completed':
                    return { color: 'bg-green-500', label: 'Complétées', textColor: 'text-green-700' }
                  case 'failed':
                    return { color: 'bg-red-500', label: 'Échouées', textColor: 'text-red-700' }
                  case 'generating':
                    return { color: 'bg-blue-500', label: 'En cours', textColor: 'text-blue-700' }
                  case 'pending':
                    return { color: 'bg-gray-500', label: 'En attente', textColor: 'text-gray-700' }
                  default:
                    return { color: 'bg-gray-500', label: status, textColor: 'text-gray-700' }
                }
              }

              const statusInfo = getStatusInfo(status)

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", statusInfo.color)} />
                    <span className="font-medium">{statusInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", statusInfo.textColor)}>{count}</span>
                    <Badge variant="outline" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertes de performance */}
      {stats.performance_alerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{stats.performance_alerts} alertes de performance</strong> détectées. 
            Des générations ont pris plus de 30 secondes à se terminer.
          </AlertDescription>
        </Alert>
      )}

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Temps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plus rapide:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats.fastest_generation}s
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plus lente:</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {stats.slowest_generation}s
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Moyenne:</span>
                <Badge variant="outline">
                  {stats.average_duration}s
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {stats.success_rate >= 95 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  {stats.success_rate >= 95 ? 'Système optimal' : 'Surveillance requise'}
                </span>
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Seuil d'alerte: 30s par génération</p>
                <p>• Objectif: 95% de taux de succès</p>
                <p>• Mise à jour: Auto toutes les 30s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}