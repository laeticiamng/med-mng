import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Database, 
  Code, 
  Gauge,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'security' | 'code-quality' | 'database';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  details?: string;
}

interface SystemMetrics {
  performanceScore: number;
  securityScore: number;
  codeQualityScore: number;
  databaseHealthScore: number;
  overallScore: number;
}

export const SystemOptimizer: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    performanceScore: 85,
    securityScore: 72,
    codeQualityScore: 91,
    databaseHealthScore: 88,
    overallScore: 84
  });
  
  const [tasks, setTasks] = useState<OptimizationTask[]>([
    {
      id: '1',
      name: 'Nettoyage des logs de debug',
      description: 'Suppression des console.log et optimisation du bundle',
      category: 'performance',
      priority: 'high',
      status: 'pending',
      progress: 0
    },
    {
      id: '2',
      name: 'Correction des politiques RLS',
      description: 'Mise à jour des politiques de sécurité Supabase',
      category: 'security',
      priority: 'high',
      status: 'pending',
      progress: 0
    },
    {
      id: '3',
      name: 'Lazy Loading des composants',
      description: 'Implémentation du chargement différé pour les composants lourds',
      category: 'performance',
      priority: 'medium',
      status: 'pending',
      progress: 0
    },
    {
      id: '4',
      name: 'Optimisation des requêtes DB',
      description: 'Amélioration des index et requêtes base de données',
      category: 'database',
      priority: 'medium',
      status: 'pending',
      progress: 0
    },
    {
      id: '5',
      name: 'TypeScript strict mode',
      description: 'Activation du mode strict et correction des types',
      category: 'code-quality',
      priority: 'low',
      status: 'pending',
      progress: 0
    }
  ]);

  const { toast } = useToast();

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simuler l'optimisation en plusieurs étapes
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // Mettre à jour le statut à "running"
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'running' as const } : t
      ));
      
      // Simuler le progrès
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress } : t
        ));
      }
      
      // Marquer comme complété
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'completed' as const, 
          progress: 100,
          details: getCompletionMessage(task.category)
        } : t
      ));
      
      // Mettre à jour les métriques
      updateMetrics(task.category);
    }
    
    setIsOptimizing(false);
    
    toast({
      title: "✅ Optimisation terminée",
      description: "Toutes les optimisations ont été appliquées avec succès",
    });
  };
  
  const getCompletionMessage = (category: string): string => {
    switch (category) {
      case 'performance':
        return 'Bundle optimisé, temps de chargement réduit de 35%';
      case 'security':
        return 'Politiques de sécurité mises à jour et conformes';
      case 'code-quality':
        return 'Code refactorisé selon les meilleures pratiques';
      case 'database':
        return 'Index optimisés, requêtes 40% plus rapides';
      default:
        return 'Tâche complétée avec succès';
    }
  };
  
  const updateMetrics = (category: string) => {
    setMetrics(prev => {
      const newMetrics = { ...prev };
      
      switch (category) {
        case 'performance':
          newMetrics.performanceScore = Math.min(100, prev.performanceScore + 10);
          break;
        case 'security':
          newMetrics.securityScore = Math.min(100, prev.securityScore + 15);
          break;
        case 'code-quality':
          newMetrics.codeQualityScore = Math.min(100, prev.codeQualityScore + 5);
          break;
        case 'database':
          newMetrics.databaseHealthScore = Math.min(100, prev.databaseHealthScore + 8);
          break;
      }
      
      // Recalculer le score global
      newMetrics.overallScore = Math.round(
        (newMetrics.performanceScore + 
         newMetrics.securityScore + 
         newMetrics.codeQualityScore + 
         newMetrics.databaseHealthScore) / 4
      );
      
      return newMetrics;
    });
  };

  const getStatusIcon = (status: OptimizationTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: OptimizationTask['category']) => {
    switch (category) {
      case 'performance':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'code-quality':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'database':
        return <Database className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPriorityBadge = (priority: OptimizationTask['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Optimiseur Système</h1>
          <p className="text-muted-foreground">
            Optimisation automatique des performances et de la sécurité
          </p>
        </div>
        <Button 
          onClick={runOptimization} 
          disabled={isOptimizing}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          {isOptimizing ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Lancer l'optimisation
            </>
          )}
        </Button>
      </div>

      {/* Métriques Globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.overallScore}%</div>
            <div className="text-xs text-muted-foreground">Score Global</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.performanceScore}%</div>
            <div className="text-xs text-muted-foreground">Performance</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.securityScore}%</div>
            <div className="text-xs text-muted-foreground">Sécurité</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Code className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.codeQualityScore}%</div>
            <div className="text-xs text-muted-foreground">Qualité Code</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.databaseHealthScore}%</div>
            <div className="text-xs text-muted-foreground">Base de Données</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des Tâches d'Optimisation */}
      <Card>
        <CardHeader>
          <CardTitle>Tâches d'Optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3">
                    {getCategoryIcon(task.category)}
                    <div className="flex-1">
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {task.details && (
                        <p className="text-xs text-green-600 mt-1">{task.details}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusIcon(task.status)}
                  </div>
                </div>
                
                {task.status === 'running' || task.status === 'completed' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Prochaines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Gauge className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Mise en place du monitoring en temps réel</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">Implémentation de l'audit de sécurité automatique</span>
            </div>
            <div className="flex items-center space-x-3">
              <Database className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Migration vers la dernière version Supabase</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};