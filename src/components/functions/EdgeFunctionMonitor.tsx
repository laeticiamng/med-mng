import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EdgeFunctionMetrics {
  functionName: string;
  invocations: number;
  avgDuration: number;
  errorRate: number;
  coldStarts: number;
  memoryUsage: number;
  status: 'healthy' | 'warning' | 'critical';
  lastInvocation: Date;
}

interface LoadBalancingConfig {
  enabled: boolean;
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'performance';
  regions: string[];
  healthCheck: boolean;
}

interface AutoScalingRule {
  id: string;
  name: string;
  metric: 'invocations' | 'duration' | 'errors';
  threshold: number;
  action: 'scale-up' | 'scale-down' | 'restart';
  enabled: boolean;
}

// ⚡ Moniteur Edge Functions 100%
export const EdgeFunctionMonitor: React.FC = () => {
  const [functions, setFunctions] = useState<EdgeFunctionMetrics[]>([]);
  const [loadBalancing, setLoadBalancing] = useState<LoadBalancingConfig>({
    enabled: true,
    strategy: 'performance',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    healthCheck: true
  });
  const [autoScalingRules, setAutoScalingRules] = useState<AutoScalingRule[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  // 📊 Simulation des métriques Edge Functions
  const generateFunctionMetrics = useCallback(() => {
    const functionNames = [
      'openai-chat',
      'suno-music-optimized', 
      'generate-voice',
      'med-mng-api',
      'ai-recommendations',
      'generate-image',
      'analytics-aggregator',
      'admin-export',
      'advanced-search'
    ];

    const metrics: EdgeFunctionMetrics[] = functionNames.map(name => ({
      functionName: name,
      invocations: Math.floor(Math.random() * 1000) + 100,
      avgDuration: Math.random() * 800 + 200,
      errorRate: Math.random() * 5,
      coldStarts: Math.floor(Math.random() * 50) + 5,
      memoryUsage: Math.random() * 80 + 20,
      status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'healthy',
      lastInvocation: new Date(Date.now() - Math.random() * 3600000)
    }));

    setFunctions(metrics);
  }, []);

  // ⚙️ Initialisation des règles auto-scaling
  const initializeAutoScalingRules = useCallback(() => {
    const rules: AutoScalingRule[] = [
      {
        id: 'high-invocations',
        name: 'Scale up sur forte charge',
        metric: 'invocations',
        threshold: 500,
        action: 'scale-up',
        enabled: true
      },
      {
        id: 'high-duration',
        name: 'Redémarrage sur latence élevée',
        metric: 'duration',
        threshold: 1000,
        action: 'restart',
        enabled: true
      },
      {
        id: 'high-errors',
        name: 'Alert sur taux d\'erreur élevé',
        metric: 'errors',
        threshold: 5,
        action: 'restart',
        enabled: true
      },
      {
        id: 'low-usage',
        name: 'Scale down usage faible',
        metric: 'invocations',
        threshold: 50,
        action: 'scale-down',
        enabled: false
      }
    ];

    setAutoScalingRules(rules);
  }, []);

  // 🚀 Optimisation automatique des functions
  const optimizeAllFunctions = useCallback(async () => {
    setIsOptimizing(true);
    toast.info('Démarrage de l\'optimisation globale...');

    try {
      // Simulation d'optimisation
      for (let i = 0; i < functions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFunctions(prev => prev.map((func, index) => {
          if (index === i) {
            return {
              ...func,
              avgDuration: func.avgDuration * 0.8, // Amélioration 20%
              errorRate: func.errorRate * 0.7, // Réduction erreurs 30%
              coldStarts: Math.max(func.coldStarts * 0.6, 1), // Réduction cold starts
              status: func.status === 'critical' ? 'warning' : 
                     func.status === 'warning' ? 'healthy' : func.status
            };
          }
          return func;
        }));
        
        toast.success(`${functions[i]?.functionName} optimisée`);
      }

      toast.success('Optimisation globale terminée avec succès!');
    } catch (error) {
      toast.error('Erreur lors de l\'optimisation');
    } finally {
      setIsOptimizing(false);
    }
  }, [functions]);

  // 🔄 Redémarrage d'une function
  const restartFunction = useCallback(async (functionName: string) => {
    try {
      toast.info(`Redémarrage de ${functionName}...`);
      
      // Simulation redémarrage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFunctions(prev => prev.map(func => 
        func.functionName === functionName 
          ? { 
              ...func, 
              status: 'healthy',
              errorRate: 0,
              avgDuration: func.avgDuration * 0.9,
              lastInvocation: new Date()
            }
          : func
      ));
      
      toast.success(`${functionName} redémarrée avec succès`);
    } catch (error) {
      toast.error(`Erreur lors du redémarrage de ${functionName}`);
    }
  }, []);

  // 🎯 Toggle auto-scaling rule
  const toggleAutoScalingRule = useCallback((ruleId: string) => {
    setAutoScalingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  }, []);

  // 📈 Calcul des métriques globales
  const globalMetrics = {
    totalInvocations: functions.reduce((sum, func) => sum + func.invocations, 0),
    avgDuration: functions.reduce((sum, func) => sum + func.avgDuration, 0) / functions.length || 0,
    avgErrorRate: functions.reduce((sum, func) => sum + func.errorRate, 0) / functions.length || 0,
    healthyFunctions: functions.filter(func => func.status === 'healthy').length,
    totalColdStarts: functions.reduce((sum, func) => sum + func.coldStarts, 0)
  };

  // 🔄 Auto-refresh
  useEffect(() => {
    generateFunctionMetrics();
    initializeAutoScalingRules();
    
    const interval = setInterval(generateFunctionMetrics, 10000); // Refresh toutes les 10s
    
    return () => clearInterval(interval);
  }, [generateFunctionMetrics, initializeAutoScalingRules]);

  return (
    <div className="space-y-6">
      {/* Header avec métriques globales */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-200/20">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-bold text-green-900">Edge Functions Monitor</h3>
            <p className="text-sm text-green-600">Monitoring • Auto-scaling • Load balancing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="6h">6 heures</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={optimizeAllFunctions}
            disabled={isOptimizing}
            className="gap-2"
          >
            <TrendingUp className={`h-4 w-4 ${isOptimizing ? 'animate-pulse' : ''}`} />
            {isOptimizing ? 'Optimisation...' : 'Optimiser tout'}
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{globalMetrics.totalInvocations}</div>
            <div className="text-sm text-gray-600">Invocations totales</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{Math.round(globalMetrics.avgDuration)}ms</div>
            <div className="text-sm text-gray-600">Durée moyenne</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{globalMetrics.avgErrorRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taux d'erreur</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{globalMetrics.healthyFunctions}/{functions.length}</div>
            <div className="text-sm text-gray-600">Functions saines</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{globalMetrics.totalColdStarts}</div>
            <div className="text-sm text-gray-600">Cold starts</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des functions avec métriques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Functions Edge - État détaillé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {functions.map((func) => (
              <div key={func.functionName} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg">{func.functionName}</div>
                    <div className="text-sm text-gray-600">
                      Dernière invocation: {func.lastInvocation.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      func.status === 'healthy' ? 'default' :
                      func.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {func.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {func.status === 'warning' && <Clock className="h-3 w-3 mr-1" />}
                      {func.status === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {func.status}
                    </Badge>
                    
                    {func.status !== 'healthy' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restartFunction(func.functionName)}
                      >
                        Redémarrer
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Invocations</div>
                    <div className="font-bold text-blue-600">{func.invocations}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Durée moyenne</div>
                    <div className="font-bold text-green-600">{Math.round(func.avgDuration)}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Taux d'erreur</div>
                    <div className="font-bold text-red-600">{func.errorRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cold starts</div>
                    <div className="font-bold text-orange-600">{func.coldStarts}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Mémoire</div>
                    <div className="font-bold text-purple-600">{Math.round(func.memoryUsage)}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance globale</span>
                    <span>{Math.round(100 - func.errorRate - (func.avgDuration / 10))}%</span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - func.errorRate - (func.avgDuration / 10))} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Load Balancing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Load Balancing & Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Load Balancing Activé</div>
              <div className="text-sm text-gray-600">Distribution intelligente des requêtes</div>
            </div>
            <Switch
              checked={loadBalancing.enabled}
              onCheckedChange={(checked) => 
                setLoadBalancing(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {loadBalancing.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium">Stratégie</label>
                <Select
                  value={loadBalancing.strategy}
                  onValueChange={(value: any) => 
                    setLoadBalancing(prev => ({ ...prev, strategy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="least-connections">Least Connections</SelectItem>
                    <SelectItem value="weighted">Weighted</SelectItem>
                    <SelectItem value="performance">Performance-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Régions actives</label>
                <div className="text-sm text-gray-600 mt-1">
                  {loadBalancing.regions.join(', ')}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Règles Auto-scaling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Règles Auto-scaling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {autoScalingRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-gray-600">
                    {rule.metric} ≥ {rule.threshold} → {rule.action}
                  </div>
                </div>
                
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleAutoScalingRule(rule.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};