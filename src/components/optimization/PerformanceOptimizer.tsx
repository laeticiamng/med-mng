import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Monitor, 
  Wifi, 
  HardDrive, 
  Cpu, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  networkSpeed: number;
  batteryLevel?: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  optimizationScore: number;
}

interface OptimizationSuggestion {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  autoFix: boolean;
  action?: () => void;
}

export const PerformanceOptimizer = memo(() => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 45,
    loadTime: 1.2,
    networkSpeed: 25.5,
    deviceType: 'desktop',
    optimizationScore: 85
  });
  
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);

  // Détection intelligente du type d'appareil
  const detectDevice = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (width < 768 || /mobile|android|iphone/.test(userAgent)) return 'mobile';
    if (width < 1024 || /tablet|ipad/.test(userAgent)) return 'tablet';
    return 'desktop';
  }, []);

  // Mesure des performances en temps réel
  const measurePerformance = useCallback(() => {
    const start = performance.now();
    
    // Mesure FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Mesure mémoire
    if ('memory' in performance) {
      const memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
      setMetrics(prev => ({ ...prev, memory }));
    }

    // Mesure vitesse réseau
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const networkSpeed = connection.downlink || 10;
      setMetrics(prev => ({ ...prev, networkSpeed }));
    }

    // Détection du type d'appareil
    const deviceType = detectDevice();
    
    // Batterie (si disponible)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setMetrics(prev => ({ 
          ...prev, 
          batteryLevel: Math.round(battery.level * 100),
          deviceType 
        }));
      });
    } else {
      setMetrics(prev => ({ ...prev, deviceType }));
    }

    const loadTime = performance.now() - start;
    setMetrics(prev => ({ ...prev, loadTime: loadTime / 1000 }));
  }, [detectDevice]);

  // Génération de suggestions d'optimisation
  const generateSuggestions = useCallback(() => {
    const newSuggestions: OptimizationSuggestion[] = [];

    if (metrics.fps < 30) {
      newSuggestions.push({
        type: 'critical',
        title: 'FPS faible détecté',
        description: 'Réduire les animations complexes pour améliorer la fluidité',
        impact: 'high',
        autoFix: true,
        action: () => {
          document.documentElement.style.setProperty('--animation-duration', '0.1s');
          toast({
            title: "⚡ Optimisation appliquée",
            description: "Animations réduites pour améliorer les performances"
          });
        }
      });
    }

    if (metrics.memory > 100) {
      newSuggestions.push({
        type: 'warning',
        title: 'Utilisation mémoire élevée',
        description: 'Nettoyer les ressources inutilisées',
        impact: 'medium',
        autoFix: true,
        action: () => {
          // Nettoyage des caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                if (name.includes('old')) caches.delete(name);
              });
            });
          }
          toast({
            title: "🧹 Mémoire optimisée",
            description: "Caches obsolètes supprimés"
          });
        }
      });
    }

    if (metrics.networkSpeed < 5) {
      newSuggestions.push({
        type: 'warning',
        title: 'Connexion lente détectée',
        description: 'Activer le mode économique pour une meilleure expérience',
        impact: 'high',
        autoFix: true,
        action: () => {
          document.body.classList.add('low-bandwidth-mode');
          toast({
            title: "📡 Mode économique activé",
            description: "Interface adaptée pour connexion lente"
          });
        }
      });
    }

    if (metrics.deviceType === 'mobile' && metrics.batteryLevel && metrics.batteryLevel < 20) {
      newSuggestions.push({
        type: 'critical',
        title: 'Batterie faible',
        description: 'Activer le mode économie d\'énergie',
        impact: 'high',
        autoFix: true,
        action: () => {
          document.body.classList.add('battery-saver-mode');
          toast({
            title: "🔋 Mode économie d'énergie",
            description: "Fonctionnalités non-essentielles réduites"
          });
        }
      });
    }

    setSuggestions(newSuggestions);
  }, [metrics, toast]);

  // Optimisation automatique
  const runAutoOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    // Appliquer les corrections automatiques
    const autoFixSuggestions = suggestions.filter(s => s.autoFix);
    
    for (const suggestion of autoFixSuggestions) {
      if (suggestion.action) {
        suggestion.action();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Recalculer le score d'optimisation
    const newScore = Math.min(100, metrics.optimizationScore + autoFixSuggestions.length * 5);
    setMetrics(prev => ({ ...prev, optimizationScore: newScore }));
    
    setIsOptimizing(false);
    
    toast({
      title: "🚀 Optimisation terminée",
      description: `Score d'optimisation: ${newScore}%`
    });
  }, [suggestions, metrics.optimizationScore, toast]);

  useEffect(() => {
    measurePerformance();
    const interval = setInterval(measurePerformance, 2000);
    
    return () => clearInterval(interval);
  }, [measurePerformance]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  useEffect(() => {
    if (autoOptimizationEnabled && suggestions.some(s => s.autoFix && s.type === 'critical')) {
      runAutoOptimization();
    }
  }, [suggestions, autoOptimizationEnabled, runAutoOptimization]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Laptop;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Score d'optimisation global */}
      <Card className="bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Optimisation des Performances
            </CardTitle>
            <Badge 
              variant={metrics.optimizationScore >= 80 ? "default" : "destructive"}
              className="text-lg px-3 py-1"
            >
              {metrics.optimizationScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={metrics.optimizationScore} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Performance globale</span>
            <span className={getScoreColor(metrics.optimizationScore)}>
              {metrics.optimizationScore >= 80 ? 'Excellent' : 
               metrics.optimizationScore >= 60 ? 'Bon' : 'À améliorer'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Monitor className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{metrics.fps}</div>
            <div className="text-sm text-muted-foreground">FPS</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <HardDrive className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{metrics.memory}</div>
            <div className="text-sm text-muted-foreground">MB Mémoire</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Wifi className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{metrics.networkSpeed.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Mbps</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            {React.createElement(getDeviceIcon(metrics.deviceType), { 
              className: "h-8 w-8 text-purple-500 mx-auto mb-2" 
            })}
            <div className="text-lg font-bold capitalize">{metrics.deviceType}</div>
            {metrics.batteryLevel && (
              <div className="text-sm text-muted-foreground">{metrics.batteryLevel}% Batterie</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions d'optimisation */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Suggestions d'Optimisation ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const IconComponent = suggestion.type === 'critical' ? AlertTriangle : 
                                  suggestion.type === 'warning' ? AlertTriangle : CheckCircle;
              const iconColor = suggestion.type === 'critical' ? 'text-red-500' : 
                               suggestion.type === 'warning' ? 'text-yellow-500' : 'text-green-500';
              
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{suggestion.description}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Impact {suggestion.impact}
                      </Badge>
                      {suggestion.autoFix && (
                        <Badge variant="secondary" className="text-xs">
                          Correction auto
                        </Badge>
                      )}
                    </div>
                  </div>
                  {suggestion.action && (
                    <Button 
                      size="sm" 
                      onClick={suggestion.action}
                      className="shrink-0"
                    >
                      Corriger
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Contrôles d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contrôles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Optimisation Automatique</div>
              <div className="text-sm text-muted-foreground">
                Applique automatiquement les corrections critiques
              </div>
            </div>
            <Button
              variant={autoOptimizationEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoOptimizationEnabled(!autoOptimizationEnabled)}
            >
              {autoOptimizationEnabled ? 'Activée' : 'Désactivée'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={runAutoOptimization}
              disabled={isOptimizing}
              className="flex-1"
            >
              {isOptimizing ? (
                <>
                  <Cpu className="h-4 w-4 mr-2 animate-spin" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimiser Maintenant
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={measurePerformance}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Analyser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';