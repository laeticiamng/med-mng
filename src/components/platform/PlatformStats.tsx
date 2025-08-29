import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Music, 
  BookOpen, 
  TrendingUp, 
  Activity,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export const PlatformStats: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      label: "Utilisateurs actifs",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      trend: 'up'
    },
    {
      label: "Musiques générées",
      value: "2,847",
      change: "+24%", 
      icon: Music,
      color: "text-purple-600",
      trend: 'up'
    },
    {
      label: "Items EDN étudiés",
      value: "367",
      change: "100%",
      icon: BookOpen,
      color: "text-green-600",
      trend: 'stable'
    },
    {
      label: "Temps d'apprentissage",
      value: "4.2h",
      change: "+18%",
      icon: Clock,
      color: "text-orange-600",
      trend: 'up'
    },
    {
      label: "Taux de réussite",
      value: "87%",
      change: "+5%",
      icon: Target,
      color: "text-indigo-600",
      trend: 'up'
    },
    {
      label: "Sessions aujourd'hui",
      value: "156",
      change: "+8%",
      icon: Activity,
      color: "text-pink-600",
      trend: 'up'
    }
  ]);

  // Simulation de mise à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => {
        if (stat.label === "Sessions aujourd'hui") {
          return {
            ...stat,
            value: parseInt(stat.value as string) + Math.floor(Math.random() * 3)
          };
        }
        return stat;
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return <Zap className="h-3 w-3 text-yellow-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 group hover:shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-white/10 backdrop-blur-sm border-white/20 text-white/80"
                    >
                      <div className="flex items-center gap-1">
                        {getTrendIcon(stat.trend)}
                        {stat.change}
                      </div>
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white/80">
                    {stat.label}
                  </h3>
                  <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">
                    {stat.value}
                  </p>
                </div>

                {/* Progress bar simulée pour certaines métriques */}
                {stat.label.includes('Taux') && (
                  <div className="mt-4">
                    <Progress 
                      value={parseInt(stat.value as string)} 
                      className="h-2" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};