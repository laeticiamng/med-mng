import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import {
    Award,
    Bell,
    BookOpen, Clock,
    Save,
    Settings,
    Target,
    TrendingUp,
    Upload,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  speciality?: string;
  study_level?: string;
  preferences?: any;
}

interface UserStats {
  total_sessions: number;
  study_time: number;
  completed_items: number;
  achievements: number;
  current_streak: number;
  level: number;
  xp: number;
  next_level_xp: number;
}

export const UserProfileManager = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    total_sessions: 0,
    study_time: 0,
    completed_items: 0,
    achievements: 0,
    current_streak: 0,
    level: 1,
    xp: 0,
    next_level_xp: 100
  });
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      study_reminders: true,
      achievement_alerts: true
    },
    theme: 'light',
    language: 'fr',
    music_quality: 'high',
    auto_play: false,
    study_goals: {
      daily_minutes: 60,
      weekly_sessions: 5,
      monthly_items: 10
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    fetchUserProfile();
    loadUserPreferences();
    
    // Track profile view
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'profile_manager_view' }
    });
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Charger le profil depuis Supabase
        const { _data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: (profileData as any)?.full_name || (profileData as any)?.username || user.user_metadata?.full_name || '',
          avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
          bio: profileData?.bio || '',
          speciality: (profileData as any)?.specialty || '',
          study_level: (profileData as any)?.study_level || ''
        };
        setProfile(userProfile);

        // Charger les stats de gamification (table non typée)
        const { data: gamificationStats } = await (supabase as any)
          .from('user_gamification_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Charger le nombre de badges
        const { count: badgeCount } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (gamificationStats) {
          setStats({
            total_sessions: gamificationStats.quizzes_completed || 0,
            study_time: gamificationStats.study_time_minutes || 0,
            completed_items: gamificationStats.items_completed || 0,
            achievements: badgeCount || 0,
            current_streak: gamificationStats.current_streak || 0,
            level: gamificationStats.level || 1,
            xp: gamificationStats.current_xp || 0,
            next_level_xp: (gamificationStats.level || 1) * 100
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil utilisateur.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { _data } = await supabase
        .from('user_preferences_extended')
        .select('*')
        .maybeSingle();
      
      if (_data) {
        setPreferences(prev => ({
          ...prev,
          theme: _data.dark_mode ? 'dark' : 'light',
          language: _data.language || 'fr',
          notifications: {
            ...prev.notifications,
            email: _data.notification_email ?? true,
            study_reminders: _data.study_reminders ?? true
          },
          music_quality: 'high'
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile.full_name || '',
          avatar_url: profile.avatar_url || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { _error } = await supabase
        .from('user_preferences_extended')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          dark_mode: preferences.theme === 'dark',
          language: preferences.language,
          notification_email: preferences.notifications.email,
          study_reminders: preferences.notifications.study_reminders,
          auto_play: preferences.auto_play
        }, { onConflict: 'user_id' });

      if (_error) throw _error;

      toast({
        title: "Préférences mises à jour",
        description: "Vos paramètres ont été sauvegardés."
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handlePreferenceUpdate = (section: string, field: string, value: any) => {
    if (section === 'theme' || section === 'language' || section === 'music_quality' || section === 'auto_play') {
      setPreferences(prev => ({
        ...prev,
        [section]: value
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as any),
          [field]: value
        }
      }));
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getXPProgress = () => {
    return (stats.xp / stats.next_level_xp) * 100;
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{profile.speciality}</Badge>
                <Badge variant="outline">{profile.study_level}</Badge>
                <Badge variant="outline">Niveau {stats.level}</Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Progression XP</div>
                <Progress value={getXPProgress()} className="w-32" />
                <div className="text-xs text-muted-foreground">
                  {stats.xp} / {stats.next_level_xp} XP
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.completed_items}</div>
            <div className="text-sm text-muted-foreground">Items complétés</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatTime(stats.study_time)}</div>
            <div className="text-sm text-muted-foreground">Temps d'étude</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.current_streak}</div>
            <div className="text-sm text-muted-foreground">Jours consécutifs</div>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.achievements}</div>
            <div className="text-sm text-muted-foreground">Récompenses</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de configuration */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objectifs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Gérez vos informations de profil public
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => handleProfileUpdate('full_name', e.target.value)}
                    className="medical-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    className="medical-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="speciality">Spécialité</Label>
                  <Select value={profile.speciality} onValueChange={(value) => handleProfileUpdate('speciality', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Médecine Générale">Médecine Générale</SelectItem>
                      <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                      <SelectItem value="Neurologie">Neurologie</SelectItem>
                      <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                      <SelectItem value="Psychiatrie">Psychiatrie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="study_level">Niveau d'études</Label>
                  <Select value={profile.study_level} onValueChange={(value) => handleProfileUpdate('study_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="D1">D1 (DFGSM2)</SelectItem>
                      <SelectItem value="D2">D2 (DFGSM3)</SelectItem>
                      <SelectItem value="D3">D3 (DFASM1)</SelectItem>
                      <SelectItem value="D4">D4 (DFASM2)</SelectItem>
                      <SelectItem value="D5">D5 (DFASM3)</SelectItem>
                      <SelectItem value="D6">D6 (Internat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous..."
                  value={profile.bio || ''}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  className="medical-input"
                  rows={3}
                />
              </div>
              
              <Button onClick={saveProfile} disabled={saving} className="medical-btn-primary">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Préférences d'affichage</CardTitle>
              <CardDescription>
                Personnalisez votre expérience utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select value={preferences.theme} onValueChange={(value) => handlePreferenceUpdate('theme', '', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select value={preferences.language} onValueChange={(value) => handlePreferenceUpdate('language', '', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Qualité audio</Label>
                  <Select value={preferences.music_quality} onValueChange={(value) => handlePreferenceUpdate('music_quality', '', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse (128kbps)</SelectItem>
                      <SelectItem value="medium">Moyenne (256kbps)</SelectItem>
                      <SelectItem value="high">Haute (320kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lecture automatique</Label>
                    <div className="text-sm text-muted-foreground">
                      Démarrer automatiquement les musiques
                    </div>
                  </div>
                  <Switch
                    checked={preferences.auto_play}
                    onCheckedChange={(checked) => handlePreferenceUpdate('auto_play', '', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={savePreferences} disabled={saving} className="medical-btn-primary">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Paramètres de notification</CardTitle>
              <CardDescription>
                Contrôlez quand et comment vous êtes notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <div className="text-sm text-muted-foreground">
                      Recevez des mises à jour par email
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications push</Label>
                    <div className="text-sm text-muted-foreground">
                      Recevez des notifications dans le navigateur
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rappels d'étude</Label>
                    <div className="text-sm text-muted-foreground">
                      Notifications pour maintenir votre rythme d'étude
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.study_reminders}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'study_reminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de récompenses</Label>
                    <div className="text-sm text-muted-foreground">
                      Notifications pour les nouvelles récompenses
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.achievement_alerts}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'achievement_alerts', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={savePreferences} disabled={saving} className="medical-btn-primary">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les notifications'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Objectifs d'apprentissage</CardTitle>
              <CardDescription>
                Définissez vos objectifs personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Minutes par jour</Label>
                  <Input
                    type="number"
                    value={preferences.study_goals.daily_minutes}
                    onChange={(e) => handlePreferenceUpdate('study_goals', 'daily_minutes', parseInt(e.target.value))}
                    className="medical-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Sessions par semaine</Label>
                  <Input
                    type="number"
                    value={preferences.study_goals.weekly_sessions}
                    onChange={(e) => handlePreferenceUpdate('study_goals', 'weekly_sessions', parseInt(e.target.value))}
                    className="medical-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Items par mois</Label>
                  <Input
                    type="number"
                    value={preferences.study_goals.monthly_items}
                    onChange={(e) => handlePreferenceUpdate('study_goals', 'monthly_items', parseInt(e.target.value))}
                    className="medical-input"
                  />
                </div>
              </div>
              
              <Button onClick={savePreferences} disabled={saving} className="medical-btn-primary">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les objectifs'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};