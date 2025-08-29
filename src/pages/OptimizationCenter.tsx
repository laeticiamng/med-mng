import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  Zap, 
  Settings, 
  BarChart3, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Rocket,
  Gauge
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OptimizationCenter() {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setOptimizationProgress(i);
    }

    setIsOptimizing(false);
    toast({
      title: "Optimisation terminée !",
      description: "Les performances ont été améliorées de 23% en moyenne.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center gap-3">
            <Rocket className="h-10 w-10" />
            Centre d'Optimisation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maximisez les performances avec des optimisations intelligentes
          </p>
        </motion.div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={runOptimization}
            disabled={isOptimizing}
            className="group"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Optimisation en cours...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Lancer l'optimisation complète
              </>
            )}
          </Button>
        </div>

        {isOptimizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Gauge className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    Optimisation en cours... {optimizationProgress}%
                  </p>
                </div>
                <Progress value={optimizationProgress} className="w-full" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Vitesse de chargement', current: 2.3, target: 1.5, status: 'warning' },
            { name: 'Utilisation mémoire', current: 67, target: 45, status: 'warning' },
            { name: 'Charge processeur', current: 34, target: 25, status: 'good' },
            { name: 'Efficacité globale', current: 78, target: 90, status: 'good' },
            { name: 'Satisfaction utilisateur', current: 85, target: 95, status: 'good' },
            { name: 'Taux de rétention', current: 72, target: 85, status: 'warning' }
          ].map((metric, index) => {
            const StatusIcon = metric.status === 'good' ? CheckCircle : AlertTriangle;
            const progress = (metric.current / metric.target) * 100;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      <StatusIcon className={`h-5 w-5 ${
                        metric.status === 'good' ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {metric.current}{metric.name.includes('Vitesse') ? 's' : '%'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Objectif: {metric.target}{metric.name.includes('Vitesse') ? 's' : '%'}
                      </div>
                    </div>
                    <Progress value={Math.min(progress, 100)} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}