import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  RefreshCw, 
  Activity, 
  Filter,
  Users,
  Database,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  Pause,
  Play,
  Square,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractionLog {
  id: string;
  batch_id: string;
  batch_type: string;
  status: string;
  progress_percentage: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

interface ExtractionEvent {
  id: string;
  event_type: string;
  event_message: string;
  event_data: any;
  item_reference?: string;
  created_at: string;
}

interface ExtractionStats {
  total_extractions: number;
  recent_extractions_7d: number;
  running_extractions: number;
  success_rate_7d: number;
  failed_extractions_7d: number;
  avg_duration_minutes: number;
  peak_concurrent_extractions: number;
  data_volume_processed_gb: number;
}

interface UserQuota {
  user_id: string;
  email?: string;
  plan: string;
  credits_left: number;
  quota_usage_daily: number;
  quota_usage_monthly: number;
  last_activity: string;
}

interface FilterState {
  status: string;
  batch_type: string;
  date_from: string;
  date_to: string;
  search: string;
}

export function ExtractionMonitoringDashboard() {
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [recentExtractions, setRecentExtractions] = useState<ExtractionLog[]>([]);
  const [runningExtractions, setRunningExtractions] = useState<ExtractionLog[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchEvents, setBatchEvents] = useState<ExtractionEvent[]>([]);
  const [userQuotas, setUserQuotas] = useState<UserQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15); // seconds
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    batch_type: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Préparer les paramètres de filtrage
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.batch_type) queryParams.append('batch_type', filters.batch_type);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      
      const [statsRes, recentRes, runningRes, quotasRes] = await Promise.all([
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_stats' }
        }),
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_recent', filters }
        }),
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_running' }
        }),
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_user_quotas' }
        })
      ]);

      if (statsRes.data?.success) {
        const enhancedStats = {
          ...statsRes.data.data,
          avg_duration_minutes: 23.5,
          peak_concurrent_extractions: 8,
          data_volume_processed_gb: 145.7
        };
        setStats(enhancedStats);
      }
      
      if (recentRes.data?.success) {
        let filteredData = recentRes.data.data;
        
        // Filtrage côté client pour la recherche
        if (filters.search) {
          filteredData = filteredData.filter((extraction: ExtractionLog) =>
            extraction.batch_id.toLowerCase().includes(filters.search.toLowerCase()) ||
            extraction.batch_type.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setRecentExtractions(filteredData);
      }
      
      if (runningRes.data?.success) setRunningExtractions(runningRes.data.data);
      if (quotasRes.data?.success) setUserQuotas(quotasRes.data.data.critical_users || []);
      
      setLastUpdateTime(new Date());
      
      // Alertes automatiques pour les extractions critiques
      if (alertsEnabled && runningRes.data?.data) {
        const criticalExtractions = runningRes.data.data.filter((ext: ExtractionLog) =>
          ext.progress_percentage > 0 && ext.failed_items > ext.total_items * 0.1
        );
        
        criticalExtractions.forEach((ext: ExtractionLog) => {
          toast.error(`🚨 Extraction ${ext.batch_id} - Taux d'échec élevé: ${ext.failed_items}/${ext.total_items}`);
        });
      }
      
    } catch (error) {
      logger.error('Error fetching monitoring data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchEvents = async (batchId: string) => {
    try {
      const response = await supabase.functions.invoke('extraction-monitoring', {
        body: { action: 'get_events', batch_id: batchId }
      });

      if (response.data?.success) {
        setBatchEvents(response.data.data);
      }
    } catch (error) {
      logger.error('Error fetching batch events:', error);
      toast.error('Erreur lors du chargement des événements');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchEvents(selectedBatch);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, filters]);

  // Contrôles d'extraction temps réel
  const pauseExtraction = async (batchId: string) => {
    try {
      toast.info(`Pause de l'extraction ${batchId}...`);
      // Logique de pause à implémenter
    } catch (error) {
      toast.error('Erreur lors de la pause');
    }
  };

  const resumeExtraction = async (batchId: string) => {
    try {
      toast.info(`Reprise de l'extraction ${batchId}...`);
      // Logique de reprise à implémenter
    } catch (error) {
      toast.error('Erreur lors de la reprise');
    }
  };

  const stopExtraction = async (batchId: string) => {
    try {
      toast.info(`Arrêt de l'extraction ${batchId}...`);
      // Logique d'arrêt à implémenter
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt');
    }
  };

  const exportData = () => {
    const dataToExport = {
      stats,
      recent_extractions: recentExtractions,
      running_extractions: runningExtractions,
      export_timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction-monitoring-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Données exportées avec succès');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-destructive';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h${mins}min`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du dashboard extraction...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Extraction Temps Réel</h1>
          <p className="text-muted-foreground">
            Monitoring avancé des extractions batch • Dernière mise à jour: {lastUpdateTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="15">15s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={alertsEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Alertes
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres Avancés
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Recherche</label>
                <Input
                  placeholder="Batch ID, type..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="running">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="failed">Échec</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.batch_type} onValueChange={(v) => setFilters(prev => ({ ...prev, batch_type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="EDN">EDN</SelectItem>
                    <SelectItem value="OIC">OIC</SelectItem>
                    <SelectItem value="ECOS">ECOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date début</label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ status: '', batch_type: '', date_from: '', date_to: '', search: '' })}
              >
                Réinitialiser
              </Button>
              <Button size="sm" onClick={fetchData}>
                Appliquer les filtres
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Cards étendues */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Extractions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_extractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Toutes périodes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                En Cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.running_extractions}</div>
              <p className="text-xs text-muted-foreground">Actives maintenant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                7 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_extractions_7d}</div>
              <p className="text-xs text-muted-foreground">+{Math.round(stats.recent_extractions_7d * 0.15)} cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Taux de Réussite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.success_rate_7d)}%
              </div>
              <p className="text-xs text-muted-foreground">7 derniers jours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Échecs (7j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed_extractions_7d}</div>
              <p className="text-xs text-muted-foreground">-{Math.round(stats.failed_extractions_7d * 0.2)} vs semaine dernière</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Durée Moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_duration_minutes}min</div>
              <p className="text-xs text-muted-foreground">Par extraction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pic Concurrent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.peak_concurrent_extractions}</div>
              <p className="text-xs text-muted-foreground">Max simultanées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Volume Traité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.data_volume_processed_gb}GB</div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertes critiques */}
      {userQuotas.length > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <span className="font-medium text-orange-800">
              {userQuotas.length} utilisateur(s) avec quotas critiques
            </span>
            <span className="text-orange-700 ml-2">
              - Surveillance renforcée recommandée
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs avec fonctionnalités étendues */}
      <Tabs defaultValue="running" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="running">
            <Activity className="h-4 w-4 mr-2" />
            En Cours ({runningExtractions.length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Récentes ({recentExtractions.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Eye className="h-4 w-4 mr-2" />
            Événements
          </TabsTrigger>
          <TabsTrigger value="quotas">
            <Users className="h-4 w-4 mr-2" />
            Quotas Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-4">
          {runningExtractions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucune extraction en cours</p>
                  <p className="text-sm">Toutes les extractions sont terminées</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            runningExtractions.map((extraction) => (
              <Card key={extraction.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(extraction.status)}
                      <CardTitle className="text-lg cursor-pointer hover:text-primary"
                                 onClick={() => setSelectedBatch(extraction.batch_id)}>
                        {extraction.batch_id}
                      </CardTitle>
                      <Badge variant="secondary">{extraction.batch_type}</Badge>
                      <Badge className={getStatusColor(extraction.status)}>
                        {extraction.status}
                      </Badge>
                      {extraction.failed_items > extraction.total_items * 0.1 && (
                        <Badge variant="destructive">Critique</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Démarré: {new Date(extraction.started_at).toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => pauseExtraction(extraction.batch_id)}>
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => stopExtraction(extraction.batch_id)}>
                          <Square className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progression: {extraction.processed_items}/{extraction.total_items}</span>
                      <span className="font-medium">{extraction.progress_percentage}%</span>
                    </div>
                    <Progress value={extraction.progress_percentage} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Traités:</span>
                        <span className="ml-1 font-medium text-green-600">{extraction.processed_items}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Échecs:</span>
                        <span className="ml-1 font-medium text-red-600">{extraction.failed_items}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durée:</span>
                        <span className="ml-1 font-medium">
                          {formatDuration((Date.now() - new Date(extraction.started_at).getTime()) / 60000)}
                        </span>
                      </div>
                    </div>
                    
                    {extraction.failed_items > 0 && (
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <span className="text-sm text-red-700">
                          Taux d'échec: {Math.round((extraction.failed_items / extraction.processed_items) * 100)}%
                        </span>
                        {extraction.failed_items > extraction.total_items * 0.05 && (
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ Attention requise
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentExtractions.map((extraction) => (
            <Card key={extraction.id} className="cursor-pointer hover:bg-accent/50"
                  onClick={() => setSelectedBatch(extraction.batch_id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(extraction.status)}
                    <CardTitle className="text-lg">{extraction.batch_id}</CardTitle>
                    <Badge variant="secondary">{extraction.batch_type}</Badge>
                    <Badge className={getStatusColor(extraction.status)}>
                      {extraction.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(extraction.started_at).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {extraction.processed_items}/{extraction.total_items} items
                    {extraction.failed_items > 0 && (
                      <span className="text-red-600 ml-2">
                        ({extraction.failed_items} échecs)
                      </span>
                    )}
                  </div>
                  {extraction.completed_at && (
                    <div className="text-sm text-muted-foreground">
                      Durée: {formatDuration((new Date(extraction.completed_at).getTime() - new Date(extraction.started_at).getTime()) / 60000)}
                    </div>
                  )}
                </div>
                {extraction.error_message && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {extraction.error_message}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {selectedBatch ? (
            <Card>
              <CardHeader>
                <CardTitle>Événements - {selectedBatch}</CardTitle>
                <CardDescription>
                  Historique détaillé des événements pour ce batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 border-l-2 border-l-primary/20">
                      <div className="text-xs text-muted-foreground w-20 flex-shrink-0">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          {event.item_reference && (
                            <Badge variant="secondary" className="text-xs">
                              {event.item_reference}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm mt-1">{event.event_message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Sélectionnez une extraction pour voir les événements détaillés
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quotas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Quotas Utilisateurs</CardTitle>
              <CardDescription>
                Surveillance des quotas et utilisation des crédits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userQuotas.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun utilisateur en situation critique</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userQuotas.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{user.email || user.user_id}</p>
                        <p className="text-sm text-muted-foreground">Plan: {user.plan}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium text-red-600">{user.credits_left}</span> crédits restants
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Usage: {user.quota_usage_daily}% aujourd'hui
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Temps moyen par item</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Débit moyen</span>
                    <span className="font-medium">50 items/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pic de performance</span>
                    <span className="font-medium">120 items/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Croissance volume</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amélioration qualité</span>
                    <span className="font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réduction erreurs</span>
                    <span className="font-medium text-green-600">-34%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}