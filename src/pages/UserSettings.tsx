import { FeedbackSystem } from '@/components/feedback/FeedbackSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    Bell,
    Database,
    Download,
    Flame,
    Mail,
    MapPin,
    Palette,
    Phone,
    Save,
    Shield,
    Star,
    Trash2,
    Trophy,
    Upload,
    User,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const UserSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  // État des paramètres du profil (chargé depuis la DB)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    department: '',
    job_title: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    courseReminders: true,
    communityUpdates: false,
    securityAlerts: true,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    shareProgress: true,
    allowAnalytics: true
  });

  // Load user and profile from database
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_user_settings' } });

        // Charger le profil depuis Supabase
        const { _data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setProfileData({
            name: profile.name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            department: profile.department || '',
            job_title: profile.job_title || ''
          });

          // Charger les préférences si disponibles
          if (profile.preferences) {
            const prefs = profile.preferences as Record<string, unknown>;
            if (prefs.notifications) {
              setNotificationSettings(prev => ({ ...prev, ...(prefs.notifications as object) }));
            }
            if (prefs.privacy) {
              setPrivacySettings(prev => ({ ...prev, ...(prefs.privacy as object) }));
            }
          }
        }
      }
    };
    loadUserData();
  }, [loadStats, logActivity]);

  const levelProgress = gamificationStats 
    ? ((gamificationStats.totalPoints % 1000) / 1000) * 100 
    : 0;

  const handleSave = async (section: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (section === 'profil') {
        const { _error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            bio: profileData.bio,
            location: profileData.location,
            website: profileData.website,
            department: profileData.department,
            job_title: profileData.job_title,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (_error) throw _error;
      } else {
        // Sauvegarder les préférences dans le champ preferences JSONB
        const { _data: currentProfile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        const currentPrefs = (currentProfile?.preferences as Record<string, unknown>) || {};
        
        const newPrefs: Record<string, unknown> = {
          ...currentPrefs,
          notifications: section === 'notifications' ? notificationSettings : currentPrefs.notifications,
          privacy: section === 'confidentialité' ? privacySettings : currentPrefs.privacy
        };

        const { _error } = await supabase
          .from('profiles')
          .update({ preferences: newPrefs as any, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (_error) throw _error;
      }
      
      toast.success('Paramètres sauvegardés !', {
        description: `Les paramètres de ${section} ont été mis à jour avec succès.`
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: error.message || 'Veuillez réessayer plus tard.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulation d'export de données
    const data = {
      profile: profileData,
      settings: { notifications: notificationSettings, privacy: privacySettings },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-mng-user-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Données exportées', {
      description: 'Vos données ont été téléchargées avec succès.'
    });
  };

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Database },
    { id: 'feedback', label: 'Feedback', icon: Mail }
  ];

  return (
    <>
      <Helmet>
        <title>Paramètres Utilisateur - MED-MNG</title>
        <meta name="description" content="Gérez vos paramètres personnels, notifications et préférences sur MED-MNG." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="medical-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0 space-y-4">
              {/* Gamification Stats Card */}
              {user && gamificationStats && (
                <Card className="medical-card bg-gradient-to-br from-primary/5 via-background to-accent/5">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-warning/10 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-warning">
                          <Flame className="h-4 w-4" />
                          <span className="text-xl font-bold">{gamificationStats.currentStreak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Streak</p>
                      </div>
                      <div className="text-center p-2 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Star className="h-4 w-4" />
                          <span className="text-xl font-bold">Nv.{gamificationStats.level}</span>
                        </div>
                        <Progress value={levelProgress} className="h-1 mt-1" />
                      </div>
                      <div className="text-center p-2 bg-accent/10 rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4" />
                          <span className="text-xl font-bold">{gamificationStats.totalPoints}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                      <div className="text-center p-2 bg-success/10 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-success">
                          <Trophy className="h-4 w-4" />
                          <span className="text-xl font-bold">{gamificationStats.badges.length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Badges</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="medical-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Paramètres</CardTitle>
                  <CardDescription>Gérez votre compte</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Informations Personnelles
                    </CardTitle>
                    <CardDescription>
                      Gérez vos informations de profil et vos données personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label">Nom complet</Label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Téléphone
                        </Label>
                        <Input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label">Département/Spécialité</Label>
                        <Input
                          value={profileData.department}
                          onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label">Poste/Fonction</Label>
                        <Input
                          value={profileData.job_title}
                          onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Localisation
                        </Label>
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="medical-label">Biographie</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="medical-input resize-none"
                        rows={3}
                        placeholder="Décrivez brièvement votre parcours et vos expertises..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('profil')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Préférences de Notification
                    </CardTitle>
                    <CardDescription>
                      Choisissez comment et quand vous souhaitez être notifié
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            {key === 'emailNotifications' && 'Notifications par email'}
                            {key === 'pushNotifications' && 'Notifications push'}
                            {key === 'weeklyDigest' && 'Résumé hebdomadaire'}
                            {key === 'courseReminders' && 'Rappels de cours'}
                            {key === 'communityUpdates' && 'Mises à jour communauté'}
                            {key === 'securityAlerts' && 'Alertes de sécurité'}
                            {key === 'marketingEmails' && 'Emails marketing'}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {key === 'emailNotifications' && 'Recevez les notifications importantes par email'}
                            {key === 'pushNotifications' && 'Notifications en temps réel sur votre appareil'}
                            {key === 'weeklyDigest' && 'Résumé de votre activité chaque semaine'}
                            {key === 'courseReminders' && 'Rappels pour vos cours et formations'}
                            {key === 'communityUpdates' && 'Nouveautés et discussions de la communauté'}
                            {key === 'securityAlerts' && 'Alertes importantes de sécurité'}
                            {key === 'marketingEmails' && 'Promotions et nouveautés produit'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('notifications')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Confidentialité et Sécurité
                    </CardTitle>
                    <CardDescription>
                      Contrôlez la visibilité de vos données et votre vie privée
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Visibilité du profil</h4>
                      {Object.entries(privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">
                              {key === 'profileVisibility' && 'Profil public'}
                              {key === 'showEmail' && 'Afficher l\'email'}
                              {key === 'showPhone' && 'Afficher le téléphone'}
                              {key === 'allowDataCollection' && 'Collecte de données'}
                              {key === 'shareProgress' && 'Partager les progrès'}
                              {key === 'allowAnalytics' && 'Analytics et amélioration'}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {key === 'profileVisibility' && 'Votre profil est visible par les autres utilisateurs'}
                              {key === 'showEmail' && 'Votre email apparaît sur votre profil public'}
                              {key === 'showPhone' && 'Votre téléphone apparaît sur votre profil public'}
                              {key === 'allowDataCollection' && 'Permettre la collecte de données pour améliorer l\'expérience'}
                              {key === 'shareProgress' && 'Vos progrès sont visibles par la communauté'}
                              {key === 'allowAnalytics' && 'Autoriser les données analytics pour améliorer la plateforme'}
                            </p>
                          </div>
                          <Switch
                            checked={typeof value === 'boolean' ? value : value === 'public'}
                            onCheckedChange={(checked) => 
                              setPrivacySettings(prev => ({ 
                                ...prev, 
                                [key]: key === 'profileVisibility' ? (checked ? 'public' : 'private') : checked 
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <h5 className="text-sm font-medium text-warning">
                          Information importante
                        </h5>
                      </div>
                      <p className="text-xs text-warning/80">
                        Certaines fonctionnalités peuvent être limitées si vous désactivez la collecte de données.
                        Vos données sont toujours protégées selon notre politique de confidentialité.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('confidentialité')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Management Section */}
              {activeSection === 'data' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Gestion des Données
                    </CardTitle>
                    <CardDescription>
                      Exportez, importez ou supprimez vos données personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-2 border-dashed border-muted">
                        <CardContent className="p-6 text-center">
                          <Download className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h4 className="font-medium mb-2">Exporter mes données</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Téléchargez toutes vos données dans un fichier JSON
                          </p>
                          <Button
                            onClick={handleExportData}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-muted">
                        <CardContent className="p-6 text-center">
                          <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h4 className="font-medium mb-2">Importer des données</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Restaurez vos données depuis un fichier de sauvegarde
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Bientôt disponible
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h4 className="font-medium text-destructive">
                          Zone Dangereuse
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-destructive">
                          La suppression de votre compte est irréversible. Toutes vos données,
                          progression et créations seront définitivement perdues.
                        </p>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer mon compte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback Section */}
              {activeSection === 'feedback' && (
                <div>
                  <FeedbackSystem context="user-settings" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettings;