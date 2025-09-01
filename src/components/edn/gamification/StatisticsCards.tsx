import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Percent, Flame, TrendingUp, Clock, Target } from 'lucide-react';

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

export const StatisticsCards: React.FC = () => {
  const stats: StatCard[] = [
    {
      id: 'items-studied',
      label: 'Items Étudiés',
      value: 23,
      icon: BookOpen,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-100 to-blue-200'
    },
    {
      id: 'success-rate',
      label: 'Taux de Réussite',
      value: 87,
      suffix: '%',
      icon: Percent,
      color: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-green-100 to-green-200'
    },
    {
      id: 'streak',
      label: 'Jours de Suite',
      value: 7,
      icon: Flame,
      color: 'text-orange-600',
      bgGradient: 'bg-gradient-to-br from-orange-100 to-orange-200'
    },
    {
      id: 'average',
      label: 'Moyenne Quiz',
      value: 65,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-100 to-purple-200'
    },
    {
      id: 'study-time',
      label: 'Temps Étude',
      value: '2h45',
      icon: Clock,
      color: 'text-indigo-600',
      bgGradient: 'bg-gradient-to-br from-indigo-100 to-indigo-200'
    },
    {
      id: 'objectives',
      label: 'Objectifs Atteints',
      value: 12,
      suffix: '/15',
      icon: Target,
      color: 'text-pink-600',
      bgGradient: 'bg-gradient-to-br from-pink-100 to-pink-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card 
            key={stat.id} 
            className={`${stat.bgGradient} border-0 hover:scale-105 transition-all duration-300 cursor-pointer overflow-safe`}
          >
            <CardContent className="p-4 text-center space-y-2">
              <div className={`mx-auto w-8 h-8 rounded-full bg-white/50 flex items-center justify-center ${stat.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${stat.color} text-container break-words-force`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs text-gray-600 font-medium text-container break-words-normal">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};