import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Zap,
  Database,
  Music,
  Brain,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Clock,
  TrendingUp,
  Server,
  Wifi,
  Shield,
  Bell,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  category: 'core' | 'music' | 'ai' | 'analytics' | 'storage';
  description: string;
  icon: React.ReactNode;
}

interface SystemMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  cacheHitRate: number;
}

export const APIStatusDashboard: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    cacheHitRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadAPIStatus();
    const interval = setInterval(loadAPIStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAPIStatus = async () => {
    try {
      setLoading(true);
      
      // Simuler les données de statut API
      const mockEndpoints: APIEndpoint[] = [
        {
          id: 'supabase-db',
          name: 'Base de Données',
          url: 'supabase.co/db',
          status: 'healthy',
          responseTime: 45,
          uptime: 99.9,
          lastChecked: new Date(),
          category: 'core',
          description: 'Base de données principale Supabase',
          icon: <Database className="h-4 w-4" />
        },
        {
          id: 'auth-service',
          name: 'Service d\'Authentification',
          url: 'supabase.co/auth',
          status: 'healthy',
          responseTime: 32,
          uptime: 99.8,
          lastChecked: new Date(),
          category: 'core',
          description: 'Authentification et autorisation',
          icon: <Shield className="h-4 w-4" />
        },
        {
          id: 'suno-api',
          name: 'API Suno Music',
          url: 'suno.ai/api',
          status: 'healthy',
          responseTime: 1200,
          uptime: 98.5,
          lastChecked: new Date(),
          category: 'music',
          description: 'Génération de musique IA',
          icon: <Music className="h-4 w-4" />
        },
        {
          id: 'openai-api',
          name: 'API OpenAI',
          url: 'api.openai.com',
          status: 'degraded',
          responseTime: 850,
          uptime: 97.2,
          lastChecked: new Date(),
          category: 'ai',
          description: 'Intelligence artificielle conversationnelle',
          icon: <Brain className="h-4 w-4" />
        },
        {
          id: 'chat-service',
          name: 'Service de Chat',
          url: 'internal/chat',
          status: 'healthy',
          responseTime: 125,
          uptime: 99.1,
          lastChecked: new Date(),
          category: 'ai',
          description: 'Chat médical intelligent',
          icon: <MessageSquare className="h-4 w-4" />
        },
        {
          id: 'analytics-api',
          name: 'API Analytics',
          url: 'internal/analytics',
          status: 'healthy',
          responseTime: 89,
          uptime: 99.7,
          lastChecked: new Date(),
          category: 'analytics',
          description: 'Collecte et analyse des données',
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          id: 'storage-api',
          name: 'Stockage de Fichiers',
          url: 'supabase.co/storage',
          status: 'healthy',
          responseTime: 156,
          uptime: 99.6,
          lastChecked: new Date(),
          category: 'storage',
          description: 'Stockage des fichiers multimédia',
          icon: <Server className="h-4 w-4" />
        },
        {
          id: 'cdn-service',
          name: 'Réseau de Distribution',
          url: 'cdn.platform.com',
          status: 'down',
          responseTime: 0,
          uptime: 94.3,
          lastChecked: new Date(),
          category: 'storage',
          description: 'Distribution de contenu global',
          icon: <Globe className="h-4 w-4" />
        }
      ];

      setEndpoints(mockEndpoints);

      // Calculer les métriques système
      const totalHealthy = mockEndpoints.filter(e => e.status === 'healthy').length;
      const totalEndpoints = mockEndpoints.length;
      const avgResponseTime = mockEndpoints.reduce((sum, e) => sum + e.responseTime, 0) / totalEndpoints;
      const avgUptime = mockEndpoints.reduce((sum, e) => sum + e.uptime, 0) / totalEndpoints;

      setMetrics({
        totalRequests: 1247893,
        successRate: avgUptime,
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: 100 - avgUptime,
        activeConnections: 1534,
        cacheHitRate: 94.2,
      });

      setLastRefresh(new Date());

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le statut des APIs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: APIEndpoint['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: APIEndpoint['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: APIEndpoint['category']) => {
    switch (category) {
      case 'core':
        return 'bg-blue-500';
      case 'music':
        return 'bg-purple-500';
      case 'ai':
        return 'bg-green-500';
      case 'analytics':
        return 'bg-orange-500';
      case 'storage':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryName = (category: APIEndpoint['category']) => {
    switch (category) {
      case 'core':
        return 'Core';
      case 'music':
        return 'Musique';
      case 'ai':
        return 'IA';
      case 'analytics':
        return 'Analytics';
      case 'storage':
        return 'Stockage';
      default:
        return 'Autre';
    }
  };

  const groupedEndpoints = endpoints.reduce((groups, endpoint) => {
    const category = endpoint.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(endpoint);
    return groups;
  }, {} as Record<string, APIEndpoint[]>);

  const overallHealth = endpoints.length > 0 
    ? endpoints.filter(e => e.status === 'healthy').length / endpoints.length * 100
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              État des APIs et Services
            </CardTitle>
            <CardDescription>
              Monitoring en temps réel des services de la plateforme
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Dernière MAJ: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={loadAPIStatus}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métriques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Santé Globale</Badge>
            </div>
            <div className="text-2xl font-bold text-green-700">{overallHealth.toFixed(1)}%</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Temps Réponse</Badge>
            </div>
            <div className="text-2xl font-bold text-blue-700">{metrics.averageResponseTime}ms</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Taux Succès</Badge>
            </div>
            <div className="text-2xl font-bold text-purple-700">{metrics.successRate.toFixed(1)}%</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="h-6 w-6 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">Connexions</Badge>
            </div>
            <div className="text-2xl font-bold text-orange-700">{metrics.activeConnections.toLocaleString()}</div>
          </div>
        </div>

        {/* Détails des métriques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Requêtes Totales (24h)</div>
            <div className="text-xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Taux d'Erreur</div>
            <div className="text-xl font-bold text-red-600">{metrics.errorRate.toFixed(2)}%</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Cache Hit Rate</div>
            <div className="text-xl font-bold text-green-600">{metrics.cacheHitRate}%</div>
          </div>
        </div>

        {/* Status des endpoints par catégorie */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Status des Services</h3>
          {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-gray-700 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(category as APIEndpoint['category'])}`}></div>
                {getCategoryName(category as APIEndpoint['category'])} ({categoryEndpoints.length} services)
              </h4>
              
              <div className="grid gap-3">
                {categoryEndpoints.map((endpoint) => (
                  <div key={endpoint.id} className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getCategoryColor(endpoint.category)} text-white`}>
                          {endpoint.icon}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{endpoint.name}</h5>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(endpoint.status)}
                        <Badge className={getStatusColor(endpoint.status)}>
                          {endpoint.status === 'healthy' ? 'Opérationnel' :
                           endpoint.status === 'degraded' ? 'Dégradé' : 'Hors Service'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Temps de réponse</div>
                        <div className="font-medium">
                          {endpoint.responseTime > 0 ? `${endpoint.responseTime}ms` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Uptime</div>
                        <div className="font-medium">{endpoint.uptime.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Dernière vérification</div>
                        <div className="font-medium">
                          {endpoint.lastChecked.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression pour l'uptime */}
                    <div className="mt-3">
                      <Progress value={endpoint.uptime} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions et alertes */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button size="sm" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Voir Métriques Détaillées
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Configurer Alertes
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres Monitoring
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};