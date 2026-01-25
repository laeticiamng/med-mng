import { MigrationDashboard as MigrationDashboardComponent } from '@/components/migration/MigrationDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    Database,
    Download,
    FileCode,
    History,
    Loader2,
    Pause,
    Play,
    RefreshCw,
    Settings,
    Shield,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MigrationStats {
  totalMigrations: number;
  completedMigrations: number;
  pendingMigrations: number;
  failedMigrations: number;
  inProgressMigrations: number;
  successRate: number;
  lastMigrationDate: string | null;
}

interface MigrationRecord {
  id: string;
  name: string;
  version: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  changes: number;
  type: 'schema' | 'data' | 'index' | 'security';
  description?: string;
  error?: string;
}

export default function MigrationDashboardPage() {
  const { logActivity } = useActivityTracking();
  const { _addPoints } = useGamification();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [migrations, setMigrations] = useState<MigrationRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Charger les statistiques de migration
  const loadMigrationStats = async () => {
    try {
      // Simuler le chargement des migrations depuis la base de données
      // Dans un cas réel, cela viendrait d'une table schema_migrations
      const mockMigrations: MigrationRecord[] = [
        {
          id: 'mig_001',
          name: 'create_edn_items_table',
          version: '20240101_001',
          status: 'completed',
          startedAt: '2024-01-01T10:00:00Z',
          completedAt: '2024-01-01T10:00:15Z',
          duration: 15000,
          changes: 1,
          type: 'schema',
          description: 'Création de la table edn_items avec toutes les colonnes'
        },
        {
          id: 'mig_002',
          name: 'add_content_v2_column',
          version: '20240115_001',
          status: 'completed',
          startedAt: '2024-01-15T14:30:00Z',
          completedAt: '2024-01-15T14:30:05Z',
          duration: 5000,
          changes: 1,
          type: 'schema',
          description: 'Ajout de la colonne content_v2 pour le nouveau format de données'
        },
        {
          id: 'mig_003',
          name: 'migrate_content_to_v2',
          version: '20240120_001',
          status: 'completed',
          startedAt: '2024-01-20T09:00:00Z',
          completedAt: '2024-01-20T09:45:00Z',
          duration: 2700000,
          changes: 367,
          type: 'data',
          description: 'Migration des données vers le format v2'
        },
        {
          id: 'mig_004',
          name: 'add_performance_indexes',
          version: '20240201_001',
          status: 'completed',
          startedAt: '2024-02-01T08:00:00Z',
          completedAt: '2024-02-01T08:05:00Z',
          duration: 300000,
          changes: 5,
          type: 'index',
          description: 'Ajout d\'index pour améliorer les performances'
        },
        {
          id: 'mig_005',
          name: 'add_rls_policies',
          version: '20240210_001',
          status: 'completed',
          startedAt: '2024-02-10T11:00:00Z',
          completedAt: '2024-02-10T11:02:00Z',
          duration: 120000,
          changes: 8,
          type: 'security',
          description: 'Mise en place des politiques RLS pour la sécurité'
        },
        {
          id: 'mig_006',
          name: 'add_gamification_tables',
          version: '20240301_001',
          status: 'completed',
          startedAt: '2024-03-01T10:00:00Z',
          completedAt: '2024-03-01T10:01:00Z',
          duration: 60000,
          changes: 4,
          type: 'schema',
          description: 'Création des tables pour le système de gamification'
        },
        {
          id: 'mig_007',
          name: 'add_music_tracks_table',
          version: '20240315_001',
          status: 'completed',
          startedAt: '2024-03-15T15:00:00Z',
          completedAt: '2024-03-15T15:00:30Z',
          duration: 30000,
          changes: 1,
          type: 'schema',
          description: 'Table pour stocker les pistes musicales générées'
        },
        {
          id: 'mig_008',
          name: 'optimize_search_indexes',
          version: '20240401_001',
          status: 'completed',
          startedAt: '2024-04-01T09:00:00Z',
          completedAt: '2024-04-01T09:10:00Z',
          duration: 600000,
          changes: 3,
          type: 'index',
          description: 'Optimisation des index de recherche full-text'
        }
      ];

      setMigrations(mockMigrations);

      const completed = mockMigrations.filter(m => m.status === 'completed').length;
      const pending = mockMigrations.filter(m => m.status === 'pending').length;
      const failed = mockMigrations.filter(m => m.status === 'failed').length;
      const inProgress = mockMigrations.filter(m => m.status === 'running').length;

      setStats({
        totalMigrations: mockMigrations.length,
        completedMigrations: completed,
        pendingMigrations: pending,
        failedMigrations: failed,
        inProgressMigrations: inProgress,
        successRate: mockMigrations.length > 0 ? Math.round((completed / mockMigrations.length) * 100) : 0,
        lastMigrationDate: mockMigrations
          .filter(m => m.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]?.completedAt || null
      });

      // Charger l'activité récente
      const { _data: logs } = await supabase
        .from('operation_logs')
        .select('*')
        .eq('type', 'migration')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(logs || []);
    } catch (err) {
      console.error('Error loading migration stats:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques de migration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMigrationStats();
    setIsRefreshing(false);
    toast({
      title: 'Données rafraîchies',
      description: 'Les statistiques de migration ont été mises à jour'
    });
  };

  // Exporter le rapport de migrations
  const handleExport = async () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        stats,
        migrations,
        recentActivity
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `migration-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Gamification - removed (no user context here)

      toast({
        title: 'Export réussi',
        description: 'Le rapport de migration a été téléchargé'
      });
    } catch (err) {
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible d\'exporter le rapport',
        variant: 'destructive'
      });
    }
  };

  // Formatter la durée
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  // Obtenir l'icône du type de migration
  const getTypeIcon = (type: MigrationRecord['type']) => {
    switch (type) {
      case 'schema': return Database;
      case 'data': return ArrowRightLeft;
      case 'index': return Zap;
      case 'security': return Shield;
      default: return FileCode;
    }
  };

  // Obtenir la couleur du statut
  const getStatusVariant = (status: MigrationRecord['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'pending': return 'outline';
      case 'failed':
      case 'rolled_back': return 'destructive';
      default: return 'outline';
    }
  };

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      metadata: { action: 'view_migration_dashboard', timestamp: new Date().toISOString() }
    });
    loadMigrationStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des migrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de Bord des Migrations
              </h1>
            </div>
            <p className="text-muted-foreground">
              Gérez et surveillez les migrations de base de données
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalMigrations}</p>
                  </div>
                  <Database className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Complétées</p>
                    <p className="text-3xl font-bold text-green-500">{stats.completedMigrations}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.pendingMigrations}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Échecs</p>
                    <p className="text-3xl font-bold text-red-500">{stats.failedMigrations}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de succès</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerte si migrations en cours */}
        {stats && stats.inProgressMigrations > 0 && (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Migration en cours</AlertTitle>
            <AlertDescription>
              {stats.inProgressMigrations} migration(s) en cours d'exécution. Ne fermez pas cette page.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <Database className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="migrations">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Migrations
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Avancé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <MigrationDashboardComponent />
          </TabsContent>

          <TabsContent value="migrations">
            <div className="space-y-4">
              {migrations.map((migration) => {
                const TypeIcon = getTypeIcon(migration.type);
                return (
                  <Card key={migration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{migration.name}</h3>
                              <Badge variant={getStatusVariant(migration.status)}>
                                {migration.status === 'completed' ? 'Terminée' :
                                 migration.status === 'running' ? 'En cours' :
                                 migration.status === 'pending' ? 'En attente' :
                                 migration.status === 'failed' ? 'Échouée' : 'Annulée'}
                              </Badge>
                              <Badge variant="outline">{migration.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{migration.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Version: {migration.version}</span>
                              {migration.duration && (
                                <span>Durée: {formatDuration(migration.duration)}</span>
                              )}
                              <span>{migration.changes} changement(s)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {migration.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4 mr-1" />
                              Exécuter
                            </Button>
                          )}
                          {migration.status === 'running' && (
                            <Button size="sm" variant="outline">
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Activités</CardTitle>
                <CardDescription>
                  Journal des opérations de migration récentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{activity.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['schema', 'data', 'index', 'security'].map((type) => {
                      const count = migrations.filter(m => m.type === type).length;
                      const percentage = migrations.length > 0 ? (count / migrations.length) * 100 : 0;
                      const TypeIcon = getTypeIcon(type as MigrationRecord['type']);

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">{type}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Exécuter toutes les migrations en attente
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vérifier l'état de la base de données
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Créer un backup avant migration
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Annuler la dernière migration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
