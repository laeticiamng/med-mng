import React, { useState } from 'react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  User, 
  Volume2, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Cloud
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';

const NewSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState({
    // Profile
    displayName: user?.user_metadata?.name || '',
    email: user?.email || '',
    bio: '',
    
    // Audio
    defaultVolume: [75],
    audioQuality: 'high',
    autoPlay: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    achievementAlerts: true,
    
    // Privacy
    profilePublic: false,
    shareStats: true,
    
    // Appearance
    theme: 'system',
    language: 'fr'
  });

  const handleSave = (section: string) => {
    toast.success(`Paramètres ${section} sauvegardés`);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Paramètres MED-MNG
            </h1>
            <p className="text-gray-600">
              Personnalisez votre expérience musicale médicale
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Confidentialité
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Apparence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nom d'affichage</Label>
                      <Input
                        id="displayName"
                        value={settings.displayName}
                        onChange={(e) => updateSetting('displayName', e.target.value)}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateSetting('email', e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Input
                      id="bio"
                      value={settings.bio}
                      onChange={(e) => updateSetting('bio', e.target.value)}
                      placeholder="Parlez-nous de votre parcours médical..."
                    />
                  </div>

                  <Button onClick={() => handleSave('profil')} className="w-full">
                    Sauvegarder le profil
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Volume par défaut: {settings.defaultVolume[0]}%</Label>
                    <Slider
                      value={settings.defaultVolume}
                      onValueChange={(value) => updateSetting('defaultVolume', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Qualité audio</Label>
                    <Select 
                      value={settings.audioQuality} 
                      onValueChange={(value) => updateSetting('audioQuality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute qualité (320 kbps)</SelectItem>
                        <SelectItem value="medium">Qualité moyenne (192 kbps)</SelectItem>
                        <SelectItem value="low">Qualité économique (128 kbps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Lecture automatique</Label>
                      <p className="text-sm text-muted-foreground">Démarre la lecture dès qu'une chanson est sélectionnée</p>
                    </div>
                    <Switch
                      checked={settings.autoPlay}
                      onCheckedChange={(checked) => updateSetting('autoPlay', checked)}
                    />
                  </div>

                  <Button onClick={() => handleSave('audio')} className="w-full">
                    Sauvegarder les paramètres audio
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevez des mises à jour par email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertes de succès</Label>
                      <p className="text-sm text-muted-foreground">Soyez notifié de vos accomplissements</p>
                    </div>
                    <Switch
                      checked={settings.achievementAlerts}
                      onCheckedChange={(checked) => updateSetting('achievementAlerts', checked)}
                    />
                  </div>

                  <Button onClick={() => handleSave('notifications')} className="w-full">
                    Sauvegarder les préférences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Confidentialité et sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profil public</Label>
                      <p className="text-sm text-muted-foreground">Permettre aux autres utilisateurs de voir votre profil</p>
                    </div>
                    <Switch
                      checked={settings.profilePublic}
                      onCheckedChange={(checked) => updateSetting('profilePublic', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Partager les statistiques</Label>
                      <p className="text-sm text-muted-foreground">Contribuer aux statistiques anonymes de la plateforme</p>
                    </div>
                    <Switch
                      checked={settings.shareStats}
                      onCheckedChange={(checked) => updateSetting('shareStats', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Actions de compte</Label>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger mes données
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Cloud className="h-4 w-4 mr-2" />
                        Exporter ma bibliothèque
                      </Button>
                    </div>
                  </div>

                  <Button onClick={() => handleSave('confidentialité')} className="w-full">
                    Sauvegarder les paramètres
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence et interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Thème</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
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

                  <Separator />

                  <div className="space-y-3">
                    <Label>Langue</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => updateSetting('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => handleSave('apparence')} className="w-full">
                    Sauvegarder les préférences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default NewSettings;