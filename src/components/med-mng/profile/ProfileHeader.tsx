import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Camera, Crown, Flame, Mail, Star, Trophy, Zap } from 'lucide-react';
import React from 'react';

interface ProfileHeaderProps {
  profile: any;
  user: any;
  gamificationStats?: {
    currentStreak: number;
    level: number;
    totalPoints: number;
    badges: any[];
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, user, gamificationStats }) => {
  const XP_PER_LEVEL = 1000;
  const levelProgress = gamificationStats 
    ? ((gamificationStats.totalPoints % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 
    : 0;

  const getSubscriptionBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-warning/10 text-warning"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
      case 'pro':
        return <Badge className="bg-accent/10 text-accent"><Crown className="h-3 w-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="outline">Gratuit</Badge>;
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-primary-foreground mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary-foreground/20">
            <AvatarImage src="" alt={profile?.name} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon"
            variant="secondary"
            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              {profile?.name || 'Utilisateur'}
            </h1>
            {getSubscriptionBadge(profile?.subscription_plan)}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 text-primary-foreground/80 mb-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Mail className="h-4 w-4" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Calendar className="h-4 w-4" />
              <span>Membre depuis {new Date(profile?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Gamification Stats */}
          {gamificationStats && (
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2">
                <Flame className="h-5 w-5 text-warning" />
                <span className="font-bold">{gamificationStats.currentStreak}</span>
                <span className="text-sm opacity-80">jours</span>
              </div>
              
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2">
                <Star className="h-5 w-5" />
                <span className="font-bold">Niv. {gamificationStats.level}</span>
                <div className="w-16 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-foreground transition-all" 
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2">
                <Zap className="h-5 w-5" />
                <span className="font-bold">{gamificationStats.totalPoints}</span>
                <span className="text-sm opacity-80">XP</span>
              </div>
              
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2">
                <Trophy className="h-5 w-5 text-warning" />
                <span className="font-bold">{gamificationStats.badges.length}</span>
                <span className="text-sm opacity-80">badges</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
