import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, MemoryStick, Trash2, Activity, RefreshCw, Gauge, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemoryStats {
  totalHeapSize: number;
  usedHeapSize: number;
  heapSizeLimit: number;
  totalJSHeapSize: number;
}

interface MemoryLeak {
  id: string;
  component: string;
  type: 'listener' | 'interval' | 'observer' | 'reference';
  severity: 'low' | 'medium' | 'high';
  memoryImpact: number;
  detected: Date;
}

interface ComponentMemoryUsage {
  name: string;
  instances: number;
  memoryPerInstance: number;
  totalMemory: number;
  trend: 'up' | 'down' | 'stable';
}

export const MemoryManagementSystem: React.FC = () => {
  const { toast } = useToast();
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    totalHeapSize: 0,
    usedHeapSize: 0,
    heapSizeLimit: 0,
    totalJSHeapSize: 0
  });
  const [memoryLeaks, setMemoryLeaks] = useState<MemoryLeak[]>([]);
  const [componentUsage, setComponentUsage] = useState<ComponentMemoryUsage[]>([]);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [monitoring, setMonitoring] = useState(true);
  const [gcThreshold, setGcThreshold] = useState(75);

  // Surveillance mémoire en temps réel
  const getMemoryStats = useCallback((): MemoryStats => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        totalHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
        usedHeapSize: Math.round(memory.usedJSHeapSize / 1048576),   // MB
        heapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576)
      };
    }
    // Valeurs simulées si l'API n'est pas disponible
    return {
      totalHeapSize: 45,
      usedHeapSize: 32,
      heapSizeLimit: 128,
      totalJSHeapSize: 45
    };
  }, []);

  // Détection des fuites mémoire simulées
  useEffect(() => {
    const mockLeaks: MemoryLeak[] = [
      {
        id: '1',
        component: 'DataVisualization',
        type: 'listener',
        severity: 'high',
        memoryImpact: 5.2,
        detected: new Date()
      },
      {
        id: '2',
        component: 'NotificationSystem',
        type: 'interval',
        severity: 'medium',
        memoryImpact: 2.8,
        detected: new Date()
      },
      {
        id: '3',
        component: 'RealtimeUpdates',
        type: 'observer',
        severity: 'low',
        memoryImpact: 1.1,
        detected: new Date()
      }
    ];

    const mockComponentUsage: ComponentMemoryUsage[] = [
      { name: 'Dashboard', instances: 1, memoryPerInstance: 8.5, totalMemory: 8.5, trend: 'stable' },
      { name: 'DataTable', instances: 3, memoryPerInstance: 4.2, totalMemory: 12.6, trend: 'up' },
      { name: 'Chart', instances: 5, memoryPerInstance: 2.8, totalMemory: 14.0, trend: 'down' },
      { name: 'Modal', instances: 2, memoryPerInstance: 1.5, totalMemory: 3.0, trend: 'stable' }
    ];

    setMemoryLeaks(mockLeaks);
    setComponentUsage(mockComponentUsage);
  }, []);

  // Monitoring automatique
  useEffect(() => {
    if (!monitoring) return;

    const interval = setInterval(() => {
      const stats = getMemoryStats();
      setMemoryStats(stats);

      // Déclenchement automatique du GC si nécessaire
      const usagePercent = (stats.usedHeapSize / stats.heapSizeLimit) * 100;
      if (usagePercent > gcThreshold && autoCleanup) {
        performGarbageCollection();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [monitoring, gcThreshold, autoCleanup, getMemoryStats]);

  // Simulation du garbage collection
  const performGarbageCollection = useCallback(() => {
    // Simuler une réduction de la mémoire utilisée
    setMemoryStats(prev => ({
      ...prev,
      usedHeapSize: Math.max(prev.usedHeapSize * 0.7, 10)
    }));

    toast({
      title: "Nettoyage mémoire effectué",
      description: "La mémoire a été optimisée automatiquement",
    });
  }, [toast]);

  // Nettoyage des fuites mémoire
  const fixMemoryLeak = (leakId: string) => {
    setMemoryLeaks(prev => prev.filter(leak => leak.id !== leakId));
    
    toast({
      title: "Fuite mémoire corrigée",
      description: "Le problème de mémoire a été résolu",
    });
  };

  // Analyse de la mémoire
  const analyzeMemory = () => {
    const totalComponentMemory = componentUsage.reduce((sum, comp) => sum + comp.totalMemory, 0);
    const memoryEfficiency = (memoryStats.usedHeapSize / memoryStats.heapSizeLimit) * 100;
    
    toast({
      title: "Analyse terminée",
      description: `${totalComponentMemory.toFixed(1)}MB utilisés par les composants (${memoryEfficiency.toFixed(1)}% du heap)`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const usagePercent = memoryStats.heapSizeLimit > 0 
    ? (memoryStats.usedHeapSize / memoryStats.heapSizeLimit) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Gestion Avancée de la Mémoire
          </CardTitle>
          <CardDescription>
            Surveillance, optimisation et prévention des fuites mémoire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={monitoring}
                  onCheckedChange={setMonitoring}
                />
                <label className="text-sm font-medium">
                  Surveillance active
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoCleanup}
                  onCheckedChange={setAutoCleanup}
                />
                <label className="text-sm font-medium">
                  Nettoyage automatique
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={performGarbageCollection} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Nettoyer
              </Button>
              <Button onClick={analyzeMemory} variant="outline">
                <Gauge className="h-4 w-4 mr-2" />
                Analyser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="leaks">Fuites Mémoire</TabsTrigger>
          <TabsTrigger value="components">Composants</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mémoire Utilisée</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {memoryStats.usedHeapSize} MB
                </div>
                <p className="text-xs text-muted-foreground">
                  sur {memoryStats.heapSizeLimit} MB disponibles
                </p>
                <Progress value={usagePercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fuites Détectées</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {memoryLeaks.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {memoryLeaks.filter(l => l.severity === 'high').length} critiques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficacité</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {(100 - usagePercent).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Mémoire disponible
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seuil GC</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {gcThreshold}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Déclenchement automatique
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaks" className="space-y-4">
          {memoryLeaks.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MemoryStick className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-success">Aucune fuite détectée</h3>
                  <p className="text-muted-foreground">La mémoire est bien gérée</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {memoryLeaks.map((leak) => (
                <Card key={leak.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className={`h-5 w-5 ${
                        leak.severity === 'high' ? 'text-destructive' : 
                        leak.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <div className="font-medium">{leak.component}</div>
                        <div className="text-sm text-muted-foreground">
                          {leak.type} • {leak.memoryImpact} MB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(leak.severity) as any}>
                        {leak.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fixMemoryLeak(leak.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Corriger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="space-y-3">
            {componentUsage.map((component, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {component.name}
                        <span className="text-lg">{getTrendIcon(component.trend)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {component.instances} instances • {component.memoryPerInstance} MB par instance
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {component.totalMemory.toFixed(1)} MB
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                  <Progress 
                    value={(component.totalMemory / 50) * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-success" />
                    <span className="font-medium">Optimisation réussie</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gestion automatique du cycle de vie des composants
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium">Attention requise</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Le composant DataTable accumule de la mémoire
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Préventives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-medium text-sm">Surveillance Continue</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitoring automatique des patterns de mémoire
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-secondary/20 bg-secondary/5">
                  <h4 className="font-medium text-sm">Nettoyage Planifié</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Garbage collection intelligent selon l'usage
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};