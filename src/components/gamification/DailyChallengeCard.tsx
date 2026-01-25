import { useAuth } from '@/components/med-mng/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import {
    CheckCircle,
    Clock,
    Gift,
    RefreshCw,
    Star,
    Trophy,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DailyChallengeCardProps {
  className?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'study' | 'music' | 'streak';
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

const DAILY_CHALLENGES: Omit<Challenge, 'id' | 'current' | 'completed'>[] = [
  {
    title: 'Quiz Express',
    description: 'Complète 3 quiz aujourd\'hui',
    type: 'quiz',
    target: 3,
    xpReward: 100,
  },
  {
    title: 'Session d\'étude',
    description: 'Étudie pendant 30 minutes',
    type: 'study',
    target: 30,
    xpReward: 150,
  },
  {
    title: 'Explorateur',
    description: 'Révise 5 items différents',
    type: 'study',
    target: 5,
    xpReward: 75,
  },
  {
    title: 'Mélomane médical',
    description: 'Écoute 3 chansons médicales',
    type: 'music',
    target: 3,
    xpReward: 50,
  },
  {
    title: 'Perfectionniste',
    description: 'Obtiens 100% à un quiz',
    type: 'quiz',
    target: 1,
    xpReward: 200,
  },
];

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ className = '' }) => {
  useAuth();
  const { _stats, _addPoints } = useGamification();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Générer les défis du jour (basé sur la date)
  useEffect(() => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Sélectionner 3 défis pseudo-aléatoires basés sur le jour
    const selectedIndices = [
      seed % DAILY_CHALLENGES.length,
      (seed + 1) % DAILY_CHALLENGES.length,
      (seed + 2) % DAILY_CHALLENGES.length,
    ];
    
    const todayChallenges = selectedIndices.map((index, i) => ({
      ...DAILY_CHALLENGES[index],
      id: `challenge-${i}`,
      current: 0,
      completed: false,
    }));

    setChallenges(todayChallenges);
  }, []);

  // Calculer le temps restant
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStartChallenge = useCallback((challenge: Challenge) => {
    switch (challenge.type) {
      case 'quiz':
        navigate(ROUTE_PATHS.ednComplete);
        break;
      case 'study':
        navigate(ROUTE_PATHS.ednComplete);
        break;
      case 'music':
        navigate(ROUTE_PATHS.generator);
        break;
      default:
        navigate(ROUTE_PATHS.ednComplete);
    }

    toast({
      title: `🎯 Défi commencé`,
      description: challenge.title,
    });
  }, [navigate, toast]);

  const getProgressColor = (challenge: Challenge) => {
    if (challenge.completed) return 'bg-success';
    const progress = (challenge.current / challenge.target) * 100;
    if (progress >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  const totalXP = challenges.reduce((acc, c) => c.completed ? acc + c.xpReward : acc, 0);
  const possibleXP = challenges.reduce((acc, c) => acc + c.xpReward, 0);

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Défis du jour
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </Badge>
        </div>
        <CardDescription>
          Complète les défis pour gagner des récompenses XP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-warning/10 to-primary/10 border border-warning/20">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-warning" />
            <span className="font-medium">Récompenses du jour</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalXP} / {possibleXP} XP
            </Badge>
          </div>
        </div>

        {/* Challenges list */}
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all ${
                challenge.completed 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-muted/30 border-border/50 hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {challenge.completed ? (
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className={`font-medium ${challenge.completed ? 'text-success' : 'text-foreground'}`}>
                      {challenge.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={challenge.completed ? "default" : "outline"}
                  className={challenge.completed ? "bg-success" : ""}
                >
                  +{challenge.xpReward} XP
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progression</span>
                  <span>{challenge.current} / {challenge.target}</span>
                </div>
                <Progress 
                  value={Math.min((challenge.current / challenge.target) * 100, 100)}
                  className={`h-1.5 ${getProgressColor(challenge)}`}
                />
              </div>

              {/* Action button */}
              {!challenge.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-primary hover:text-primary"
                  onClick={() => handleStartChallenge(challenge)}
                >
                  Commencer le défi →
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* All completed */}
        {challenges.every(c => c.completed) && (
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/30">
            <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-medium text-success">Tous les défis complétés !</p>
            <p className="text-xs text-success/80 mt-1">
              Reviens demain pour de nouveaux défis
            </p>
          </div>
        )}

        {/* Refresh info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Nouveaux défis chaque jour à minuit
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChallengeCard;
