import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Volume2, 
  Globe, 
  Moon, 
  Download, 
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ProfileSettingsProps {
  profile: any;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    soundEffects: true,
    autoPlay: false,
    darkMode: false,
    language: 'fr',
    quality: 'high',
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences ont été sauvegardées.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données seront téléchargées sous peu.",
    });
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: "Cache vidé",
      description: "Les données temporaires ont été supprimées.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications push</Label>
              <p className="text-sm text-gray-600">
                Recevoir des notifications dans le navigateur
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Mises à jour par email</Label>
              <p className="text-sm text-gray-600">
                Recevoir des nouvelles et mises à jour par email
              </p>
            </div>
            <Switch
              id="email-updates"
              checked={settings.emailUpdates}
              onCheckedChange={(checked) => handleSettingChange('emailUpdates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio & Media */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio et média
          </CardTitle>
          <CardDescription>
            Configurez vos préférences audio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-effects">Effets sonores</Label>
              <p className="text-sm text-gray-600">
                Activer les sons d'interface
              </p>
            </div>
            <Switch
              id="sound-effects"
              checked={settings.soundEffects}
              onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-play">Lecture automatique</Label>
              <p className="text-sm text-gray-600">
                Démarrer automatiquement la lecture des chansons
              </p>
            </div>
            <Switch
              id="auto-play"
              checked={settings.autoPlay}
              onCheckedChange={(checked) => handleSettingChange('autoPlay', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Qualité audio</Label>
            <Select
              value={settings.quality}
              onValueChange={(value) => handleSettingChange('quality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible (économie de données)</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute qualité</SelectItem>
                <SelectItem value="premium">Premium (abonnés uniquement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>
            Personnalisez l'interface de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <p className="text-sm text-gray-600">
                Utiliser un thème sombre pour l'interface
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langue
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
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

      {/* Data Management */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Gestion des données
          </CardTitle>
          <CardDescription>
            Exportez ou supprimez vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter mes données
            </Button>
            
            <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Vider le cache
            </Button>
          </div>

          <Separator />

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Zone de danger</h4>
            <p className="text-sm text-red-600 mb-4">
              Cette action supprimera définitivement votre compte et toutes vos données.
            </p>
            <Button variant="destructive" size="sm" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};