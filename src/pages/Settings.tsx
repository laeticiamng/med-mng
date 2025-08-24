import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2, 
  Zap,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [settings, setSettings] = useState({
    // Profil & Compte
    profile: {
      name: 'Dr. Sarah Martinez',
      email: 'sarah.martinez@med-student.fr',
      phone: '+33 6 12 34 56 78',
      avatar: '',
      twoFactorEnabled: false,
      emailVerified: true
    },
    
    // Notifications
    notifications: {
      email: {
        studyReminders: true,
        achievements: true,
        weeklyProgress: true,
        newFeatures: false,
        marketing: false
      },
      push: {
        enabled: true,
        studyReminders: true,
        achievements: true,
        socialActivity: false,
        breaks: true
      },
      inApp: {
        sounds: true,
        vibration: true,
        badges: true
      }
    },
    
    // Interface & Expérience
    interface: {
      theme: 'dark',
      language: 'fr',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      compactMode: false
    },
    
    // Audio & Musique
    audio: {
      masterVolume: 80,
      musicVolume: 75,
      effectsVolume: 60,
      autoplay: true,
      crossfade: true,
      qualityPreference: 'high'
    },
    
    // Confidentialité
    privacy: {
      profileVisibility: 'friends',
      showProgress: 'friends',
      showAchievements: 'public',
      allowMessages: 'friends',
      showOnlineStatus: true,
      dataCollection: true,
      analytics: true
    },
    
    // Sécurité
    security: {
      sessionTimeout: 30,
      loginAlerts: true,
      passwordStrength: 'strong',
      lastPasswordChange: '2024-01-15',
      activeSessions: 2
    }
  });

  const handleSave = () => {
    // Save logic here
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    });
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    // Reset to default values
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés.",
    });
    setHasUnsavedChanges(false);
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <ImmersiveLayout
      variant="medical"
      header={{
        title: "Paramètres",
        subtitle: "Personnalisez votre expérience MED MNG",
        icon: <SettingsIcon className="h-6 w-6" />,
        badge: hasUnsavedChanges ? { text: "Non sauvegardé", color: "orange" } : undefined,
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {hasUnsavedChanges && (
          <Alert className="bg-orange-500/10 border-orange-500/30">
            <AlertDescription className="text-orange-200">
              Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur "Sauvegarder".
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-black/20 border border-white/10 grid grid-cols-6 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Profil & Compte */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Informations personnelles</CardTitle>
                <CardDescription className="text-gray-400">
                  Gérez vos informations de profil et préférences de compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nom complet</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Adresse email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                        className="bg-white/5 border-white/20 text-white flex-1"
                      />
                      {settings.profile.emailVerified && (
                        <Badge className="bg-green-500/20 text-green-300 px-2">Vérifié</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Téléphone</Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Authentification à deux facteurs</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-300 text-sm">
                        Sécurisez votre compte avec 2FA
                      </span>
                      <Switch
                        checked={settings.profile.twoFactorEnabled}
                        onCheckedChange={(value) => updateSetting('profile', 'twoFactorEnabled', value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Actions du compte</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter mes données
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer des données
                    </Button>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications Email */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notifications Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-white capitalize">
                        {key === 'studyReminders' && 'Rappels d\'étude'}
                        {key === 'achievements' && 'Nouveaux succès'}
                        {key === 'weeklyProgress' && 'Rapport hebdomadaire'}
                        {key === 'newFeatures' && 'Nouvelles fonctionnalités'}
                        {key === 'marketing' && 'Offres promotionnelles'}
                      </Label>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(newValue) => 
                          updateSetting('notifications', 'email', {
                            ...settings.notifications.email,
                            [key]: newValue
                          })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notifications Push */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Notifications Push
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.notifications.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-white capitalize">
                        {key === 'enabled' && 'Activer les notifications'}
                        {key === 'studyReminders' && 'Rappels d\'étude'}
                        {key === 'achievements' && 'Nouveaux succès'}
                        {key === 'socialActivity' && 'Activité sociale'}
                        {key === 'breaks' && 'Rappels de pause'}
                      </Label>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(newValue) => 
                          updateSetting('notifications', 'push', {
                            ...settings.notifications.push,
                            [key]: newValue
                          })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Préférences In-App */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications dans l'application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(settings.notifications.inApp).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-white capitalize">
                          {key === 'sounds' && 'Sons'}
                          {key === 'vibration' && 'Vibration'}
                          {key === 'badges' && 'Badges'}
                        </Label>
                        <Switch
                          checked={value as boolean}
                          onCheckedChange={(newValue) => 
                            updateSetting('notifications', 'inApp', {
                              ...settings.notifications.inApp,
                              [key]: newValue
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interface */}
          <TabsContent value="interface" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Apparence */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Apparence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Thème</Label>
                    <Select 
                      value={settings.interface.theme} 
                      onValueChange={(value) => updateSetting('interface', 'theme', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Sombre
                          </div>
                        </SelectItem>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Clair
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Automatique
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Langue</Label>
                    <Select 
                      value={settings.interface.language} 
                      onValueChange={(value) => updateSetting('interface', 'language', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Taille de police</Label>
                    <Select 
                      value={settings.interface.fontSize} 
                      onValueChange={(value) => updateSetting('interface', 'fontSize', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Normale</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="xl">Très grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibilité */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Accessibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Animations</Label>
                    <Switch
                      checked={settings.interface.animations}
                      onCheckedChange={(value) => updateSetting('interface', 'animations', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Mouvement réduit</Label>
                    <Switch
                      checked={settings.interface.reducedMotion}
                      onCheckedChange={(value) => updateSetting('interface', 'reducedMotion', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Contraste élevé</Label>
                    <Switch
                      checked={settings.interface.highContrast}
                      onCheckedChange={(value) => updateSetting('interface', 'highContrast', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Mode compact</Label>
                    <Switch
                      checked={settings.interface.compactMode}
                      onCheckedChange={(value) => updateSetting('interface', 'compactMode', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audio */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Paramètres Audio</CardTitle>
                <CardDescription className="text-gray-400">
                  Configurez vos préférences audio et de lecture musicale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Volumes */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Niveaux de volume</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-white">Volume principal</Label>
                        <span className="text-gray-400 text-sm">{settings.audio.masterVolume}%</span>
                      </div>
                      <Slider
                        value={[settings.audio.masterVolume]}
                        onValueChange={([value]) => updateSetting('audio', 'masterVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-white">Musique</Label>
                        <span className="text-gray-400 text-sm">{settings.audio.musicVolume}%</span>
                      </div>
                      <Slider
                        value={[settings.audio.musicVolume]}
                        onValueChange={([value]) => updateSetting('audio', 'musicVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-white">Effets sonores</Label>
                        <span className="text-gray-400 text-sm">{settings.audio.effectsVolume}%</span>
                      </div>
                      <Slider
                        value={[settings.audio.effectsVolume]}
                        onValueChange={([value]) => updateSetting('audio', 'effectsVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Préférences de lecture */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Préférences de lecture</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Lecture automatique</Label>
                      <Switch
                        checked={settings.audio.autoplay}
                        onCheckedChange={(value) => updateSetting('audio', 'autoplay', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-white">Fondu enchaîné</Label>
                      <Switch
                        checked={settings.audio.crossfade}
                        onCheckedChange={(value) => updateSetting('audio', 'crossfade', value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Qualité audio</Label>
                    <Select 
                      value={settings.audio.qualityPreference} 
                      onValueChange={(value) => updateSetting('audio', 'qualityPreference', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse (économise la bande passante)</SelectItem>
                        <SelectItem value="medium">Normale</SelectItem>
                        <SelectItem value="high">Élevée (recommandé)</SelectItem>
                        <SelectItem value="lossless">Sans perte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Paramètres de confidentialité</CardTitle>
                <CardDescription className="text-gray-400">
                  Contrôlez qui peut voir vos informations et activités
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white">Visibilité du profil</Label>
                    <Select 
                      value={settings.privacy.profileVisibility} 
                      onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Afficher les progrès</Label>
                    <Select 
                      value={settings.privacy.showProgress} 
                      onValueChange={(value) => updateSetting('privacy', 'showProgress', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Afficher les succès</Label>
                    <Select 
                      value={settings.privacy.showAchievements} 
                      onValueChange={(value) => updateSetting('privacy', 'showAchievements', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Messages privés</Label>
                    <Select 
                      value={settings.privacy.allowMessages} 
                      onValueChange={(value) => updateSetting('privacy', 'allowMessages', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Tout le monde</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="none">Personne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Données et analytiques</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Statut en ligne</Label>
                        <p className="text-gray-400 text-sm">Permettre aux autres de voir quand vous êtes actif</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showOnlineStatus}
                        onCheckedChange={(value) => updateSetting('privacy', 'showOnlineStatus', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Collecte de données</Label>
                        <p className="text-gray-400 text-sm">Améliorer l'expérience grâce aux données d'usage</p>
                      </div>
                      <Switch
                        checked={settings.privacy.dataCollection}
                        onCheckedChange={(value) => updateSetting('privacy', 'dataCollection', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Analytiques</Label>
                        <p className="text-gray-400 text-sm">Partager des statistiques anonymes</p>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(value) => updateSetting('privacy', 'analytics', value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sécurité du compte */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Sécurité du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Délai d'expiration de session</Label>
                    <Select 
                      value={settings.security.sessionTimeout.toString()} 
                      onValueChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="240">4 heures</SelectItem>
                        <SelectItem value="0">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Alertes de connexion</Label>
                      <p className="text-gray-400 text-sm">Recevoir un email lors de nouvelles connexions</p>
                    </div>
                    <Switch
                      checked={settings.security.loginAlerts}
                      onCheckedChange={(value) => updateSetting('security', 'loginAlerts', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Dernière modification du mot de passe</Label>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {new Date(settings.security.lastPasswordChange).toLocaleDateString('fr-FR')}
                      </span>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions actives */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Sessions actives</CardTitle>
                  <CardDescription className="text-gray-400">
                    {settings.security.activeSessions} sessions actives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: 'Chrome sur Windows', location: 'Paris, France', current: true, lastActive: 'Maintenant' },
                    { device: 'Mobile App', location: 'Paris, France', current: false, lastActive: 'Il y a 2h' }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white text-sm font-medium">{session.device}</p>
                        <p className="text-gray-400 text-xs">{session.location}</p>
                        <p className="text-gray-500 text-xs">{session.lastActive}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.current && (
                          <Badge className="bg-green-500/20 text-green-300 text-xs">Actuel</Badge>
                        )}
                        {!session.current && (
                          <Button variant="outline" size="sm">
                            Déconnecter
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="destructive" className="w-full mt-4">
                    Déconnecter toutes les autres sessions
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Actions de sécurité */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Actions de sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Journal de sécurité
                  </Button>
                  <Button variant="destructive" className="justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ImmersiveLayout>
  );
}