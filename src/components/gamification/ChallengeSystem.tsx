import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  Star,
  Flame,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  target: number;
  reward: {
    xp: number;
    badges?: string[];
    special?: string;
  };
  timeLeft: string;
  isCompleted: boolean;
  icon: React.ElementType;
}

export const ChallengeSystem: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Perfectionniste Quotidien',
      description: 'Obtenez 3 scores parfaits (100%) aujourd\'hui',
      type: 'daily',
      difficulty: 'hard',
      progress: 2,
      target: 3,
      reward: { xp: 100, badges: ['Perfectionniste'] },
      timeLeft: '4h 23m',
      isCompleted: false,
      icon: Target
    },
    {
      id: '2',
      title: 'Marathon d\'Étude',
      description: 'Étudiez pendant 2 heures consécutives',
      type: 'daily',
      difficulty: 'medium',
      progress: 87,
      target: 120,
      reward: { xp: 75 },
      timeLeft: '4h 23m',
      isCompleted: false,
      icon: Clock
    },
    {
      id: '3',
      title: 'Maître de Spécialité',
      description: 'Complétez 10 items de cardiologie cette semaine',
      type: 'weekly',
      difficulty: 'medium',
      progress: 7,
      target: 10,
      reward: { xp: 250, badges: ['Expert Cardio'] },
      timeLeft: '2j 14h',
      isCompleted: false,
      icon: Trophy
    },
    {
      id: '4',
      title: 'Régularité Parfaite',
      description: 'Connectez-vous 7 jours d\'affilée',
      type: 'weekly',
      difficulty: 'easy',
      progress: 5,
      target: 7,
      reward: { xp: 150 },
      timeLeft: '2j 14h',
      isCompleted: false,
      icon: Calendar
    },
    {
      id: '5',
      title: 'Champion du Mois',
      description: 'Terminez dans le top 10 du classement mensuel',
      type: 'monthly',
      difficulty: 'hard',
      progress: 15,
      target: 10,
      reward: { xp: 500, special: 'Accès VIP 1 mois' },
      timeLeft: '12j 5h',
      isCompleted: false,
      icon: Star
    },
    {
      id: '6',
      title: 'Générateur Musical',
      description: 'Créez 20 musiques d\'étude ce mois-ci',
      type: 'monthly',
      difficulty: 'medium',
      progress: 13,
      target: 20,
      reward: { xp: 300, badges: ['Compositeur'] },
      timeLeft: '12j 5h',
      isCompleted: false,
      icon: Zap
    }
  ];

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-destructive';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return Clock;
      case 'weekly': return Calendar;
      case 'monthly': return TrendingUp;
      case 'special': return Award;
    }
  };

  const filteredChallenges = activeFilter === 'all' 
    ? challenges 
    : challenges.filter(c => c.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Défis Actifs
          </h2>
          <p className="text-muted-foreground">
            Relevez des défis pour gagner de l'XP et des récompenses
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter === 'all' ? 'Tous' : filter === 'daily' ? 'Quotidien' : filter === 'weekly' ? 'Hebdo' : 'Mensuel'}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <p className="text-lg font-bold">12</p>
            <p className="text-xs text-muted-foreground">Complétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-bold">6</p>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-warning/10 dark:bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-warning" />
            </div>
            <p className="text-lg font-bold">5</p>
            <p className="text-xs text-muted-foreground">Série actuelle</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <p className="text-lg font-bold">1,847</p>
            <p className="text-xs text-muted-foreground">XP gagnés</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des défis */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge) => {
          const TypeIcon = getTypeIcon(challenge.type);
          const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);
          
          return (
            <Card key={challenge.id} className={`${challenge.isCompleted ? 'border-success bg-success/5 dark:bg-success/10' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <challenge.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                      <CardDescription className="text-sm">{challenge.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {challenge.type === 'daily' ? 'Quotidien' : 
                       challenge.type === 'weekly' ? 'Hebdo' : 
                       challenge.type === 'monthly' ? 'Mensuel' : 'Spécial'}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${getDifficultyColor(challenge.difficulty)}`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{challenge.progress}/{challenge.target}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Récompenses */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Récompenses :</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.reward.xp} XP
                    </Badge>
                    {challenge.reward.badges?.map((badge) => (
                      <Badge key={badge} variant="outline" className="text-xs">
                        🏆 {badge}
                      </Badge>
                    ))}
                    {challenge.reward.special && (
                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0">
                        ✨ {challenge.reward.special}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions et temps restant */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {challenge.timeLeft}
                  </div>
                  {challenge.isCompleted ? (
                    <Button size="sm" variant="secondary" disabled>
                      <Trophy className="w-3 h-3 mr-1" />
                      Complété
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      Continuer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Défis de groupe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Défis Communautaires
          </CardTitle>
          <CardDescription>
            Participez aux défis avec la communauté MED-MNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Défi Collectif : 10,000 Items</h4>
                <Badge variant="outline">Communauté</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Objectif : Compléter ensemble 10,000 items EDN ce mois-ci
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression globale</span>
                  <span>7,234 / 10,000</span>
                </div>
                <Progress value={72.34} className="h-2" />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-muted-foreground">1,247 participants</span>
                <Button size="sm">Participer</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};