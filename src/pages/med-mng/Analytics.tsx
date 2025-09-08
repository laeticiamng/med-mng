import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  Clock,
  Target,
  Music,
  Award,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ===============================================
// MED-MNG ANALYTICS - LEARNING INSIGHTS
// ===============================================

interface AnalyticsData {
  totalStudyTime: number;
  tracksGenerated: number;
  itemsMastered: number;
  weeklyStreak: number;
  completionRate: number;
}

const Analytics: React.FC = () => {
  // States
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Hooks
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch tracks
      // Mock tracks data until database is ready
      const tracksData = [];

      // Mock analytics data
      setData({
        totalStudyTime: 1200,
        tracksGenerated: tracksData?.length || 0,
        itemsMastered: 12,
        weeklyStreak: 5,
        completionRate: 78
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données analytiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analyses d'apprentissage
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivez vos progrès et optimisez votre formation médicale
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Temps d'étude total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatTime(data.totalStudyTime / 60)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Items maîtrisés</p>
                <p className="text-2xl font-bold text-green-900">
                  {data.itemsMastered}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Pistes générées</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.tracksGenerated}
                </p>
              </div>
              <Music className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">Taux de complétion</p>
                <p className="text-2xl font-bold text-orange-900">
                  {data.completionRate}%
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {data.weeklyStreak}
              </div>
              <p className="text-blue-600 font-medium">Jours consécutifs</p>
              <p className="text-xs text-blue-600 mt-1">Série d'étude actuelle</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-3xl font-bold text-green-900 mb-2">
                {Math.round((data.itemsMastered / Math.max(data.tracksGenerated, 1)) * 100)}%
              </div>
              <p className="text-green-600 font-medium">Taux de maîtrise</p>
              <p className="text-xs text-green-600 mt-1">Items maîtrisés/générés</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-3xl font-bold text-purple-900 mb-2">
                {Math.round(data.totalStudyTime / Math.max(data.weeklyStreak, 1) / 60)}min
              </div>
              <p className="text-purple-600 font-medium">Moyenne quotidienne</p>
              <p className="text-xs text-purple-600 mt-1">Temps/jour actif</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Graphiques détaillés disponibles prochainement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;