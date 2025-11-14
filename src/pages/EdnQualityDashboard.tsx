/**
 * Dashboard de Qualité EDN
 * Affiche les statistiques, analyses et rapports de qualité pour tous les items EDN
 */

import { useState } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Star, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useEdnGlobalQuality,
  useEdnGlobalStats,
  useEdnStatsBySpecialite,
  useEnrichAllEdnItems,
} from '@/hooks/useEdnQuality';
import { useEdnTopItems, useEdnIncompleteItems } from '@/hooks/useEdnSearch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function EdnQualityDashboard() {
  const [isEnriching, setIsEnriching] = useState(false);

  // Charger les données
  const { data: globalQuality, isLoading: loadingQuality, refetch: refetchQuality } = useEdnGlobalQuality();
  const { data: globalStats, isLoading: loadingStats } = useEdnGlobalStats();
  const { data: statsBySpecialty, isLoading: loadingSpecialty } = useEdnStatsBySpecialite();
  const { data: topItems } = useEdnTopItems(10);
  const { data: incompleteItems } = useEdnIncompleteItems(60, { limit: 10 });

  const enrichAllMutation = useEnrichAllEdnItems();

  const handleEnrichAll = async () => {
    if (!confirm('Enrichir tous les items EDN ? Cette opération peut prendre quelques minutes.')) {
      return;
    }

    setIsEnriching(true);

    try {
      const result = await enrichAllMutation.mutateAsync();

      toast({
        title: 'Enrichissement terminé !',
        description: `${result.total_enriched} items enrichis sur ${result.total_processed} traités (${result.success_rate.toFixed(2)}% de succès)`,
      });

      // Rafraîchir les données
      refetchQuality();
    } catch (error) {
      toast({
        title: 'Erreur lors de l\'enrichissement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  if (loadingQuality || loadingStats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Qualité EDN</h1>
          <p className="text-muted-foreground mt-1">
            Analyse et suivi de la qualité des 367 items EDN
          </p>
        </div>

        <Button
          onClick={handleEnrichAll}
          disabled={isEnriching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isEnriching ? 'animate-spin' : ''}`} />
          {isEnriching ? 'Enrichissement en cours...' : 'Enrichir tous les items'}
        </Button>
      </div>

      {/* Statistiques Globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={globalStats?.total_items || 0}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={`${globalStats?.validated_items || 0} validés`}
        />

        <StatCard
          title="Score Moyen"
          value={`${globalQuality?.average_quality_score.toFixed(1) || 0}%`}
          icon={<Star className="h-4 w-4" />}
          trend={`${globalStats?.complete_items || 0} complets`}
        />

        <StatCard
          title="Items Complets"
          value={globalStats?.complete_items || 0}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={`${((globalStats?.complete_items || 0) / (globalStats?.total_items || 1) * 100).toFixed(1)}%`}
          variant="success"
        />

        <StatCard
          title="À Améliorer"
          value={globalStats?.incomplete_items || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={`${((globalStats?.incomplete_items || 0) / (globalStats?.total_items || 1) * 100).toFixed(1)}%`}
          variant="warning"
        />
      </div>

      {/* Contenu Principal */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="specialty">Par Spécialité</TabsTrigger>
          <TabsTrigger value="top">Top Items</TabsTrigger>
          <TabsTrigger value="incomplete">À Améliorer</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <QualityDistributionCard globalQuality={globalQuality} />
            <ContentAvailabilityCard globalStats={globalStats} />
          </div>
        </TabsContent>

        {/* Distribution par grade */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution par Grade de Qualité</CardTitle>
              <CardDescription>Répartition des items selon leur score de complétude</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {globalQuality && (
                <>
                  <QualityGradeBar
                    label="Excellent"
                    count={globalQuality.quality_distribution.excellent}
                    total={globalQuality.total_items}
                    color="bg-green-500"
                    grade="⭐⭐⭐⭐⭐"
                    range="90-100"
                  />
                  <QualityGradeBar
                    label="Très Bon"
                    count={globalQuality.quality_distribution.tres_bon}
                    total={globalQuality.total_items}
                    color="bg-blue-500"
                    grade="⭐⭐⭐⭐"
                    range="80-89"
                  />
                  <QualityGradeBar
                    label="Bon"
                    count={globalQuality.quality_distribution.bon}
                    total={globalQuality.total_items}
                    color="bg-cyan-500"
                    grade="⭐⭐⭐"
                    range="70-79"
                  />
                  <QualityGradeBar
                    label="Satisfaisant"
                    count={globalQuality.quality_distribution.satisfaisant}
                    total={globalQuality.total_items}
                    color="bg-yellow-500"
                    grade="⭐⭐"
                    range="60-69"
                  />
                  <QualityGradeBar
                    label="Moyen"
                    count={globalQuality.quality_distribution.moyen}
                    total={globalQuality.total_items}
                    color="bg-orange-500"
                    grade="⭐"
                    range="50-59"
                  />
                  <QualityGradeBar
                    label="Insuffisant"
                    count={globalQuality.quality_distribution.insuffisant}
                    total={globalQuality.total_items}
                    color="bg-red-500"
                    grade="⚠️"
                    range="<50"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Par Spécialité */}
        <TabsContent value="specialty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques par Spécialité</CardTitle>
              <CardDescription>Performance par domaine médical</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSpecialty ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {statsBySpecialty?.slice(0, 10).map((spec) => (
                    <SpecialtyCard key={spec.specialite} specialty={spec} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Items */}
        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 - Meilleurs Items</CardTitle>
              <CardDescription>Items avec les meilleurs scores de qualité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topItems?.map((item, index) => (
                  <ItemRow
                    key={item.item_code}
                    item={item}
                    rank={index + 1}
                    showRank
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items à améliorer */}
        <TabsContent value="incomplete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Nécessitant Attention</CardTitle>
              <CardDescription>Items avec score de complétude inférieur à 60%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incompleteItems?.map((item) => (
                  <ItemRow key={item.item_code} item={item} variant="warning" />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Sous-composants
// ============================================

function StatCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const variantColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-orange-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${variantColors[variant]} mt-1`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QualityDistributionCard({ globalQuality }: { globalQuality: any }) {
  if (!globalQuality) return null;

  const total = globalQuality.total_items;
  const withAllComponents = globalQuality.items_with_all_components;
  const validated = globalQuality.items_validated;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue d'ensemble Qualité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Score moyen de qualité</span>
            <span className="font-bold">{globalQuality.average_quality_score.toFixed(1)}%</span>
          </div>
          <Progress value={globalQuality.average_quality_score} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Items complets</p>
            <p className="text-2xl font-bold text-green-600">{withAllComponents}</p>
            <p className="text-xs text-muted-foreground">
              {((withAllComponents / total) * 100).toFixed(1)}% du total
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Items validés</p>
            <p className="text-2xl font-bold text-blue-600">{validated}</p>
            <p className="text-xs text-muted-foreground">
              {((validated / total) * 100).toFixed(1)}% du total
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentAvailabilityCard({ globalStats }: { globalStats: any }) {
  if (!globalStats) return null;

  const contentTypes = [
    { label: 'Tableau Rang A', count: globalStats.items_with_tableau_a },
    { label: 'Tableau Rang B', count: globalStats.items_with_tableau_b },
    { label: 'Quiz', count: globalStats.items_with_quiz },
    { label: 'Scène Immersive', count: globalStats.items_with_immersive },
    { label: 'Paroles Musicales', count: globalStats.items_with_music },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disponibilité du Contenu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contentTypes.map((type) => (
          <div key={type.label} className="flex items-center justify-between">
            <span className="text-sm">{type.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{type.count}</span>
              <span className="text-xs text-muted-foreground">
                ({((type.count / globalStats.total_items) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QualityGradeBar({
  label,
  count,
  total,
  color,
  grade,
  range,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  grade: string;
  range: string;
}) {
  const percentage = (count / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({range})</span>
          <span>{grade}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{count}</span>
          <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function SpecialtyCard({ specialty }: { specialty: any }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex-1">
        <h4 className="font-medium">{specialty.specialite}</h4>
        <p className="text-sm text-muted-foreground">{specialty.domaine_medical}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Items</p>
          <p className="text-lg font-bold">{specialty.item_count}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Score Moy.</p>
          <p className="text-lg font-bold">{specialty.avg_completeness.toFixed(1)}%</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Validés</p>
          <p className="text-lg font-bold">{specialty.validated_count}</p>
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  rank,
  showRank = false,
  variant = 'default',
}: {
  item: any;
  rank?: number;
  showRank?: boolean;
  variant?: 'default' | 'warning';
}) {
  const scoreColor =
    item.completeness_score >= 80
      ? 'text-green-600'
      : item.completeness_score >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {showRank && (
          <span className="text-2xl font-bold text-muted-foreground w-8">#{rank}</span>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{item.item_code}</Badge>
            {item.is_validated && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <p className="text-sm font-medium mt-1">{item.title}</p>
          {item.specialite && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.specialite}</p>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className={`text-lg font-bold ${scoreColor}`}>
          {item.completeness_score}%
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <Skeleton className="h-96" />
    </div>
  );
}
