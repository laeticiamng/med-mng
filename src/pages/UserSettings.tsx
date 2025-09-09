import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Palette,
  Volume2,
  Bell,
  Shield,
  Globe,
  Accessibility,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Download,
  Trash2,
  Save,
  RotateCcw,
  Zap,
  Brain,
  Music,
  BookOpen,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';

const UserSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'fr',
    fontSize: 16,
    masterVolume: 80,
    musicVolume: 70,
    effectsVolume: 60,
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    highContrast: false,
    reducedMotion: false,
    profileVisibility: 'public',
    shareProgress: true,
    allowAnalytics: true,
    studyGoalDaily: 120,
    autoSave: true,
    aiAssistance: true,
    musicTherapy: true
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    });
    setHasUnsavedChanges(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <>
      <Helmet>
        <title>Paramètres - MED-MNG</title>
        <meta name="description" content="Personnalisez votre expérience MED-MNG - Apparence, notifications, accessibilité et confidentialité" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-2">Personnalisez votre expérience d'apprentissage médical</p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && <Badge variant="secondary" className="animate-pulse">Modifications non sauvegardées</Badge>}
            <Button variant="outline" onClick={() => setHasUnsavedChanges(false)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={saveSettings} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Thème et Apparence
                </CardTitle>
                <CardDescription>Personnalisez l'interface selon vos préférences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Thème</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Clair', icon: Sun },
                      { value: 'dark', label: 'Sombre', icon: Moon },
                      { value: 'system', label: 'Système', icon: Monitor }
                    ].map(({ value, label, icon: Icon }) => (
                      <Card
                        key={value}
                        className={`cursor-pointer transition-all ${settings.theme === value ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => updateSetting('theme', value)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">{label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Langue</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Taille de police: {settings.fontSize}px</Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSetting('fontSize', value)}
                    min={12}
                    max={24}
                    step={2}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Paramètres Audio
                </CardTitle>
                <CardDescription>Contrôlez les niveaux sonores de l'application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'masterVolume', label: 'Volume principal', icon: Volume2 },
                  { key: 'musicVolume', label: 'Musique thérapeutique', icon: Music },
                  { key: 'effectsVolume', label: 'Effets sonores', icon: Zap }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </Label>
                      <span className="text-sm text-muted-foreground">{settings[key]}%</span>
                    </div>
                    <Slider
                      value={[settings[key]]}
                      onValueChange={([value]) => updateSetting(key, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailNotifications', title: 'Notifications email', description: 'Recevoir des mises à jour par email' },
                  { key: 'pushNotifications', title: 'Notifications push', description: 'Notifications en temps réel dans le navigateur' },
                  { key: 'studyReminders', title: 'Rappels d\'étude', description: 'Rappels pour vos sessions d\'apprentissage' }
                ].map(({ key, title, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Accessibilité
                </CardTitle>
                <CardDescription>Options pour améliorer l'accessibilité de l'interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'highContrast', title: 'Contraste élevé', description: 'Améliore la lisibilité pour les troubles visuels' },
                  { key: 'reducedMotion', title: 'Mouvement réduit', description: 'Réduit les animations pour éviter les vertiges' }
                ].map(({ key, title, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité et Sécurité
                </CardTitle>
                <CardDescription>Contrôlez vos données et votre confidentialité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Visibilité du profil</Label>
                  <Select value={settings.profileVisibility} onValueChange={(value) => updateSetting('profileVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Amis uniquement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {[
                  { key: 'shareProgress', title: 'Partager la progression', description: 'Permettre le partage de votre progression d\'étude' },
                  { key: 'allowAnalytics', title: 'Analytics anonymes', description: 'Aider à améliorer l\'application avec des données anonymes' }
                ].map(({ key, title, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Zone de danger</span>
                  </div>
                  <Button variant="destructive" className="w-full">
                    Supprimer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UserSettingsPage;