import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Clock, Target, Star } from 'lucide-react';

interface Stat {
  id: string;
  label: string;
  value: number;
  target: number;
  icon: React.ComponentType<any>;
  color: string;
  suffix?: string;
  animated?: boolean;
}

export const InteractiveStats: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    {
      id: 'users',
      label: 'Étudiants actifs',
      value: 0,
      target: 2847,
      icon: Users,
      color: 'text-blue-600',
      animated: true
    },
    {
      id: 'completion',
      label: 'Taux de réussite',
      value: 0,
      target: 94,
      icon: Target,
      color: 'text-green-600',
      suffix: '%',
      animated: true
    },
    {
      id: 'time',
      label: 'Heures d\'étude',
      value: 0,
      target: 15420,
      icon: Clock,
      color: 'text-purple-600',
      suffix: 'h',
      animated: true
    },
    {
      id: 'satisfaction',
      label: 'Note moyenne',
      value: 0,
      target: 4.8,
      icon: Star,
      color: 'text-yellow-600',
      suffix: '/5',
      animated: true
    }
  ]);

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      if (!stat.animated) return null;
      
      return setTimeout(() => {
        const interval = setInterval(() => {
          setStats(prevStats =>
            prevStats.map(s =>
              s.id === stat.id
                ? { ...s, value: Math.min(s.value + Math.ceil(s.target / 100), s.target) }
                : s
            )
          );
        }, 50);

        setTimeout(() => clearInterval(interval), 2000);
      }, index * 200);
    });

    return () => {
      intervals.forEach(interval => {
        if (interval) clearTimeout(interval);
      });
    };
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const progress = (stat.value / stat.target) * 100;
        
        return (
          <Card 
            key={stat.id}
            className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40"
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-xs text-white/70">{stat.label}</div>
                
                {stat.animated && (
                  <Progress 
                    value={progress} 
                    className="h-1 bg-white/20"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};