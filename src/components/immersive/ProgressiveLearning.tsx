import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Star, TrendingUp, Brain } from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface ProgressiveLearningProps {
  steps: LearningStep[];
  onStepClick?: (step: LearningStep) => void;
  currentStep?: string;
  className?: string;
}

export const ProgressiveLearning: React.FC<ProgressiveLearningProps> = ({
  steps,
  onStepClick,
  currentStep,
  className = ''
}) => {
  const [completedSteps, setCompletedSteps] = useState(
    steps.filter(step => step.status === 'completed').length
  );
  const [totalPoints, setTotalPoints] = useState(
    steps.filter(step => step.status === 'completed').reduce((acc, step) => acc + step.points, 0)
  );

  const progressPercentage = (completedSteps / steps.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-400 animate-pulse" />;
      case 'locked':
        return <Circle className="h-5 w-5 text-gray-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Overview */}
      <ImmersiveCard variant="gradient" glow="purple" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Parcours d'Apprentissage
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">{totalPoints} points</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progression</span>
              <span className="text-white font-medium">{completedSteps}/{steps.length} étapes</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/10"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{completedSteps}</div>
              <div className="text-xs text-gray-400">Complétées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {steps.filter(s => s.status === 'current').length}
              </div>
              <div className="text-xs text-gray-400">En cours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {steps.filter(s => s.status === 'locked').length}
              </div>
              <div className="text-xs text-gray-400">Verrouillées</div>
            </div>
          </div>
        </div>
      </ImmersiveCard>

      {/* Learning Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <ImmersiveCard
            key={step.id}
            variant="glass"
            hover={step.status !== 'locked'}
            glow={step.status === 'current' ? 'blue' : step.status === 'completed' ? 'green' : 'purple'}
            className={`transition-all duration-300 ${
              step.status === 'locked' 
                ? 'opacity-60 cursor-not-allowed' 
                : 'cursor-pointer hover:shadow-lg'
            } ${currentStep === step.id ? 'ring-2 ring-blue-400/50' : ''}`}
            onClick={() => step.status !== 'locked' && onStepClick?.(step)}
          >
            <div className="flex items-start gap-4">
              {/* Step Number & Status */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'completed' 
                    ? 'bg-green-500/20 border-green-400' 
                    : step.status === 'current'
                    ? 'bg-blue-500/20 border-blue-400'
                    : 'bg-gray-500/20 border-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <span className={`text-sm font-bold ${
                      step.status === 'current' ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-8 ${
                    step.status === 'completed' ? 'bg-green-400/50' : 'bg-gray-600/50'
                  }`} />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-lg font-semibold text-white truncate">
                    {step.title}
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                      {step.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3" />
                      <span className="text-xs">{step.points}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {step.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{step.estimatedTime} min</span>
                  </div>

                  {step.status !== 'locked' && (
                    <Button
                      size="sm"
                      variant={step.status === 'current' ? 'default' : 'outline'}
                      className={step.status === 'current' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onStepClick?.(step);
                      }}
                    >
                      {step.status === 'completed' ? 'Revoir' : step.status === 'current' ? 'Continuer' : 'Commencer'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ImmersiveCard>
        ))}
      </div>
    </div>
  );
};