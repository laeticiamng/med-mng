import { ContentCompletenessAudit } from '@/components/audit/ContentCompletenessAudit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    FileText,
    Filter,
    Loader2,
    RefreshCw,
    TrendingUp,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AuditStats {
  totalItems: number;
  completeItems: number;
  partialItems: number;
  incompleteItems: number;
  completionRate: number;
  lastAuditDate: string | null;
}

interface AuditCategory {
  name: string;
  total: number;
  complete: number;
  partial: number;
  incomplete: number;
}

export default function AuditCompleteness() {
  const { logActivity } = useActivityTracking();
  const { _addPoints } = useGamification();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [categories, setCategories] = useState<AuditCategory[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  // Charger les statistiques d'audit
  const loadAuditStats = async () => {
    try {
      // Récupérer les items EDN pour les statistiques
      const { data: items, error } = await (supabase
        .from('edn_items_immersive') as any)
        .select('item_code, title, rang, completeness_score');

      if (error) throw error;

      const total = items?.length || 0;
      let complete = 0;
      let partial = 0;
      let incomplete = 0;

      const categoryStats: Record<string, AuditCategory> = {};

      items?.forEach((item: any) => {
        const score = item.completeness_score || 0;
        const rang = item.rang || 'Unknown';

        // Initialiser la catégorie si nécessaire
        if (!categoryStats[rang]) {
          categoryStats[rang] = {
            name: `Rang ${rang}`,
            total: 0,
            complete: 0,
            partial: 0,
            incomplete: 0
          };
        }
        categoryStats[rang].total++;

        // Classifier selon le score de complétude
        if (score >= 80) {
          complete++;
          categoryStats[rang].complete++;
        } else if (score >= 40) {
          partial++;
          categoryStats[rang].partial++;
        } else {
          incomplete++;
          categoryStats[rang].incomplete++;
        }
      });

      setStats({
        totalItems: total,
        completeItems: complete,
        partialItems: partial,
        incompleteItems: incomplete,
        completionRate: total > 0 ? Math.round((complete / total) * 100) : 0,
        lastAuditDate: new Date().toISOString()
      });

      setCategories(Object.values(categoryStats));
    } catch (err) {
      console.error('Error loading audit stats:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques d\'audit',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les audits récents
  const loadRecentAudits = async () => {
    try {
      const { _data, _error } = await supabase
        .from('operation_logs')
        .select('*')
        .eq('type', 'audit')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!_error && _data) {
        setRecentAudits(_data);
      }
    } catch (err) {
      console.error('Error loading recent audits:', err);
    }
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadAuditStats(), loadRecentAudits()]);
    setIsRefreshing(false);
    toast({
      title: 'Données rafraîchies',
      description: 'Les statistiques d\'audit ont été mises à jour'
    });
  };

  // Exporter le rapport d'audit
  const handleExport = async () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        stats,
        categories,
        recentAudits
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Gamification - removed (no user context here)

      toast({
        title: 'Export réussi',
        description: 'Le rapport d\'audit a été téléchargé'
      });
    } catch (err) {
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible d\'exporter le rapport',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      metadata: { action: 'view_audit_completeness', timestamp: new Date().toISOString() }
    });
    loadAuditStats();
    loadRecentAudits();
  }, []);

  // Composant de statistique
  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color.replace('text-', '')}/10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de l'audit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Audit de Complétude
            </h1>
            <p className="text-muted-foreground">
              Analysez et améliorez la qualité du contenu de la plateforme
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

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Items"
              value={stats.totalItems}
              icon={FileText}
              color="text-blue-500"
            />
            <StatCard
              title="Complets"
              value={stats.completeItems}
              icon={CheckCircle}
              color="text-green-500"
              subtitle={`${stats.completionRate}% du total`}
            />
            <StatCard
              title="Partiels"
              value={stats.partialItems}
              icon={AlertTriangle}
              color="text-yellow-500"
            />
            <StatCard
              title="Incomplets"
              value={stats.incompleteItems}
              icon={XCircle}
              color="text-red-500"
            />
          </div>
        )}

        {/* Progress global */}
        {stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression Globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taux de complétude</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Dernier audit : {stats.lastAuditDate
                    ? new Date(stats.lastAuditDate).toLocaleString('fr-FR')
                    : 'Jamais'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="detailed">
              <FileText className="h-4 w-4 mr-2" />
              Audit détaillé
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Filter className="h-4 w-4 mr-2" />
              Par catégorie
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {category.name}
                      <Badge variant={
                        category.complete / category.total > 0.8 ? 'default' :
                        category.complete / category.total > 0.5 ? 'secondary' : 'destructive'
                      }>
                        {Math.round((category.complete / category.total) * 100)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress
                        value={(category.complete / category.total) * 100}
                        className="h-2"
                      />
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-green-500 font-medium">{category.complete}</p>
                          <p className="text-xs text-muted-foreground">Complets</p>
                        </div>
                        <div className="text-center">
                          <p className="text-yellow-500 font-medium">{category.partial}</p>
                          <p className="text-xs text-muted-foreground">Partiels</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-500 font-medium">{category.incomplete}</p>
                          <p className="text-xs text-muted-foreground">Incomplets</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <ContentCompletenessAudit />
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Analyse par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.total} items
                        </span>
                      </div>
                      <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-muted">
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${(category.complete / category.total) * 100}%` }}
                        />
                        <div
                          className="bg-yellow-500 transition-all"
                          style={{ width: `${(category.partial / category.total) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${(category.incomplete / category.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Audits</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAudits.length > 0 ? (
                  <div className="space-y-3">
                    {recentAudits.map((audit) => (
                      <div
                        key={audit.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{audit.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(audit.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <Badge variant="outline">{audit.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun audit récent
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
