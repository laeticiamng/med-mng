import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Flag,
  CheckCircle,
  Lock,
  Gift
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: {
    type: 'xp' | 'badge' | 'feature';
    value: string | number;
  };
  completed: boolean;
}

interface ProgressMilestoneProps {
  currentProgress: number;
  milestones: Milestone[];
  className?: string;
  label?: string;
}

export const ProgressMilestone: React.FC<ProgressMilestoneProps> = ({
  currentProgress,
  milestones,
  className = '',
  label = 'Items maîtrisés'
}) => {
  // Trier les milestones par target
  const sortedMilestones = [...milestones].sort((a, b) => a.target - b.target);
  
  // Trouver le prochain milestone
  const nextMilestone = sortedMilestones.find(m => !m.completed);
  const completedCount = sortedMilestones.filter(m => m.completed).length;
  
  // Calculer le pourcentage global
  const maxTarget = sortedMilestones[sortedMilestones.length - 1]?.target || 100;
  const overallProgress = Math.min((currentProgress / maxTarget) * 100, 100);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'xp': return <Star className="h-3 w-3" />;
      case 'badge': return <Trophy className="h-3 w-3" />;
      case 'feature': return <Gift className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const formatReward = (reward: Milestone['reward']) => {
    switch (reward.type) {
      case 'xp': return `+${reward.value} XP`;
      case 'badge': return reward.value;
      case 'feature': return reward.value;
      default: return reward.value;
    }
  };

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-medium">Milestones</span>
          </div>
          <Badge variant="outline">
            {completedCount}/{sortedMilestones.length} complétés
          </Badge>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold text-primary">{currentProgress}</span>
          </div>
          <div className="relative">
            <Progress value={overallProgress} className="h-3" />
            
            {/* Milestone markers */}
            {sortedMilestones.map((milestone) => {
              const position = (milestone.target / maxTarget) * 100;
              return (
                <div
                  key={milestone.id}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div 
                    className={`
                      w-4 h-4 rounded-full border-2 -ml-2
                      ${milestone.completed 
                        ? 'bg-success border-success' 
                        : currentProgress >= milestone.target 
                        ? 'bg-primary border-primary'
                        : 'bg-muted border-border'
                      }
                    `}
                  >
                    {milestone.completed && (
                      <CheckCircle className="h-3 w-3 text-white m-auto mt-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next milestone highlight */}
        {nextMilestone && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Prochain objectif</span>
              </div>
              <Badge variant="secondary" className="gap-1">
                {getRewardIcon(nextMilestone.reward.type)}
                {formatReward(nextMilestone.reward)}
              </Badge>
            </div>
            <p className="text-sm font-medium">{nextMilestone.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{nextMilestone.description}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{currentProgress} / {nextMilestone.target}</span>
                <span>{Math.round((currentProgress / nextMilestone.target) * 100)}%</span>
              </div>
              <Progress 
                value={(currentProgress / nextMilestone.target) * 100} 
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Milestones list */}
        <div className="space-y-2">
          {sortedMilestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-colors
                ${milestone.completed 
                  ? 'bg-success/10 border-success/20' 
                  : currentProgress >= milestone.target * 0.8
                  ? 'bg-warning/10 border-warning/20'
                  : 'bg-muted/30 border-border/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {milestone.completed ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : currentProgress >= milestone.target * 0.8 ? (
                  <Target className="h-5 w-5 text-warning" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className={`font-medium text-sm ${milestone.completed ? 'text-success' : ''}`}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {milestone.target} {label.toLowerCase()}
                  </p>
                </div>
              </div>
              <Badge 
                variant={milestone.completed ? "default" : "outline"}
                className={`gap-1 ${milestone.completed ? 'bg-success' : ''}`}
              >
                {getRewardIcon(milestone.reward.type)}
                {formatReward(milestone.reward)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressMilestone;
