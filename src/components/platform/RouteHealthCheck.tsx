import React, { useState, useEffect } from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UNIFIED_ROUTES, getAllActiveRoutes } from '@/types/routes';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Activity,
  Route,
  Navigation,
  Globe,
  RefreshCw
} from 'lucide-react';

interface RouteHealth {
  path: string;
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  component: string;
  category: string;
  lastChecked?: Date;
}

export const RouteHealthCheck = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RouteHealth[]>([]);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const initializeRoutes = () => {
    const activeRoutes = getAllActiveRoutes();
    const healthRoutes: RouteHealth[] = activeRoutes.map(route => ({
      path: route.path,
      label: route.label,
      status: 'checking' as const,
      component: route.component,
      category: route.category
    }));
    setRoutes(healthRoutes);
  };

  const checkRouteHealth = async (route: RouteHealth): Promise<'healthy' | 'warning' | 'error'> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate route checking
        if (route.path.includes('admin') && Math.random() > 0.8) {
          resolve('warning');
        } else if (Math.random() > 0.95) {
          resolve('error');
        } else {
          resolve('healthy');
        }
      }, Math.random() * 1000 + 500);
    });
  };

  const runHealthCheck = async () => {
    setChecking(true);
    setProgress(0);
    
    const totalRoutes = routes.length;
    let checkedRoutes = 0;

    const updatedRoutes = await Promise.all(
      routes.map(async (route, index) => {
        const status = await checkRouteHealth(route);
        checkedRoutes++;
        setProgress((checkedRoutes / totalRoutes) * 100);
        
        return {
          ...route,
          status,
          lastChecked: new Date()
        };
      })
    );

    setRoutes(updatedRoutes);
    setChecking(false);
  };

  useEffect(() => {
    initializeRoutes();
  }, []);

  useEffect(() => {
    if (routes.length > 0 && routes[0].status === 'checking') {
      runHealthCheck();
    }
  }, [routes.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const healthyCount = routes.filter(r => r.status === 'healthy').length;
  const warningCount = routes.filter(r => r.status === 'warning').length;
  const errorCount = routes.filter(r => r.status === 'error').length;

  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<string, RouteHealth[]>);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Vérification des Routes</h2>
              <p className="text-muted-foreground">Statut de toutes les pages de la plateforme</p>
            </div>
          </div>
          
          <PremiumButton 
            variant="outline" 
            onClick={runHealthCheck}
            disabled={checking}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Vérifier à nouveau
          </PremiumButton>
        </div>

        {checking && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Vérification en cours...</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{routes.length}</div>
            <div className="text-sm text-muted-foreground">Total Routes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
            <div className="text-sm text-muted-foreground">Fonctionnelles</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-muted-foreground">Avertissements</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-muted-foreground">Erreurs</div>
          </div>
        </div>
      </PremiumCard>

      {/* Routes by Category */}
      {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
        <PremiumCard key={category} className="p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            {category} ({categoryRoutes.length} routes)
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            {categoryRoutes.map((route, index) => (
              <div 
                key={route.path}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(route.status)}
                  <div>
                    <div className="font-medium">{route.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {route.path} → {route.component}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                  
                  {route.status === 'healthy' && (
                    <PremiumButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(route.path)}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Tester
                    </PremiumButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      ))}

      {/* Quick Actions */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumButton 
            variant="outline" 
            onClick={() => navigate('/platform')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            Vue Plateforme
          </PremiumButton>
          
          <PremiumButton 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Dashboard
          </PremiumButton>
          
          <PremiumButton 
            variant="outline" 
            onClick={() => navigate('/analytics')}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Analytics
          </PremiumButton>
          
          <PremiumButton 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Administration
          </PremiumButton>
        </div>
      </PremiumCard>
    </div>
  );
};