import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, Volume2, Clock, Zap, Brain, Eye, Moon, Sun,
  Layout, Settings, User, Bell, Shield, Sparkles
} from 'lucide-react';

interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  autoSave: boolean;
  compactMode: boolean;
  notifications: {
    progress: boolean;
    achievements: boolean;
    reminders: boolean;
    social: boolean;
  };
  learningPreferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    preferredLanguage: string;
    studyReminders: boolean;
    adaptiveContent: boolean;
  };
}

const defaultSettings: PersonalizationSettings = {
  theme: 'system',
  accentColor: 'blue',
  fontSize: 16,
  animationSpeed: 'normal',
  reducedMotion: false,
  soundEnabled: true,
  soundVolume: 50,
  autoSave: true,
  compactMode: false,
  notifications: {
    progress: true,
    achievements: true,
    reminders: true,
    social: false,
  },
  learningPreferences: {
    difficulty: 'intermediate',
    preferredLanguage: 'fr',
    studyReminders: true,
    adaptiveContent: true,
  },
};

export const UserPersonalization: React.FC = () => {
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultSettings);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const saved = localStorage.getItem('med-mng-personalization');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
    setIsChanged(true);
  };

  const saveSettings = () => {
    localStorage.setItem('med-mng-personalization', JSON.stringify(settings));
    setIsChanged(false);
    
    // Appliquer les changements visuels
    applyVisualSettings();
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setIsChanged(true);
  };

  const applyVisualSettings = () => {
    const root = document.documentElement;
    
    // Taille de police
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Couleur d'accent
    if (settings.accentColor) {
      root.setAttribute('data-accent', settings.accentColor);
    }
    
    // Mode compact
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Mouvement réduit
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const colorOptions = [
    { value: 'blue', label: 'Bleu', color: 'bg-blue-500' },
    { value: 'green', label: 'Vert', color: 'bg-green-500' },
    { value: 'purple', label: 'Violet', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rose', color: 'bg-pink-500' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Personnalisation
        </CardTitle>
        <CardDescription>
          Adaptez l'interface à vos préférences et habitudes d'apprentissage
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Comportement
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Apprentissage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Thème */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Thème</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Clair
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Sombre
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Système
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Couleur d'accent */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Couleur d'accent</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.value}
                      variant={settings.accentColor === color.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('accentColor', color.value)}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${color.color}`} />
                      {color.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Taille de police */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Taille de police: {settings.fontSize}px
              </Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            {/* Options d'interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mode compact</Label>
                  <p className="text-sm text-muted-foreground">
                    Interface plus dense avec moins d'espaces
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Réduire les animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Diminue les effets visuels pour plus de performance
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            {/* Sons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sons d'interface</Label>
                  <p className="text-sm text-muted-foreground">
                    Feedback sonore pour les interactions
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Volume: {settings.soundVolume}%
                  </Label>
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={([value]) => updateSetting('soundVolume', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sauvegarde automatique */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarde automatiquement vos progrès
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            {/* Vitesse d'animation */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Vitesse d'animation</Label>
              <Select 
                value={settings.animationSpeed} 
                onValueChange={(value) => updateSetting('animationSpeed', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Lente</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="fast">Rapide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, enabled]) => {
                const labels = {
                  progress: { title: 'Progression', desc: 'Notifications de progrès et objectifs atteints' },
                  achievements: { title: 'Réussites', desc: 'Badges et accomplissements débloqués' },
                  reminders: { title: 'Rappels', desc: 'Rappels d\'étude et de révision' },
                  social: { title: 'Social', desc: 'Activités de la communauté et partages' },
                };

                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>{labels[key as keyof typeof labels].title}</Label>
                      <p className="text-sm text-muted-foreground">
                        {labels[key as keyof typeof labels].desc}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateSetting(`notifications.${key}`, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Niveau de difficulté */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Niveau de difficulté</Label>
                <Select 
                  value={settings.learningPreferences.difficulty} 
                  onValueChange={(value) => updateSetting('learningPreferences.difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Débutant</Badge>
                        Apprentissage guidé
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Intermédiaire</Badge>
                        Équilibre théorie/pratique
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Avancé</Badge>
                        Cas complexes
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Langue préférée */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Langue préférée</Label>
                <Select 
                  value={settings.learningPreferences.preferredLanguage} 
                  onValueChange={(value) => updateSetting('learningPreferences.preferredLanguage', value)}
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
            </div>

            {/* Options d'apprentissage */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Rappels d'étude</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour maintenir la régularité
                  </p>
                </div>
                <Switch
                  checked={settings.learningPreferences.studyReminders}
                  onCheckedChange={(checked) => updateSetting('learningPreferences.studyReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Contenu adaptatif</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajuste automatiquement la difficulté selon vos performances
                  </p>
                </div>
                <Switch
                  checked={settings.learningPreferences.adaptiveContent}
                  onCheckedChange={(checked) => updateSetting('learningPreferences.adaptiveContent', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={resetSettings}>
            Réinitialiser
          </Button>
          
          <div className="flex gap-2">
            {isChanged && (
              <Badge variant="secondary" className="mr-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Modifications non sauvegardées
              </Badge>
            )}
            <Button onClick={saveSettings} disabled={!isChanged}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};