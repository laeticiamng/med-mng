import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, Trophy, Medal, Star, Target, Crown,
  Flame, Zap, BookOpen, Music, Users, Clock,
  TrendingUp, CheckCircle, Gift, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rewards?: {
    xp: number;
    badges?: string[];
    unlocks?: string[];
  };
}

interface UserLevel {
  level: number;
  xp: number;
  nextLevelXp: number;
  totalXp: number;
  rank: string;
  title: string;
}

export const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 12,
    xp: 2340,
    nextLevelXp: 2500,
    totalXp: 12340,
    rank: 'Étudiant Avancé',
    title: 'Apprenti Médecin'
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    initializeAchievements();
    fetchUserProgress();
  }, []);

  const initializeAchievements = () => {
    const mockAchievements: Achievement[] = [
      // Achievements d'apprentissage
      {
        id: '1',
        title: 'Premier pas',
        description: 'Terminer votre première session d\'étude',
        icon: 'BookOpen',
        rarity: 'common',
        category: 'learning',
        points: 10,
        unlocked: true,
        unlockedAt: '2024-01-15T10:30:00Z',
        rewards: { xp: 50 }
      },
      {
        id: '2',
        title: 'Mélomane médical',
        description: 'Générer 10 musiques éducatives',
        icon: 'Music',
        rarity: 'rare',
        category: 'music',
        points: 25,
        unlocked: true,
        unlockedAt: '2024-02-01T14:20:00Z',
        progress: 10,
        maxProgress: 10,
        rewards: { xp: 150, badges: ['Music Master'] }
      },
      {
        id: '3',
        title: 'Série parfaite',
        description: 'Étudier 7 jours consécutifs',
        icon: 'Flame',
        rarity: 'epic',
        category: 'consistency',
        points: 50,
        unlocked: false,
        progress: 5,
        maxProgress: 7,
        rewards: { xp: 300, unlocks: ['Daily Bonus'] }
      },
      {
        id: '4',
        title: 'Maître des IC',
        description: 'Compléter tous les items fondamentaux (IC-1 à IC-5)',
        icon: 'Crown',
        rarity: 'legendary',
        category: 'mastery',
        points: 100,
        unlocked: false,
        progress: 3,
        maxProgress: 5,
        rewards: { xp: 500, badges: ['IC Master'], unlocks: ['Advanced Features'] }
      },
      {
        id: '5',
        title: 'Collaborateur',
        description: 'Participer à 5 sessions d\'étude collaborative',
        icon: 'Users',
        rarity: 'rare',
        category: 'social',
        points: 30,
        unlocked: false,
        progress: 2,
        maxProgress: 5,
        rewards: { xp: 200 }
      },
      {
        id: '6',
        title: 'Marathonien',
        description: 'Étudier pendant plus de 2 heures en une session',
        icon: 'Clock',
        rarity: 'epic',
        category: 'endurance',
        points: 40,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rewards: { xp: 250 }
      },
      {
        id: '7',
        title: 'Perfectionniste',
        description: 'Obtenir 100% à 10 quiz consécutifs',
        icon: 'Target',
        rarity: 'epic',
        category: 'performance',
        points: 60,
        unlocked: false,
        progress: 6,
        maxProgress: 10,
        rewards: { xp: 350, badges: ['Perfect Score'] }
      },
      {
        id: '8',
        title: 'Pionnier',
        description: 'Être parmi les premiers à tester une nouvelle fonctionnalité',
        icon: 'Sparkles',
        rarity: 'legendary',
        category: 'special',
        points: 75,
        unlocked: true,
        unlockedAt: '2024-01-10T09:00:00Z',
        rewards: { xp: 400, badges: ['Early Adopter'] }
      }
    ];

    setAchievements(mockAchievements);
  };

  const fetchUserProgress = async () => {
    setLoading(true);
    try {
      // Simulation de récupération des données utilisateur
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erreur lors du chargement des progrès:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      BookOpen, Music, Flame, Crown, Users, Clock, Target, Sparkles,
      Award, Trophy, Medal, Star, Zap, TrendingUp, CheckCircle, Gift
    };
    return icons[iconName] || Award;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100';
      case 'rare': return 'text-blue-500 bg-blue-100';
      case 'epic': return 'text-purple-500 bg-purple-100';
      case 'legendary': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-200';
      case 'rare': return 'border-blue-200';
      case 'epic': return 'border-purple-200';
      case 'legendary': return 'border-yellow-200 shadow-lg';
      default: return 'border-gray-200';
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  const completionRate = (unlockedAchievements.length / achievements.length) * 100;
  const xpProgress = (userLevel.xp / userLevel.nextLevelXp) * 100;

  const categories = [
    { id: 'all', name: 'Tous', icon: Award },
    { id: 'learning', name: 'Apprentissage', icon: BookOpen },
    { id: 'music', name: 'Musique', icon: Music },
    { id: 'consistency', name: 'Régularité', icon: Flame },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'performance', name: 'Performance', icon: Target },
    { id: 'special', name: 'Spécial', icon: Sparkles }
  ];

  const claimReward = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlocked) {
      toast({
        title: "Récompense réclamée !",
        description: `Vous avez gagné ${achievement.rewards?.xp || 0} XP !`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profil utilisateur */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userLevel.title}</h2>
                <p className="text-muted-foreground">{userLevel.rank} • Niveau {userLevel.level}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{totalPoints} points</Badge>
                  <Badge variant="outline">{completionRate.toFixed(0)}% complété</Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Progression niveau</div>
                <Progress value={xpProgress} className="w-48" />
                <div className="text-xs text-muted-foreground">
                  {userLevel.xp} / {userLevel.nextLevelXp} XP
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Débloqués</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Points totaux</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userLevel.totalXp}</div>
            <div className="text-sm text-muted-foreground">XP total</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Progression</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="medical-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const IconComponent = getIcon(achievement.icon);
          const isUnlocked = achievement.unlocked;
          const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
          
          return (
            <Card 
              key={achievement.id} 
              className={`medical-card transition-all duration-300 ${
                isUnlocked ? 'bg-gradient-to-br from-card to-primary/5' : 'opacity-70'
              } ${getRarityBorder(achievement.rarity)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)} ${
                    isUnlocked ? '' : 'grayscale'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                      </div>
                      
                      {isUnlocked && (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      )}
                    </div>
                    
                    {hasProgress && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progression</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress! / achievement.maxProgress!) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="secondary">
                          {achievement.points} pts
                        </Badge>
                      </div>
                      
                      {isUnlocked && achievement.rewards && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => claimReward(achievement.id)}
                          className="text-xs"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Réclamer
                        </Button>
                      )}
                    </div>
                    
                    {isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="medical-card">
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun achievement trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de changer de catégorie pour voir d'autres récompenses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};