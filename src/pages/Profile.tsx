import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  Settings, 
  Edit3, 
  Camera,
  Star,
  Trophy,
  Activity,
  Clock
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getDashboardStats, updateProfile, getAnalytics } = usePlatformAnalytics();
  
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    subscription_tier: 'free',
    total_usage_credits: 0,
    remaining_credits: 100
  });
  
  const [stats, setStats] = useState({
    total_events: 0,
    weekly_activity: 0,
    achievements: [] as string[],
    level: 1,
    xp: 0,
    next_level_xp: 100
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      const [dashboardData, analyticsData] = await Promise.all([
        getDashboardStats(),
        getAnalytics()
      ]);

      if (dashboardData?.profile) {
        setProfile({
          display_name: dashboardData.profile.display_name || '',
          bio: dashboardData.profile.bio || '',
          avatar_url: dashboardData.profile.avatar_url || '',
          subscription_tier: dashboardData.profile.subscription_tier || 'free',
          total_usage_credits: dashboardData.profile.total_usage_credits || 0,
          remaining_credits: dashboardData.profile.remaining_credits || 100
        });
      }

      if (analyticsData) {
        const level = Math.floor(analyticsData.total_events / 10) + 1;
        const xp = analyticsData.total_events * 5;
        const nextLevelXp = level * 100;
        
        setStats({
          total_events: analyticsData.total_events,
          weekly_activity: dashboardData?.weekly_activity || 0,
          achievements: ['First Steps', 'Active User', 'Explorer'],
          level,
          xp,
          next_level_xp: nextLevelXp
        });
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user, getDashboardStats, getAnalytics]);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateProfile({
      display_name: profile.display_name,
      bio: profile.bio
    });
    
    if (result.success) {
      setEditing(false);
    }
    setLoading(false);
  };

  const getSubscriptionBadge = (tier: string) => {
    const configs = {
      free: { color: 'bg-gray-500/20 text-gray-200', label: 'Gratuit' },
      premium: { color: 'bg-blue-500/20 text-blue-200', label: 'Premium' },
      enterprise: { color: 'bg-purple-500/20 text-purple-200', label: 'Enterprise' }
    };
    return configs[tier as keyof typeof configs] || configs.free;
  };

  const progressPercent = (stats.xp % stats.next_level_xp) / stats.next_level_xp * 100;

  return (
    <ConsistentBackground variant="primary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mon Profil</h1>
            <p className="text-white/70">Gérez vos informations et suivez vos progrès</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-white/20 text-white text-2xl">
                          {profile.display_name ? profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 
                           user?.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1">
                      {profile.display_name || 'Utilisateur'}
                    </h2>
                    
                    <p className="text-white/70 text-sm mb-3">{user?.email}</p>
                    
                    <Badge className={getSubscriptionBadge(profile.subscription_tier).color}>
                      {getSubscriptionBadge(profile.subscription_tier).label}
                    </Badge>
                  </div>

                  <Separator className="bg-white/10 my-6" />

                  {/* Level & XP */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-medium">Niveau {stats.level}</span>
                      </div>
                      <span className="text-white/70 text-sm">{stats.xp} XP</span>
                    </div>
                    
                    <Progress value={progressPercent} className="h-2" />
                    
                    <p className="text-white/60 text-xs text-center">
                      {stats.next_level_xp - (stats.xp % stats.next_level_xp)} XP jusqu'au niveau {stats.level + 1}
                    </p>
                  </div>

                  <Separator className="bg-white/10 my-6" />

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.total_events}</div>
                      <div className="text-white/60 text-xs">Actions totales</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.weekly_activity}</div>
                      <div className="text-white/60 text-xs">Cette semaine</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informations
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activité
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Succès
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Informations personnelles</CardTitle>
                        <CardDescription className="text-white/70">
                          Modifiez vos informations de profil
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {editing ? (loading ? 'Sauvegarde...' : 'Sauvegarder') : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Modifier
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="display_name" className="text-white">Nom d'affichage</Label>
                          <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                            disabled={!editing}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-white">Biographie</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!editing}
                          rows={4}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-white text-sm font-medium">Membre depuis</p>
                            <p className="text-white/60 text-xs">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-white text-sm font-medium">Crédits restants</p>
                            <p className="text-white/60 text-xs">{profile.remaining_credits} crédits</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activité récente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Connexion à la plateforme</p>
                            <p className="text-white/60 text-xs">Aujourd'hui</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Profil mis à jour</p>
                            <p className="text-white/60 text-xs">Il y a 2 jours</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Trophy className="h-4 w-4 text-purple-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Nouveau niveau atteint</p>
                            <p className="text-white/60 text-xs">Il y a 1 semaine</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Succès débloqués
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{achievement}</h4>
                              <p className="text-white/60 text-sm">Succès débloqué</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Profile;