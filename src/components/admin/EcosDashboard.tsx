import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  Book,
  Target,
  Clock,
  Users,
  Award,
  BarChart3
} from "lucide-react";
import { ecosService, EcosAnalytics } from '@/services/ecosService';

export const EcosDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<EcosAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await ecosService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading ECOS analytics:', error);
      if (!analytics) {
        toast.error('Erreur lors du chargement des analytics ECOS');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement des analytics ECOS...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Données indisponibles</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les analytics ECOS
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const competenceChartData = analytics.top_competences.map(item => ({
    name: item.competence.length > 20 ? item.competence.substring(0, 20) + '...' : item.competence,
    fullName: item.competence,
    value: item.count,
    percentage: Math.round((item.count / analytics.total_situations) * 100)
  }));

  const distributionData = [
    { 
      name: 'Avec compétences', 
      value: analytics.distribution_by_competences.with_competences,
      color: '#3b82f6'
    },
    { 
      name: 'Sans compétences', 
      value: analytics.distribution_by_competences.without_competences,
      color: '#ef4444'
    }
  ];

  const recentSituationsData = analytics.recent_additions.map((situation, index) => ({
    name: `ECOS ${situation.sd_id}`,
    date: new Date(situation.created_at).toLocaleDateString('fr-FR'),
    position: analytics.recent_additions.length - index
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard ECOS Analytics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Situations</p>
                <p className="text-3xl font-bold">{analytics.total_situations}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Book className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compétences Uniques</p>
                <p className="text-3xl font-bold">{analytics.total_competences}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moy. Compétences/Situation</p>
                <p className="text-3xl font-bold">
                  {analytics.avg_competences_per_situation.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Award className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Couverture Compétences</p>
                <p className="text-3xl font-bold">
                  {Math.round((analytics.distribution_by_competences.with_competences / analytics.total_situations) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
            <Progress 
              value={(analytics.distribution_by_competences.with_competences / analytics.total_situations) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Competences Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={competenceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} situations (${props.payload.percentage}%)`,
                    props.payload.fullName
                  ]}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition des Compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Situations Récemment Ajoutées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_additions.map((situation, index) => (
              <div key={situation.sd_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-mono">
                    #{situation.sd_id}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{situation.intitule_sd}</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajouté le {new Date(situation.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={index < 2 ? 'default' : 'secondary'}>
                  {index === 0 ? 'Nouveau' : index === 1 ? 'Récent' : 'Ajouté'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Efficacité du Contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Situations avec compétences</span>
                <Badge variant="default">
                  {analytics.distribution_by_competences.with_competences}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Situations sans compétences</span>
                <Badge variant="destructive">
                  {analytics.distribution_by_competences.without_competences}
                </Badge>
              </div>
              <Progress 
                value={(analytics.distribution_by_competences.with_competences / analytics.total_situations) * 100}
                className="mt-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Diversité des Compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.total_competences}</p>
                <p className="text-sm text-muted-foreground">compétences uniques</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {analytics.avg_competences_per_situation.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">moyenne par situation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Qualité du Catalogue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Complétude</span>
                <span className="font-semibold">
                  {Math.round((analytics.distribution_by_competences.with_competences / analytics.total_situations) * 100)}%
                </span>
              </div>
              <Progress 
                value={(analytics.distribution_by_competences.with_competences / analytics.total_situations) * 100}
              />
              <p className="text-xs text-muted-foreground">
                Basé sur la présence de compétences associées
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};