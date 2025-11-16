import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Award, Lock } from 'lucide-react';
import { useStreaks } from '@/hooks/useStreaks';
import { useBadges } from '@/hooks/useBadges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const StreaksAndBadges: React.FC = () => {
  const { data: streakData } = useStreaks();
  const { badges, earnedBadges, totalBadges, progressPercentage } = useBadges();

  const categoryLabels = {
    completion: 'Complétion',
    specialty: 'Spécialités',
    streak: 'Régularité',
    score: 'Performance',
  };

  return (
    <div className="space-y-6">
      {/* Streaks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Séries de Révision
          </CardTitle>
          <CardDescription>
            Maintenez votre rythme d'apprentissage quotidien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className={`h-6 w-6 ${streakData?.isActiveToday ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <span className="text-3xl font-bold">{streakData?.currentStreak || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Série actuelle</p>
              {streakData?.isActiveToday && (
                <Badge variant="default" className="mt-2">Actif aujourd'hui</Badge>
              )}
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-3xl font-bold">{streakData?.longestStreak || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Record personnel</p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-6 w-6 text-purple-500" />
                <span className="text-3xl font-bold">{earnedBadges.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Badges débloqués</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Badges & Achievements
              </CardTitle>
              <CardDescription>
                {earnedBadges.length} sur {totalBadges} badges débloqués
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {progressPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Progression</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="completion">Complétion</TabsTrigger>
              <TabsTrigger value="specialty">Spécialités</TabsTrigger>
              <TabsTrigger value="score">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </TabsContent>

            {['completion', 'specialty', 'score'].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges
                    .filter((b) => b.category === category)
                    .map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const BadgeCard: React.FC<{ badge: any }> = ({ badge }) => {
  const progressPercentage = (badge.progress / badge.target) * 100;

  return (
    <Card className={`${badge.earned ? 'border-primary' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-4xl ${badge.earned ? '' : 'grayscale'}`}>
            {badge.earned ? badge.icon : <Lock className="h-10 w-10 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {badge.description}
            </p>
            {!badge.earned && (
              <>
                <Progress value={progressPercentage} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">
                  {badge.progress} / {badge.target}
                </p>
              </>
            )}
            {badge.earned && (
              <Badge variant="default" className="text-xs">
                Débloqué
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
