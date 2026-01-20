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
import { useActivityTracking } from '@/hooks/useActivityTracking';

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
    nextLevelXp: 100,
    totalXp: 0,
    rank: 'Débutant',
    title: 'Étudiant'
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    loadAchievements();
    fetchUserProgress();
    
    // Track achievements view
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'achievements_view' }
    });
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      // Charger les achievements depuis Supabase
      const { data: achievementsData, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Charger les user_badges pour voir lesquels sont débloqués
      const { data: { user } } = await supabase.auth.getUser();
      let unlockedIds: string[] = [];
      
      if (user) {
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id);
        
        unlockedIds = (userBadges || []).map(ub => ub.badge_id);
      }

      // Mapper les données Supabase vers l'interface Achievement
      const mappedAchievements: Achievement[] = (achievementsData || []).map(a => ({
        id: a.id,
        title: a.name,
        description: a.description,
        icon: a.icon || 'Award',
        rarity: a.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        category: a.category,
        points: (a.rewards as any)?.xp || 10,
        unlocked: unlockedIds.includes(a.id),
        unlockedAt: unlockedIds.includes(a.id) ? new Date().toISOString() : undefined,
        rewards: a.rewards as any
      }));

      if (mappedAchievements.length > 0) {
        setAchievements(mappedAchievements);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les stats de gamification
      const { data: stats } = await (supabase as any)
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stats) {
        const level = stats.level || 1;
        const xp = stats.current_xp || 0;
        const nextLevelXp = level * 100;
        
        setUserLevel({
          level,
          xp,
          nextLevelXp,
          totalXp: stats.total_xp || 0,
          rank: getRankFromLevel(level),
          title: getTitleFromLevel(level)
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des progrès:', error);
    }
  };

  const getRankFromLevel = (level: number): string => {
    if (level >= 50) return 'Maître';
    if (level >= 30) return 'Expert';
    if (level >= 15) return 'Avancé';
    if (level >= 5) return 'Intermédiaire';
    return 'Débutant';
  };

  const getTitleFromLevel = (level: number): string => {
    if (level >= 50) return 'Docteur Émérite';
    if (level >= 30) return 'Médecin Confirmé';
    if (level >= 15) return 'Interne Expérimenté';
    if (level >= 5) return 'Étudiant Avancé';
    return 'Apprenti Médecin';
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
      case 'common': return 'text-muted-foreground bg-muted';
      case 'rare': return 'text-primary bg-primary/10';
      case 'epic': return 'text-accent bg-accent/10';
      case 'legendary': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-border';
      case 'rare': return 'border-primary/20';
      case 'epic': return 'border-accent/20';
      case 'legendary': return 'border-warning/20 shadow-lg';
      default: return 'border-border';
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
                <Crown className="h-8 w-8 text-primary-foreground" />
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
            <Trophy className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Débloqués</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Points totaux</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{userLevel.totalXp}</div>
            <div className="text-sm text-muted-foreground">XP total</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
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