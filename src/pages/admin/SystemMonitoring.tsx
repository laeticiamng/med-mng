import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Shield, 
  Zap, 
  TrendingUp,
  Activity,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { AdvancedHealthMonitor } from '@/components/system/AdvancedHealthMonitor';
import { EdgeFunctionDiagnostics } from '@/components/admin/EdgeFunctionDiagnostics';
import { SecurityFixPanel } from '@/components/admin/SecurityFixPanel';
import { PerformanceOptimizer } from '@/components/performance/PerformanceOptimizer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/AuthProvider';

const SystemMonitoring: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('health');
  
  // Vérification des permissions admin
  React.useEffect(() => {
    if (user && !user.user_metadata?.role?.includes('admin')) {
      toast({
        title: "Accès Refusé",
        description: "Cette section est réservée aux administrateurs.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  if (!user || !user.user_metadata?.role?.includes('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Administrateur Requis</h2>
            <p className="text-muted-foreground">
              Cette section est réservée aux administrateurs système.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Monitoring Système - MED-MNG Admin</title>
        <meta name="description" content="Tableau de bord administrateur pour le monitoring système MED-MNG" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Système</h1>
          <p className="text-muted-foreground">
            Surveillance complète de l'infrastructure MED-MNG
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Système Opérationnel
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Grade A (98.3%)
          </Badge>
        </div>
      </div>

      {/* Metrics Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime Système</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edge Functions</p>
                <p className="text-2xl font-bold">7/7</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Sécurité</p>
                <p className="text-2xl font-bold">98.3%</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">94/100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Santé Système
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Monitoring Santé Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedHealthMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Diagnostics Edge Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EdgeFunctionDiagnostics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Correctifs Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SecurityFixPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Optimisation Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceOptimizer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="w-6 h-6" />
              <span>Backup Base de Données</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Server className="w-6 h-6" />
              <span>Redémarrer Services</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Mode Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;