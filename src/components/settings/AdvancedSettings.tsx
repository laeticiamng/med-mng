import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import {
    Bell,
    Brain,
    Download,
    RefreshCw,
    Save,
    Settings,
    Shield,
    Upload,
    Volume2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserSettings {
  general: {
    autoPlay: boolean;
    defaultVolume: number;
    sessionReminders: boolean;
    darkMode: boolean;
    language: string;
  };
  audio: {
    masterVolume: number;
    backgroundSounds: boolean;
    audioQuality: string;
    crossfade: boolean;
    normalization: boolean;
  };
  notifications: {
    sessionStart: boolean;
    sessionEnd: boolean;
    breakReminders: boolean;
    achievementAlerts: boolean;
    emailNotifications: boolean;
  };
  ai: {
    enableRecommendations: boolean;
    learningPreferences: string[];
    autoPlaylistGeneration: boolean;
    dataCollection: boolean;
  };
}

export const AdvancedSettings = () => {
  const { toast } = useToast();
  const { saveUserPreferences } = useAIRecommendations();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_settings' } });
  }, []);
  
  const [settings, setSettings] = useState<UserSettings>({
    general: {
      autoPlay: true,
      defaultVolume: 70,
      sessionReminders: true,
      darkMode: false,
      language: 'fr'
    },
    audio: {
      masterVolume: 80,
      backgroundSounds: true,
      audioQuality: 'high',
      crossfade: true,
      normalization: true
    },
    notifications: {
      sessionStart: true,
      sessionEnd: true,
      breakReminders: true,
      achievementAlerts: true,
      emailNotifications: false
    },
    ai: {
      enableRecommendations: true,
      learningPreferences: ['visual', 'auditory'],
      autoPlaylistGeneration: true,
      dataCollection: true
    }
  });

  const [exportData, setExportData] = useState<string>('');

  const handleSaveSettings = async () => {
    try {
      // Sauvegarder les préférences IA
      await saveUserPreferences({
        preferred_genres: ['ambient', 'classical', 'instrumental'],
        preferred_moods: ['concentration', 'détente'],
        learning_style: settings.ai.learningPreferences.join(','),
        study_schedule: {
          preferred_duration: settings.general.defaultVolume,
          break_frequency: 25,
          notification_enabled: settings.general.sessionReminders
        }
      });

      // Ici, vous sauvegarderiez les autres paramètres dans Supabase
      console.log('Paramètres sauvegardés:', settings);
      
      toast({
        title: "Paramètres sauvegardés !",
        description: "Vos préférences ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonData = JSON.stringify(dataToExport, null, 2);
    setExportData(jsonData);
    
    // Créer un fichier de téléchargement
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medmng-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export terminé !",
      description: "Vos données ont été exportées avec succès."
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        setSettings(importedData.settings);
        
        toast({
          title: "Import réussi !",
          description: "Vos paramètres ont été importés. N'oubliez pas de sauvegarder."
        });
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Le fichier n'est pas valide.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const updateSetting = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres Avancés</h1>
          <p className="text-muted-foreground">Personnalisez votre expérience d'écoute</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres généraux
              </CardTitle>
              <CardDescription>Configuration de base de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPlay">Lecture automatique</Label>
                  <p className="text-sm text-muted-foreground">Démarrer automatiquement les sessions</p>
                </div>
                <Switch 
                  id="autoPlay"
                  checked={settings.general.autoPlay}
                  onCheckedChange={(checked) => updateSetting('general', 'autoPlay', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Volume par défaut</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.general.defaultVolume]}
                    onValueChange={([value]) => updateSetting('general', 'defaultVolume', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {settings.general.defaultVolume}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminders">Rappels de session</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des rappels pour les sessions</p>
                </div>
                <Switch 
                  id="reminders"
                  checked={settings.general.sessionReminders}
                  onCheckedChange={(checked) => updateSetting('general', 'sessionReminders', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) => updateSetting('general', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres audio */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Configuration audio
              </CardTitle>
              <CardDescription>Paramètres de qualité et de traitement audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Volume principal</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.audio.masterVolume]}
                    onValueChange={([value]) => updateSetting('audio', 'masterVolume', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {settings.audio.masterVolume}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backgroundSounds">Sons d'ambiance</Label>
                  <p className="text-sm text-muted-foreground">Activer les sons d'ambiance</p>
                </div>
                <Switch 
                  id="backgroundSounds"
                  checked={settings.audio.backgroundSounds}
                  onCheckedChange={(checked) => updateSetting('audio', 'backgroundSounds', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioQuality">Qualité audio</Label>
                <Select
                  value={settings.audio.audioQuality}
                  onValueChange={(value) => updateSetting('audio', 'audioQuality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible (128 kbps)</SelectItem>
                    <SelectItem value="medium">Moyenne (192 kbps)</SelectItem>
                    <SelectItem value="high">Élevée (320 kbps)</SelectItem>
                    <SelectItem value="lossless">Sans perte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="crossfade">Fondu enchaîné</Label>
                  <p className="text-sm text-muted-foreground">Transition fluide entre les pistes</p>
                </div>
                <Switch 
                  id="crossfade"
                  checked={settings.audio.crossfade}
                  onCheckedChange={(checked) => updateSetting('audio', 'crossfade', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="normalization">Normalisation audio</Label>
                  <p className="text-sm text-muted-foreground">Égaliser le volume des pistes</p>
                </div>
                <Switch 
                  id="normalization"
                  checked={settings.audio.normalization}
                  onCheckedChange={(checked) => updateSetting('audio', 'normalization', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Gérer les alertes et rappels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionStart">Début de session</Label>
                  <p className="text-sm text-muted-foreground">Notification au début des sessions</p>
                </div>
                <Switch 
                  id="sessionStart"
                  checked={settings.notifications.sessionStart}
                  onCheckedChange={(checked) => updateSetting('notifications', 'sessionStart', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionEnd">Fin de session</Label>
                  <p className="text-sm text-muted-foreground">Notification à la fin des sessions</p>
                </div>
                <Switch 
                  id="sessionEnd"
                  checked={settings.notifications.sessionEnd}
                  onCheckedChange={(checked) => updateSetting('notifications', 'sessionEnd', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="breakReminders">Rappels de pause</Label>
                  <p className="text-sm text-muted-foreground">Rappels pour les pauses</p>
                </div>
                <Switch 
                  id="breakReminders"
                  checked={settings.notifications.breakReminders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'breakReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievementAlerts">Alertes de réussite</Label>
                  <p className="text-sm text-muted-foreground">Notifications pour les badges</p>
                </div>
                <Switch 
                  id="achievementAlerts"
                  checked={settings.notifications.achievementAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'achievementAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Notifications email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des emails de suivi</p>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres IA */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligence artificielle
              </CardTitle>
              <CardDescription>Personnaliser l'expérience IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableRecommendations">Recommandations IA</Label>
                  <p className="text-sm text-muted-foreground">Activer les suggestions personnalisées</p>
                </div>
                <Switch 
                  id="enableRecommendations"
                  checked={settings.ai.enableRecommendations}
                  onCheckedChange={(checked) => updateSetting('ai', 'enableRecommendations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPlaylistGeneration">Génération automatique</Label>
                  <p className="text-sm text-muted-foreground">Créer des playlists automatiquement</p>
                </div>
                <Switch 
                  id="autoPlaylistGeneration"
                  checked={settings.ai.autoPlaylistGeneration}
                  onCheckedChange={(checked) => updateSetting('ai', 'autoPlaylistGeneration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataCollection">Collecte de données</Label>
                  <p className="text-sm text-muted-foreground">Améliorer les recommandations</p>
                </div>
                <Switch 
                  id="dataCollection"
                  checked={settings.ai.dataCollection}
                  onCheckedChange={(checked) => updateSetting('ai', 'dataCollection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des données */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>Exporter, importer et gérer vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter mes données
                </Button>
                
                <div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer des données
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Vos données sont automatiquement sauvegardées dans le cloud
                </p>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Synchroniser maintenant
                </Button>
              </div>

              {exportData && (
                <div className="space-y-2">
                  <Label>Aperçu des données exportées</Label>
                  <Textarea
                    value={exportData.substring(0, 500) + '...'}
                    readOnly
                    className="h-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
