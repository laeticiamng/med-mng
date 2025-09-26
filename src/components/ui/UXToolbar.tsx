import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  Zap,
  Eye,
  Navigation,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface UXSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  volume: number;
  animations: boolean;
  density: 'compact' | 'normal' | 'comfortable';
  focusMode: boolean;
  autoSave: boolean;
}

const defaultSettings: UXSettings = {
  theme: 'system',
  soundEnabled: true,
  volume: 70,
  animations: true,
  density: 'normal',
  focusMode: false,
  autoSave: true
};

export const UXToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<UXSettings>(() => {
    const saved = localStorage.getItem('ux-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply other settings
    if (settings.animations) {
      root.classList.remove('reduce-motion');
    } else {
      root.classList.add('reduce-motion');
    }

    if (settings.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Density
    root.classList.remove('density-compact', 'density-comfortable');
    if (settings.density !== 'normal') {
      root.classList.add(`density-${settings.density}`);
    }

    // Save settings
    localStorage.setItem('ux-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof UXSettings>(
    key: K, 
    value: UXSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className={cn(
      "fixed bottom-20 right-4 z-40 transition-all duration-300",
      isExpanded ? "w-80" : "w-auto"
    )}>
      <Card className="shadow-lg border bg-background/95 backdrop-blur">
        <CardContent className="p-3">
          {/* Main toolbar */}
          <div className="flex items-center gap-2">
            {/* Quick Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateSetting('theme', 'light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  Clair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSetting('theme', 'dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  Sombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSetting('theme', 'system')}>
                  <Monitor className="h-4 w-4 mr-2" />
                  Système
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            >
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>

            {/* Focus Mode */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", settings.focusMode && "bg-primary text-primary-foreground")}
              onClick={() => updateSetting('focusMode', !settings.focusMode)}
              title="Mode focus"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Animation Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", settings.animations && "bg-primary text-primary-foreground")}
              onClick={() => updateSetting('animations', !settings.animations)}
              title="Animations"
            >
              <Zap className="h-4 w-4" />
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Expanded Settings */}
          {isExpanded && (
            <div className="mt-4 space-y-4 border-t pt-4">
              {/* Volume Control */}
              {settings.soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <Badge variant="outline" className="text-xs">
                      {settings.volume}%
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([value]) => updateSetting('volume', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                  />
                </div>
              )}

              {/* Density */}
              <div>
                <label className="text-sm font-medium mb-2 block">Densité</label>
                <div className="flex gap-1">
                  {(['compact', 'normal', 'comfortable'] as const).map((density) => (
                    <Button
                      key={density}
                      variant={settings.density === density ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => updateSetting('density', density)}
                    >
                      {density === 'compact' && 'Compact'}
                      {density === 'normal' && 'Normal'}
                      {density === 'comfortable' && 'Confortable'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sauvegarde auto</label>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mode focus</label>
                  <Switch
                    checked={settings.focusMode}
                    onCheckedChange={(checked) => updateSetting('focusMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Animations</label>
                  <Switch
                    checked={settings.animations}
                    onCheckedChange={(checked) => updateSetting('animations', checked)}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Navigation className="h-3 w-3 mr-1" />
                    Raccourcis
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Palette className="h-3 w-3 mr-1" />
                    Thèmes
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Paramètres synchronisés
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UXToolbar;