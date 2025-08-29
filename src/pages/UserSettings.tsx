import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { usePlatformFeatures } from '@/hooks/usePlatformFeatures';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Settings, User, Bell, Shield, Download, Trash2, Save } from 'lucide-react';

const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const { updateProfile, getDashboardStats, loading: analyticsLoading } = usePlatformAnalytics();
  const { exportData, loading: featuresLoading } = usePlatformFeatures();
  
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    preferences: {
      notifications: {
        email: true,
        push: true,
        marketing: false
      },
      privacy: {
        profile_visible: true,
        activity_visible: false
      },
      interface: {
        dark_mode: false,
        compact_view: false,
        animations: true
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const stats = await getDashboardStats();
      if (stats?.profile) {
        setProfile({
          display_name: stats.profile.display_name || '',
          bio: stats.profile.bio || '',
          preferences: stats.profile.preferences || profile.preferences
        });
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, getDashboardStats]);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateProfile({
      display_name: profile.display_name,
      bio: profile.bio,
      preferences: profile.preferences
    });
    
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const handleExport = async (type: 'user_data' | 'analytics_summary', format: 'json' | 'csv' = 'json') => {
    await exportData(type, format);
  };

  const updatePreference = (category: string, key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [key]: value
        }
      }
    }));
  };

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
            <p className="text-white/70">Gérez votre profil et vos préférences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Confidentialité
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Données
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Informations du profil</CardTitle>
                  <CardDescription className="text-white/70">
                    Modifiez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                      Vérifié
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-white">Nom d'affichage</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Votre nom d'affichage"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">Biographie</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Parlez-nous de vous..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Préférences d'interface</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Mode sombre</Label>
                        <p className="text-sm text-white/70">Utilisez le thème sombre</p>
                      </div>
                      <Switch
                        checked={profile.preferences.interface?.dark_mode}
                        onCheckedChange={(checked) => updatePreference('interface', 'dark_mode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Vue compacte</Label>
                        <p className="text-sm text-white/70">Affichage plus dense</p>
                      </div>
                      <Switch
                        checked={profile.preferences.interface?.compact_view}
                        onCheckedChange={(checked) => updatePreference('interface', 'compact_view', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Animations</Label>
                        <p className="text-sm text-white/70">Activer les animations</p>
                      </div>
                      <Switch
                        checked={profile.preferences.interface?.animations}
                        onCheckedChange={(checked) => updatePreference('interface', 'animations', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres de notification</CardTitle>
                  <CardDescription className="text-white/70">
                    Choisissez comment vous souhaitez être notifié
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Notifications par email</Label>
                      <p className="text-sm text-white/70">Recevez des emails pour les mises à jour importantes</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications?.email}
                      onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Notifications push</Label>
                      <p className="text-sm text-white/70">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications?.push}
                      onCheckedChange={(checked) => updatePreference('notifications', 'push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Communications marketing</Label>
                      <p className="text-sm text-white/70">Nouveautés et offres spéciales</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications?.marketing}
                      onCheckedChange={(checked) => updatePreference('notifications', 'marketing', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres de confidentialité</CardTitle>
                  <CardDescription className="text-white/70">
                    Contrôlez la visibilité de vos informations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Profil visible</Label>
                      <p className="text-sm text-white/70">Permettre aux autres utilisateurs de voir votre profil</p>
                    </div>
                    <Switch
                      checked={profile.preferences.privacy?.profile_visible}
                      onCheckedChange={(checked) => updatePreference('privacy', 'profile_visible', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Activité visible</Label>
                      <p className="text-sm text-white/70">Afficher votre activité récente aux autres</p>
                    </div>
                    <Switch
                      checked={profile.preferences.privacy?.activity_visible}
                      onCheckedChange={(checked) => updatePreference('privacy', 'activity_visible', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Gestion des données</CardTitle>
                  <CardDescription className="text-white/70">
                    Exportez ou supprimez vos données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Exporter mes données</h4>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('user_data', 'json')}
                          disabled={featuresLoading}
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Données utilisateur (JSON)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('analytics_summary', 'csv')}
                          disabled={featuresLoading}
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Analytiques (CSV)
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <h4 className="text-white font-medium mb-2 text-red-400">Zone de danger</h4>
                      <p className="text-sm text-white/70 mb-4">
                        Actions irréversibles concernant votre compte
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSave}
              disabled={loading || analyticsLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
            >
              {loading ? (
                'Sauvegarde...'
              ) : saved ? (
                'Sauvegardé ✓'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default UserSettings;