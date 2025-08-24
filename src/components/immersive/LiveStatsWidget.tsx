import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Music, TrendingUp, Globe, Zap, Brain } from 'lucide-react';

interface LiveStat {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
  change?: number;
}

export const LiveStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<LiveStat[]>([
    { label: 'Étudiants actifs', value: 2847, icon: Users, color: 'text-blue-400', change: 12 },
    { label: 'Musiques générées', value: 15634, icon: Music, color: 'text-purple-400', change: 8 },
    { label: 'Taux de réussite', value: 94, icon: TrendingUp, color: 'text-green-400', unit: '%', change: 2 },
    { label: 'Pays actifs', value: 47, icon: Globe, color: 'text-yellow-400', change: 1 },
    { label: 'Score moyen IA', value: 96, icon: Brain, color: 'text-pink-400', unit: '%', change: 1 },
    { label: 'Génération/min', value: 23, icon: Zap, color: 'text-cyan-400', change: 5 }
  ]);

  // Simulation des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.value + Math.floor(Math.random() * 5),
          change: Math.floor(Math.random() * 10) - 3
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-black/20 backdrop-blur-xl border border-white/10 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {stat.value.toLocaleString()}{stat.unit || ''}
              </div>
              <div className="text-xs text-white/70 mb-2">{stat.label}</div>
              {stat.change !== undefined && (
                <Badge 
                  className={`text-xs ${
                    stat.change > 0 
                      ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                      : stat.change < 0
                      ? 'bg-red-500/20 text-red-400 border-red-400/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-400/30'
                  }`}
                >
                  {stat.change > 0 ? '+' : ''}{stat.change}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};