import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Gauge, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

/**
 * Moniteur de Performance en Temps Réel (Composant Léger)
 */
interface PerformanceMonitorProps {
  isMinimal?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isMinimal = true }) => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 45,
    loadTime: 1200,
    bundleSize: 2.3,
    renderTime: 16,
    networkLatency: 89
  });

  const [isOptimal, setIsOptimal] = useState(true);

  // Surveiller les performances
  useEffect(() => {
    let frameId;
    let lastTime = performance.now();
    let frameCount = 0;

    const measurePerformance = () => {
      frameCount++;
      
      if (frameCount % 60 === 0) { // Mettre à jour chaque seconde
        const currentTime = performance.now();
        const fps = Math.round(1000 / ((currentTime - lastTime) / 60));
        
        // Simuler d'autres métriques (en production, utiliser de vraies APIs)
        const memory = Math.round(45 + Math.random() * 20);
        const networkLatency = Math.round(80 + Math.random() * 40);
        
        setMetrics(prev => ({
          ...prev,
          fps: Math.min(fps, 60),
          memory,
          networkLatency
        }));
        
        // Détecter les problèmes de performance
        setIsOptimal(fps > 45 && memory < 80 && networkLatency < 200);
        
        lastTime = currentTime;
      }
      
      frameId = requestAnimationFrame(measurePerformance);
    };

    frameId = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  if (isMinimal) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Card className="medical-card shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isOptimal ? 'bg-success' : 'bg-warning'
              }`} />
              <span className="text-xs font-medium">
                {metrics.fps} FPS
              </span>
              <Badge variant="outline" className="text-xs">
                {metrics.memory}% RAM
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          Performance Monitor
          {!isOptimal && (
            <AlertTriangle className="w-4 h-4 text-warning" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* FPS */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <Gauge className="w-3 h-3" />
              FPS
            </span>
            <span className={`font-mono ${metrics.fps > 45 ? 'text-success' : 'text-warning'}`}>
              {metrics.fps}
            </span>
          </div>
          <Progress value={(metrics.fps / 60) * 100} className="h-1" />
        </div>

        {/* Mémoire */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              Mémoire
            </span>
            <span className={`font-mono ${metrics.memory < 70 ? 'text-success' : 'text-warning'}`}>
              {metrics.memory}%
            </span>
          </div>
          <Progress value={metrics.memory} className="h-1" />
        </div>

        {/* Réseau */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <Wifi className="w-3 h-3" />
              Latence
            </span>
            <span className={`font-mono ${metrics.networkLatency < 150 ? 'text-success' : 'text-warning'}`}>
              {metrics.networkLatency}ms
            </span>
          </div>
        </div>

        {/* Bundle Size */}
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2">
            <HardDrive className="w-3 h-3" />
            Bundle
          </span>
          <span className="font-mono text-success">
            {metrics.bundleSize}MB
          </span>
        </div>

        {/* Statut Global */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">État</span>
            <Badge className={isOptimal ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
              {isOptimal ? 'Optimal' : 'Attention'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;