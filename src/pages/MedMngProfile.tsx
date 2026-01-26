import { useAuth } from '@/components/med-mng/AuthProvider';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { ProfileSecurity } from '@/components/med-mng/profile/ProfileSecurity';
import { ProfileSettings } from '@/components/med-mng/profile/ProfileSettings';
import { ProfileSubscription } from '@/components/med-mng/profile/ProfileSubscription';
import { withAuth } from '@/components/med-mng/withAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    Award,
    Calendar,
    Camera,
    Crown,
    Flame,
    Heart,
    Loader2,
    Mail,
    Music,
    Settings,
    Shield,
    TrendingUp,
    Trophy,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const MedMngProfileComponent = () => {
  const { user } = useAuth();
  const medMngApi = useMedMngApi();
  const queryClient = useQueryClient();
  const { logActivity } = useActivityTracking();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  const { stats: gamificationStats, loadStats } = useGamification();

  // Load gamification stats and log activity
  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
      logActivity({ activity_type: 'study', metadata: { action: 'view_profile' } });
    }
  }, [user?.id, loadStats, logActivity]);

  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;
  const xpProgress = gamificationStats ? ((gamificationStats.currentXP || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100 : 0;

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user statistics including favorites count
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      try {
        const [library, quota] = await Promise.all([
          medMngApi.getLibrary(1, 100),
          medMngApi.getRemainingQuota(),
        ]);
        
        // Récupérer le nombre de favoris via RPC ou table directe
        const { count: favoritesCount } = await (supabase as any)
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id);
        
        return {
          totalSongs: library.length || 0,
          creditsUsed: 50 - (quota?.remaining_credits || 0),
          creditsRemaining: quota?.remaining_credits || 0,
          favoritesCount: favoritesCount || 0,
          joinDate: profile?.created_at,
        };
      } catch (err) {
        console.error('Error fetching stats:', err);
        return {
          totalSongs: 0,
          creditsUsed: 0,
          creditsRemaining: 0,
          favoritesCount: 0,
          joinDate: new Date().toISOString(),
        };
      }
    },
    enabled: !!user?.id && !!profile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    },
    onError: (_error: any) => {
      toast.error('Impossible de mettre à jour le profil');
    },
  });

  const handleEditProfile = () => {
    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '' });
  };

  if (profileLoading) {
    return (
      <MedMngLayout className="bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement de votre profil...</p>
            </div>
          </div>
        </div>
      </MedMngLayout>
    );
  }

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
    <MedMngLayout className="bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardContent className="p-8">
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
                
                <div className="flex flex-col md:flex-row gap-4 text-primary-foreground/80">
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
          </CardContent>
        </Card>

        {/* Gamification Stats Card */}
        {gamificationStats && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary/5 via-accent/5 to-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Niveau {level}</h3>
                    <p className="text-sm text-muted-foreground">{gamificationStats.currentXP || 0} XP total</p>
                    <div className="w-32 mt-2">
                      <Progress value={xpProgress} className="h-2" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5 text-warning" />
                      <span className="text-3xl font-bold">{gamificationStats.currentStreak || 0}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Jours de suite</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="text-3xl font-bold">{gamificationStats.badges?.length || 0}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Badges</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-success">{gamificationStats.longestStreak || 0}</span>
                    <p className="text-sm text-muted-foreground">Record streak</p>
                  </div>
                </div>
              </div>
              {/* Badges display */}
              {gamificationStats.badges && gamificationStats.badges.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm font-medium mb-2">Badges obtenus</p>
                  <div className="flex flex-wrap gap-2">
                    {gamificationStats.badges.slice(0, 8).map((badge) => (
                      <Badge key={badge.id} variant="secondary" className="gap-1 py-1">
                        <span>{badge.icon}</span>
                        <span>{badge.name}</span>
                      </Badge>
                    ))}
                    {gamificationStats.badges.length > 8 && (
                      <Badge variant="outline">+{gamificationStats.badges.length - 8}</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalSongs || 0}</p>
                  <p className="text-sm text-muted-foreground">Chansons créées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.creditsRemaining || 0}</p>
                  <p className="text-sm text-muted-foreground">Crédits restants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.creditsUsed || 0}</p>
                  <p className="text-sm text-muted-foreground">Crédits utilisés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Heart className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.favoritesCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Favoris</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informations personnelles</span>
                  {!isEditing && (
                    <Button onClick={handleEditProfile} variant="outline" size="sm">
                      Modifier
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et vos préférences de compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                      <p className="text-lg font-medium">{profile?.name || 'Non renseigné'}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Adresse email</Label>
                      <p className="text-lg font-medium">{profile?.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type de compte</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {profile?.is_test_account ? (
                          <Badge variant="outline">Compte test</Badge>
                        ) : (
                          <Badge variant="outline">Compte utilisateur</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <ProfileSubscription profile={profile} />
          </TabsContent>

          <TabsContent value="settings">
            <ProfileSettings profile={profile} />
          </TabsContent>

          <TabsContent value="security">
            <ProfileSecurity />
          </TabsContent>
        </Tabs>
      </div>
    </MedMngLayout>
  );
};

export const MedMngProfile = withAuth(MedMngProfileComponent);