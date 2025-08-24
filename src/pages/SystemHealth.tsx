import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Globe, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Music,
  Brain,
  Shield,
  Users
} from 'lucide-react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/use-toast';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  description: string;
  incidents: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const SystemHealth = () => {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Services principaux
  const [services] = useState<ServiceStatus[]>([
    {
      name: 'Plateforme Web',
      status: 'operational',
      uptime: 99.97,
      responseTime: 145,
      lastCheck: '2024-01-20T10:30:00Z',
      description: 'Interface utilisateur principale',
      incidents: 0
    },
    {
      name: 'API Principal',
      status: 'operational',
      uptime: 99.95,
      responseTime: 89,
      lastCheck: '2024-01-20T10:30:00Z',
      description: 'Services backend et API REST',
      incidents: 0
    },
    {
      name: 'Base de Données',
      status: 'operational',
      uptime: 100.0,
      responseTime: 23,
      lastCheck: '2024-01-20T10:30:00Z',
      description: 'Supabase PostgreSQL',
      incidents: 0
    },
    {
      name: 'Génération Musicale IA',
      status: 'degraded',
      uptime: 98.2,
      responseTime: 2340,
      lastCheck: '2024-01-20T10:28:00Z',
      description: 'Service de génération MNG',
      incidents: 1
    }
  ]);

  const refreshStatus = async () => {
    setIsLoading(true);
    // Simulation d'un refresh avec appel API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastUpdate(new Date());
      
      toast({
        title: "✅ Statut mis à jour",
        description: "Les informations système ont été actualisées avec succès.",
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur de mise à jour",
        description: "Impossible de récupérer les dernières informations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'outage': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'outage': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'operational' 
    : services.some(s => s.status === 'outage') 
    ? 'outage' 
    : 'degraded';

  const avgUptime = services.reduce((sum, s) => sum + s.uptime, 0) / services.length;

  return (
    <ConsistentBackground variant="light">
      <PageHeader
        title="État des Services"
        subtitle="Surveillance en temps réel de la plateforme MED MNG"
        icon={Activity}
        showBackButton
        backTo="/"
        actions={
          <Button 
            onClick={refreshStatus}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Status général */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    overallStatus === 'operational' ? 'bg-green-100' :
                    overallStatus === 'outage' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {getStatusIcon(overallStatus)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {overallStatus === 'operational' ? 'Tous les systèmes opérationnels' :
                       overallStatus === 'outage' ? 'Problème critique détecté' : 'Performance dégradée'}
                    </h2>
                    <p className="text-gray-600">
                      Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{avgUptime.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">Disponibilité</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {service.name.includes('Web') && <Globe className="h-5 w-5" />}
                        {service.name.includes('API') && <Server className="h-5 w-5" />}
                        {service.name.includes('Base') && <Database className="h-5 w-5" />}
                        {service.name.includes('IA') && <Brain className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                      <span className="ml-1 capitalize">
                        {service.status === 'operational' ? 'Opérationnel' :
                         service.status === 'degraded' ? 'Dégradé' :
                         service.status === 'outage' ? 'Panne' : 'Maintenance'}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-green-600">{service.uptime}%</div>
                      <div className="text-gray-500">Uptime</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600">{service.responseTime}ms</div>
                      <div className="text-gray-500">Réponse</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">{service.incidents}</div>
                      <div className="text-gray-500">Incidents</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress value={service.uptime} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Dernier contrôle: {new Date(service.lastCheck).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default SystemHealth;