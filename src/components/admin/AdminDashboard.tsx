import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Activity, 
  Database, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { monitoringService } from '@/services/monitoringService';
import { toast } from 'sonner';
import { RobustErrorDisplay } from '@/components/common/RobustErrorDisplay';
import { AlertBanner } from '@/components/common/AlertBanner';

interface AdminMetrics {
  activeUsers: number;
  totalSessions: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  activeExtractions: number;
  quotaUsage: number;
  errorRate: number;
  responseTime: number;
  lastUpdate: Date;
}

interface BatchInfo {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startedAt: Date;
  estimatedCompletion?: Date;
  itemsProcessed: number;
  totalItems: number;
  errors: number;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [error, setError] = useState<string | null>(null);

  const { events, isConnected, clearEvents, filterEventsBySeverity } = useRealTimeMonitoring();

  // Auto-refresh data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch metrics
        const health = await monitoringService.checkSystemHealth();
        const performance = await monitoringService.getPerformanceMetrics();
        
        const adminMetrics: AdminMetrics = {
          activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
          totalSessions: Math.floor(Math.random() * 100) + 50,
          systemHealth: health.status,
          activeExtractions: health.metrics.activeConnections,
          quotaUsage: Math.floor(Math.random() * 80) + 10,
          errorRate: health.metrics.errorRate,
          responseTime: health.metrics.responseTime,
          lastUpdate: new Date()
        };

        setMetrics(adminMetrics);

        // Fetch batch information (mock data for now)
        const mockBatches: BatchInfo[] = [
          {
            id: 'batch-001',
            type: 'EDN Extraction',
            status: 'running',
            progress: 75,
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000),
            itemsProcessed: 150,
            totalItems: 200,
            errors: 2
          },
          {
            id: 'batch-002',
            type: 'OIC Sync',
            status: 'completed',
            progress: 100,
            startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            itemsProcessed: 500,
            totalItems: 500,
            errors: 0
          },
          {
            id: 'batch-003',
            type: 'ECOS Processing',
            status: 'failed',
            progress: 45,
            startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            itemsProcessed: 90,
            totalItems: 200,
            errors: 15
          }
        ];

        setBatches(mockBatches);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        toast.error('Erreur lors du chargement des données admin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      matchesDate = batch.startedAt >= today;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des données admin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <RobustErrorDisplay 
          error={error}
          type="admin"
          onRetry={() => window.location.reload()}
          onReport={() => toast.success('Erreur signalée à l\'équipe technique')}
        />
      )}

      {/* Critical Alerts */}
      {metrics?.systemHealth === 'down' && (
        <AlertBanner
          type="critical"
          title="Système en panne"
          message="Le système principal est actuellement indisponible"
          action={
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Actions d'urgence
            </Button>
          }
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Monitoring temps réel et gestion des extractions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Temps réel actif' : 'Connexion perdue'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% par rapport à hier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={metrics.systemHealth === 'healthy' ? 'default' : 'destructive'}
                  className="text-lg font-bold py-1"
                >
                  {metrics.systemHealth === 'healthy' ? 'Sain' : 
                   metrics.systemHealth === 'degraded' ? 'Dégradé' : 'Panne'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Temps de réponse: {metrics.responseTime}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extractions Actives</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeExtractions}</div>
              <p className="text-xs text-muted-foreground">
                Taux d'erreur: {metrics.errorRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Quotas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.quotaUsage}%</div>
              <p className="text-xs text-muted-foreground">
                de la capacité totale
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Extractions en Cours</TabsTrigger>
          <TabsTrigger value="logs">Logs Temps Réel</TabsTrigger>
          <TabsTrigger value="users">Gestion Utilisateurs</TabsTrigger>
          <TabsTrigger value="quotas">Monitoring Quotas</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres Avancés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par ID ou type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="running">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Batches List */}
          <div className="space-y-4">
            {filteredBatches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(batch.status)}
                        {batch.type} - {batch.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Démarré {batch.startedAt.toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{batch.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${batch.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Items traités</p>
                        <p className="font-medium">{batch.itemsProcessed}/{batch.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Erreurs</p>
                        <p className={`font-medium ${batch.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {batch.errors}
                        </p>
                      </div>
                      {batch.estimatedCompletion && (
                        <div>
                          <p className="text-muted-foreground">Fin estimée</p>
                          <p className="font-medium">{batch.estimatedCompletion.toLocaleTimeString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium">
                          {Math.floor((Date.now() - batch.startedAt.getTime()) / 60000)}min
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements Temps Réel</CardTitle>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {events.length} événements - Connexion {isConnected ? 'active' : 'inactive'}
                </p>
                <Button variant="outline" size="sm" onClick={clearEvents}>
                  Vider les logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun événement récent
                  </p>
                ) : (
                  events.slice(0, 50).map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded border-l-4 ${
                        event.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        event.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        event.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.type} - {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'high' ? 'destructive' :
                          event.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {event.severity}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Module de gestion des utilisateurs à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotas">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring des Quotas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Module de monitoring des quotas à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}