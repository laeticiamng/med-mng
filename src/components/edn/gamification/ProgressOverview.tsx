import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Award, BookOpen } from 'lucide-react';

interface ProgressMetric {
  id: string;
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}

export const ProgressOverview: React.FC = () => {
  const metrics: ProgressMetric[] = [
    {
      id: 'daily-goal',
      label: 'Objectif Quotidien',
      current: 3,
      max: 5,
      unit: 'items',
      color: 'bg-blue-500',
      icon: Calendar
    },
    {
      id: 'weekly-goal',
      label: 'Objectif Hebdomadaire',
      current: 15,
      max: 25,
      unit: 'items',
      color: 'bg-green-500',
      icon: TrendingUp
    },
    {
      id: 'monthly-goal',
      label: 'Objectif Mensuel',
      current: 67,
      max: 100,
      unit: 'items',
      color: 'bg-purple-500',
      icon: BookOpen
    },
    {
      id: 'edn-completion',
      label: 'Complétion EDN',
      current: 23,
      max: 367,
      unit: 'items',
      color: 'bg-orange-500',
      icon: Award
    }
  ];

  return (
    <Card className="overflow-safe">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-container break-words-force">
          <TrendingUp className="h-5 w-5 text-primary" />
          Aperçu des Progrès
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          const percentage = Math.round((metric.current / metric.max) * 100);
          const isCompleted = metric.current >= metric.max;
          
          return (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-container break-words-force">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {metric.current}/{metric.max} {metric.unit}
                  </span>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      ✓ Complété
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage}% complété</span>
                  <span>
                    {metric.max - metric.current > 0 
                      ? `${metric.max - metric.current} restants` 
                      : 'Objectif atteint !'
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};