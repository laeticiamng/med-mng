import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, TrendingUp, AlertTriangle, Clock, Zap, Users,
  CheckCircle, XCircle, BarChart3, Activity, RefreshCw, Download
} from 'lucide-react';
import { useSpotifyAI } from '@/hooks/useSpotifyAI';
import { toast } from 'sonner';
import { errorService } from '@/services/core/ErrorService';

export const MusicGenerationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('24h');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { getAdminStats } = useSpotifyAI();

  useEffect(() => {
    loadAdminStats();
    const interval = setInterval(loadAdminStats, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const stats = await getAdminStats(timeframe);
      setAdminStats(stats);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Erreur chargement stats admin'), 'api_call');
      toast.error('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Music className="h-7 w-7" />
                Dashboard Génération Musicale
              </CardTitle>
              <CardDescription className="text-green-100 mt-2">
                Monitoring et analytics des générations Suno en temps réel
              </CardDescription>
            </div>
            <Button onClick={loadAdminStats} disabled={loading} variant="secondary" size="sm">
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
      </Card>

      {adminStats?.stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminStats.stats.total_generations}</p>
                  <p className="text-sm text-muted-foreground">Générations Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminStats.stats.success_rate}%</p>
                  <p className="text-sm text-muted-foreground">Taux de Réussite</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="logs">Logs Détaillés</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-8 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Dashboard de monitoring musical Spotify IA opérationnel</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Logs de génération en temps réel</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};