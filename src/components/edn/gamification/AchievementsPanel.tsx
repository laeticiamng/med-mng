import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle, Music, Target, Calendar, Star, Award, Book } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'study' | 'music' | 'streak' | 'score';
}

export const AchievementsPanel: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: 'first-step',
      title: 'Premier Pas',
      description: 'Étudier votre premier item EDN',
      icon: Book,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      category: 'study'
    },
    {
      id: 'music-lover',
      title: 'Mélomane Médical',
      description: 'Générer 10 paroles musicales',
      icon: Music,
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      category: 'music'
    },
    {
      id: 'weekly-warrior',
      title: 'Guerrier Hebdomadaire',
      description: 'Étudier 7 jours consécutifs',
      icon: Calendar,
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'score-master',
      title: 'Maître du Score',
      description: 'Obtenir 90% de moyenne',
      icon: Trophy,
      unlocked: false,
      progress: 87,
      maxProgress: 90,
      category: 'score'
    },
    {
      id: 'explorer',
      title: 'Explorateur EDN',
      description: 'Visiter 50 items différents',
      icon: Target,
      unlocked: false,
      progress: 23,
      maxProgress: 50,
      category: 'study'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionniste',
      description: 'Obtenir 100% sur 5 quiz',
      icon: Star,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      category: 'score'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-500';
      case 'music': return 'bg-pink-500';
      case 'streak': return 'bg-green-500';
      case 'score': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-600';
      case 'music': return 'bg-pink-600';
      case 'streak': return 'bg-green-600';
      case 'score': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 overflow-safe">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-container break-words-force">
            <Trophy className="h-6 w-6 text-yellow-300" />
            Succès Débloqués
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-safe">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
            
            return (
              <Card 
                key={achievement.id} 
                className={`${
                  achievement.unlocked 
                    ? 'bg-white/20 border-white/30' 
                    : 'bg-white/10 border-white/20'
                } backdrop-blur-sm overflow-safe`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-safe">
                        <h4 className={`font-semibold text-container break-words-force ${
                          achievement.unlocked ? 'text-yellow-200' : 'text-white'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-white/70 text-container break-words-normal">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={achievement.unlocked ? 'default' : 'secondary'}
                      className={achievement.unlocked 
                        ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600' 
                        : 'bg-white/20 text-white'
                      }
                    >
                      {achievement.unlocked ? 'Débloqué' : 'En cours'}
                    </Badge>
                  </div>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/80">
                        <span>Progression</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(achievement.category)} transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {achievement.unlocked && (
                    <div className="flex items-center gap-1 text-yellow-200 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Succès accompli !</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};