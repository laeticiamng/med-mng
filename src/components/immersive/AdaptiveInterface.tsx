import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Palette, 
  Zap, 
  Eye, 
  Smartphone, 
  Monitor,
  Volume2,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface UserPreference {
  id: string;
  label: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description: string;
  category: 'display' | 'audio' | 'interaction' | 'accessibility';
}

interface AdaptiveSettings {
  theme: 'auto' | 'light' | 'dark';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number;
  animationSpeed: number;
  soundVolume: number;
  particleDensity: number;
  autoSave: boolean;
  smartSuggestions: boolean;
  notificationFrequency: 'minimal' | 'normal' | 'frequent';
}

export const AdaptiveInterface: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdaptiveSettings>({
    theme: 'auto',
    reducedMotion: false,
    highContrast: false,
    fontSize: 100,
    animationSpeed: 100,
    soundVolume: 80,
    particleDensity: 80,
    autoSave: true,
    smartSuggestions: true,
    notificationFrequency: 'normal'
  });

  const preferences: UserPreference[] = [
    {
      id: 'fontSize',
      label: 'Taille du texte',
      value: settings.fontSize,
      type: 'number',
      min: 75,
      max: 150,
      step: 5,
      description: 'Ajustez la taille du texte pour un confort optimal',
      category: 'accessibility'
    },
    {
      id: 'animationSpeed',
      label: 'Vitesse des animations',
      value: settings.animationSpeed,
      type: 'number',
      min: 25,
      max: 200,
      step: 25,
      description: 'Contrôlez la rapidité des animations',
      category: 'interaction'
    },
    {
      id: 'soundVolume',
      label: 'Volume des effets',
      value: settings.soundVolume,
      type: 'number',
      min: 0,
      max: 100,
      step: 10,
      description: 'Niveau sonore des interactions',
      category: 'audio'
    },
    {
      id: 'particleDensity',
      label: 'Densité des particules',
      value: settings.particleDensity,
      type: 'number',
      min: 0,
      max: 100,
      step: 20,
      description: 'Intensité des effets visuels',
      category: 'display'
    }
  ];

  const toggleSettings = [
    {
      id: 'reducedMotion',
      label: 'Mouvement réduit',
      description: 'Limite les animations pour réduire les distractions',
      category: 'accessibility'
    },
    {
      id: 'highContrast',
      label: 'Contraste élevé',
      description: 'Améliore la lisibilité pour une meilleure accessibilité',
      category: 'accessibility'
    },
    {
      id: 'autoSave',
      label: 'Sauvegarde automatique',
      description: 'Sauvegarde automatiquement vos préférences et progression',
      category: 'interaction'
    },
    {
      id: 'smartSuggestions',
      label: 'Suggestions intelligentes',
      description: 'Recommendations personnalisées basées sur votre utilisation',
      category: 'interaction'
    }
  ];

  const updateSetting = (key: keyof AdaptiveSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Appliquer immédiatement certains changements
    switch (key) {
      case 'fontSize':
        document.documentElement.style.fontSize = `${value}%`;
        break;
      case 'reducedMotion':
        document.documentElement.style.setProperty(
          '--animation-duration', 
          value ? '0.01s' : '0.3s'
        );
        break;
      case 'highContrast':
        document.documentElement.classList.toggle('high-contrast', value);
        break;
    }

    toast({
      title: "✨ Préférence mise à jour",
      description: "Votre expérience a été personnalisée !",
    });
  };

  // Détection automatique des préférences système
  useEffect(() => {
    // Préférence de thème système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (settings.theme === 'auto') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    // Détection de mouvement réduit
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      updateSetting('reducedMotion', true);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [settings.theme]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'display': return Monitor;
      case 'audio': return Volume2;
      case 'interaction': return Zap;
      case 'accessibility': return Eye;
      default: return Settings;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'display': return 'text-blue-500';
      case 'audio': return 'text-green-500';
      case 'interaction': return 'text-purple-500';
      case 'accessibility': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const categories = Array.from(new Set([
    ...preferences.map(p => p.category),
    ...toggleSettings.map(t => t.category)
  ]));

  const resetToDefaults = () => {
    setSettings({
      theme: 'auto',
      reducedMotion: false,
      highContrast: false,
      fontSize: 100,
      animationSpeed: 100,
      soundVolume: 80,
      particleDensity: 80,
      autoSave: true,
      smartSuggestions: true,
      notificationFrequency: 'normal'
    });

    // Réinitialiser les styles appliqués
    document.documentElement.style.fontSize = '100%';
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.style.removeProperty('--animation-duration');

    toast({
      title: "🔄 Paramètres réinitialisés",
      description: "Tous les paramètres ont été remis aux valeurs par défaut",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Interface Adaptative
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Personnalisé
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 relative">
          {categories.map(category => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryPrefs = preferences.filter(p => p.category === category);
            const categoryToggles = toggleSettings.filter(t => t.category === category);
            
            return (
              <div key={category} className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <CategoryIcon className={`h-4 w-4 ${getCategoryColor(category)}`} />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                
                {/* Sliders */}
                {categoryPrefs.map(pref => (
                  <div key={pref.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {pref.label}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {pref.value}{pref.type === 'number' && pref.max === 100 ? '%' : ''}
                      </span>
                    </div>
                    <Slider
                      value={[pref.value]}
                      onValueChange={([value]) => updateSetting(pref.id as keyof AdaptiveSettings, value)}
                      max={pref.max}
                      min={pref.min}
                      step={pref.step}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {pref.description}
                    </p>
                  </div>
                ))}
                
                {/* Switches */}
                {categoryToggles.map(toggle => (
                  <div key={toggle.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{toggle.label}</h4>
                      <p className="text-xs text-muted-foreground">
                        {toggle.description}
                      </p>
                    </div>
                    <Switch
                      checked={settings[toggle.id as keyof AdaptiveSettings] as boolean}
                      onCheckedChange={(checked) => 
                        updateSetting(toggle.id as keyof AdaptiveSettings, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            );
          })}

          {/* Thème */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-indigo-500" />
              Thème
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'Auto', icon: Smartphone },
                { id: 'light', label: 'Clair', icon: Sun },
                { id: 'dark', label: 'Sombre', icon: Moon }
              ].map(theme => (
                <Button
                  key={theme.id}
                  variant={settings.theme === theme.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('theme', theme.id)}
                  className="flex items-center gap-2"
                >
                  <theme.icon className="h-4 w-4" />
                  <span className="text-xs">{theme.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};