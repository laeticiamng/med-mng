import logger from '@/lib/logger';
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
  Cell 
} from 'recharts';
import { 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BookOpen,
  Palette,
  Sparkles
} from "lucide-react";
import { pedagogicalContentService, ContentAnalytics } from '@shared/services/pedagogicalContentService';

export const ContentGenerationMonitor: React.FC = () => {
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await pedagogicalContentService.getContentAnalytics();
      setAnalytics(data);
    } catch (error) {
      logger.error('Error loading analytics:', error);
      if (!analytics) {
        toast.error('Erreur lors du chargement des analytics');
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
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-4" />
          <p className="text-muted-foreground">Impossible de charger les analytics</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const contentTypeData = [
    { name: 'Bandes Dessinées', value: analytics.by_type.comic, color: '#3b82f6', icon: Palette },
    { name: 'Romans', value: analytics.by_type.novel, color: '#10b981', icon: BookOpen },
    { name: 'Poèmes', value: analytics.by_type.poem, color: '#8b5cf6', icon: Sparkles },
  ];

  const statusData = [
    { name: 'Terminés', value: analytics.by_status.completed, color: '#10b981', icon: CheckCircle },
    { name: 'En cours', value: analytics.by_status.generating, color: '#f59e0b', icon: Clock },
    { name: 'Erreurs', value: analytics.by_status.error, color: '#ef4444', icon: XCircle },
  ];

  const completionRate = analytics.total_content > 0 
    ? Math.round((analytics.by_status.completed / analytics.total_content) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monitoring Génération de Contenu
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
                <p className="text-sm font-medium text-muted-foreground">Total Contenus</p>
                <p className="text-2xl font-bold">{analytics.total_content}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items Uniques</p>
                <p className="text-2xl font-bold">{analytics.unique_items}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Réussite</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                <p className="text-2xl font-bold">{analytics.by_status.generating}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {contentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statuts de Génération</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Générations Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recent_generations.slice(0, 10).map((generation, index) => {
              const contentType = generation.content_type;
              const IconComponent = contentType === 'comic' ? Palette : 
                                  contentType === 'novel' ? BookOpen : Sparkles;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {pedagogicalContentService.formatContentTitle(contentType)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Item: {generation.item_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={generation.status === 'completed' ? 'default' : 
                              generation.status === 'generating' ? 'secondary' : 'destructive'}
                    >
                      {generation.status === 'completed' ? 'Terminé' :
                       generation.status === 'generating' ? 'En cours' : 'Erreur'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(generation.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};