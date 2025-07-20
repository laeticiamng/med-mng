import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Crown, Mail, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  user: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, user }) => {
  const getSubscriptionBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
      case 'pro':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="outline">Gratuit</Badge>;
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/20">
            <AvatarImage src="" alt={profile?.name} />
            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
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
          
          <div className="flex flex-col md:flex-row gap-4 text-white/80">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Mail className="h-4 w-4" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Calendar className="h-4 w-4" />
              <span>Membre depuis {new Date(profile?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};