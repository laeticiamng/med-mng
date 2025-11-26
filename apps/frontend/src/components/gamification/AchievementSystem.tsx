import logger from '@/lib/logger';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award, Trophy, Star, Target, Crown,
  Flame, Zap, BookOpen, Music, Users, Clock,
  TrendingUp, CheckCircle, Gift, Sparkles, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  getAllBadges,
  getUserBadges,
  getUserAura,
  getGamificationStats,
  addXP,
  BadgeDefinition,
  UserBadge,
  UserAura,
  GamificationStats
} from '@shared/services/badges.service';

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
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    totalXp: 0,
    rank: 'Débutant',
    title: 'Étudiant'
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer toutes les définitions de badges
      const allBadges = await getAllBadges();

      // Récupérer les badges débloqués par l'utilisateur si connecté
      let userBadges: UserBadge[] = [];
      if (currentUserId) {
        userBadges = await getUserBadges(currentUserId);
      }

      const userBadgeIds = new Set(userBadges.map(b => b.badge_id));

      // Mapper les badges vers le format Achievement
      const mappedAchievements: Achievement[] = allBadges.map((badge: BadgeDefinition) => {
        const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
        const isUnlocked = userBadgeIds.has(badge.id);

        return {
          id: badge.id,
          title: badge.name,
          description: badge.description,
          icon: mapCategoryToIcon(badge.category),
          rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary',
          category: badge.category,
          points: badge.criteria_value * 10,
          unlocked: isUnlocked,
          unlockedAt: userBadge?.earned_at,
          progress: isUnlocked ? badge.criteria_value : 0,
          maxProgress: badge.criteria_value,
          rewards: { xp: getRarityXP(badge.rarity) }
        };
      });

      setAchievements(mappedAchievements);
    } catch (error) {
      logger.error('Erreur lors du chargement des achievements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les achievements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, toast]);

  const fetchUserProgress = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // Récupérer l'aura et les stats de l'utilisateur
      const [aura, stats] = await Promise.all([
        getUserAura(currentUserId),
        getGamificationStats(currentUserId)
      ]);

      const xpPerLevel = 1000;

      setUserLevel({
        level: aura.current_level,
        xp: aura.current_xp,
        nextLevelXp: xpPerLevel,
        totalXp: aura.total_xp,
        rank: getRankTitle(aura.current_level),
        title: getLevelTitle(aura.current_level)
      });
    } catch (error) {
      logger.error('Erreur lors du chargement des progrès:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  // Fonctions utilitaires
  const mapCategoryToIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      achievement: 'Trophy',
      streak: 'Flame',
      social: 'Users',
      wellness: 'Sparkles',
      learning: 'BookOpen'
    };
    return iconMap[category] || 'Award';
  };

  const getRarityXP = (rarity: string): number => {
    const xpMap: Record<string, number> = {
      common: 50,
      uncommon: 100,
      rare: 200,
      epic: 350,
      legendary: 500
    };
    return xpMap[rarity] || 50;
  };

  const getRankTitle = (level: number): string => {
    if (level >= 50) return 'Grand Maître';
    if (level >= 40) return 'Maître';
    if (level >= 30) return 'Expert';
    if (level >= 20) return 'Avancé';
    if (level >= 10) return 'Intermédiaire';
    if (level >= 5) return 'Apprenti';
    return 'Débutant';
  };

  const getLevelTitle = (level: number): string => {
    if (level >= 50) return 'Médecin Expert';
    if (level >= 40) return 'Interne Confirmé';
    if (level >= 30) return 'Externe Avancé';
    if (level >= 20) return 'Étudiant Confirmé';
    if (level >= 10) return 'Étudiant Avancé';
    if (level >= 5) return 'Apprenti Médecin';
    return 'Étudiant';
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

  const claimReward = async (achievementId: string) => {
    if (!currentUserId) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour réclamer vos récompenses.',
        variant: 'destructive'
      });
      return;
    }

    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlocked && achievement.rewards?.xp) {
      try {
        // Ajouter les XP à l'utilisateur
        await addXP(currentUserId, achievement.rewards.xp);

        // Mettre à jour l'affichage local
        await fetchUserProgress();

        toast({
          title: 'Récompense réclamée !',
          description: `Vous avez gagné ${achievement.rewards.xp} XP !`
        });
      } catch (error) {
        logger.error('Erreur lors de la réclamation de récompense:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de réclamer la récompense',
          variant: 'destructive'
        });
      }
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