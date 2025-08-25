import React from 'react';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target,
  Medal,
  Gem
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const GamificationSystem = () => {
  const userLevel = 24;
  const userXP = 3420;
  const xpToNext = 1580;

  const achievements = [
    {
      id: '1',
      title: 'Virtuose Musical',
      description: 'Créé 50 chansons',
      icon: Star,
      rarity: 'epic',
      unlocked: true
    },
    {
      id: '2',
      title: 'Maître Cardiologue',
      description: '90%+ en cardiologie',
      icon: Trophy,
      rarity: 'legendary',
      unlocked: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-bold text-white">Niveau {userLevel}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Progression vers niveau {userLevel + 1}</span>
                  <span className="text-gray-300">{userXP} / {userXP + xpToNext} XP</span>
                </div>
                <Progress value={(userXP / (userXP + xpToNext)) * 100} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Succès Récents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <achievement.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                <p className="text-gray-400 text-xs">{achievement.description}</p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300">
                {achievement.rarity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};