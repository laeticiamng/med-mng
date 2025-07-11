import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { ProfileHeader } from '@/components/med-mng/profile/ProfileHeader';
import { ProfileStats } from '@/components/med-mng/profile/ProfileStats';
import { ProfileSettings } from '@/components/med-mng/profile/ProfileSettings';
import { ProfileSubscription } from '@/components/med-mng/profile/ProfileSubscription';
import { ProfileSecurity } from '@/components/med-mng/profile/ProfileSecurity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Crown, 
  Shield, 
  Camera, 
  Mail, 
  Calendar,
  Music,
  Activity,
  TrendingUp,
  Heart,
  Loader2
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

const MedMngProfileComponent = () => {
  const { user } = useAuth();
  const medMngApi = useMedMngApi();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      try {
        const library = await medMngApi.getLibrary(1, 100);
        const quota = await medMngApi.getRemainingQuota();
        
        return {
          totalSongs: library.length || 0,
          creditsUsed: 50 - (quota?.remaining_credits || 0), // Assuming 50 is the base
          creditsRemaining: quota?.remaining_credits || 0,
          joinDate: profile?.created_at,
        };
      } catch (err) {
        console.error('Error fetching stats:', err);
        return {
          totalSongs: 0,
          creditsUsed: 0,
          creditsRemaining: 0,
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
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement de votre profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <MedMngNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
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
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Music className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalSongs || 0}</p>
                  <p className="text-sm text-gray-600">Chansons créées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.creditsRemaining || 0}</p>
                  <p className="text-sm text-gray-600">Crédits restants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.creditsUsed || 0}</p>
                  <p className="text-sm text-gray-600">Crédits utilisés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-sm text-gray-600">Favoris</p>
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
                      <Label className="text-sm font-medium text-gray-600">Nom complet</Label>
                      <p className="text-lg font-medium">{profile?.name || 'Non renseigné'}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Adresse email</Label>
                      <p className="text-lg font-medium">{profile?.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type de compte</Label>
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
    </div>
  );
};

export const MedMngProfile = withAuth(MedMngProfileComponent);