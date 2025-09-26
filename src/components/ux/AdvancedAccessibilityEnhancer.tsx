import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Contrast, 
  Type, 
  MousePointer,
  Keyboard,
  Focus,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  // Visual
  fontSize: number;
  contrast: 'normal' | 'high' | 'low';
  colorScheme: 'auto' | 'light' | 'dark' | 'monochrome';
  reducedMotion: boolean;
  focusIndicator: 'normal' | 'enhanced' | 'high-contrast';
  
  // Motor
  clickDelay: number;
  stickyKeys: boolean;
  mouseKeys: boolean;
  cursorSize: number;
  
  // Cognitive
  readingGuide: boolean;
  simplicityMode: boolean;
  distractionFree: boolean;
  
  // Audio
  soundEnabled: boolean;
  audioFeedback: boolean;
  volume: number;
  
  // Screen Reader
  screenReaderOptimized: boolean;
  announcements: boolean;
}

interface AdvancedAccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isAccessibilityPanelOpen: boolean;
  toggleAccessibilityPanel: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  contrast: 'normal',
  colorScheme: 'auto',
  reducedMotion: false,
  focusIndicator: 'normal',
  clickDelay: 0,
  stickyKeys: false,
  mouseKeys: false,
  cursorSize: 1,
  readingGuide: false,
  simplicityMode: false,
  distractionFree: false,
  soundEnabled: true,
  audioFeedback: false,
  volume: 0.7,
  screenReaderOptimized: false,
  announcements: true
};

const AdvancedAccessibilityContext = createContext<AdvancedAccessibilityContextType | undefined>(undefined);

export const useAdvancedAccessibility = () => {
  const context = useContext(AdvancedAccessibilityContext);
  if (!context) {
    throw new Error('useAdvancedAccessibility must be used within AdvancedAccessibilityProvider');
  }
  return context;
};

export const AdvancedAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('advanced-accessibility-settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('advanced-accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS custom properties based on settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
    
    // Cursor size
    root.style.setProperty('--accessibility-cursor-size', `${settings.cursorSize}`);
    
    // Apply classes
    root.classList.toggle('high-contrast', settings.contrast === 'high');
    root.classList.toggle('low-contrast', settings.contrast === 'low');
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('enhanced-focus', settings.focusIndicator === 'enhanced');
    root.classList.toggle('high-contrast-focus', settings.focusIndicator === 'high-contrast');
    root.classList.toggle('reading-guide', settings.readingGuide);
    root.classList.toggle('simplicity-mode', settings.simplicityMode);
    root.classList.toggle('distraction-free', settings.distractionFree);
    root.classList.toggle('screen-reader-optimized', settings.screenReaderOptimized);
    
    // Color scheme
    if (settings.colorScheme !== 'auto') {
      root.classList.remove('light', 'dark', 'monochrome');
      root.classList.add(settings.colorScheme);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('advanced-accessibility-settings');
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.announcements]);

  const toggleAccessibilityPanel = useCallback(() => {
    setIsAccessibilityPanelOpen(prev => !prev);
  }, []);

  return (
    <AdvancedAccessibilityContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      announceToScreenReader,
      isAccessibilityPanelOpen,
      toggleAccessibilityPanel
    }}>
      {children}
      <AccessibilityPanel />
      <AccessibilityToggleButton />
    </AdvancedAccessibilityContext.Provider>
  );
};

// Floating accessibility toggle button
const AccessibilityToggleButton: React.FC = () => {
  const { toggleAccessibilityPanel, isAccessibilityPanelOpen } = useAdvancedAccessibility();

  return (
    <Button
      onClick={toggleAccessibilityPanel}
      className={cn(
        "fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 p-0",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "shadow-lg hover:shadow-xl transition-all duration-200",
        isAccessibilityPanelOpen && "bg-primary/90"
      )}
      aria-label="Ouvrir les options d'accessibilité"
    >
      <Accessibility className="h-6 w-6" />
    </Button>
  );
};

// Main accessibility panel
const AccessibilityPanel: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    resetSettings, 
    isAccessibilityPanelOpen, 
    toggleAccessibilityPanel 
  } = useAdvancedAccessibility();

  if (!isAccessibilityPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-4 top-4 bottom-4 w-80 bg-card border border-border rounded-lg shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibilité
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAccessibilityPanel}
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Visual Settings */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visuel
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Taille de police: {settings.fontSize}px
                </label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contraste</label>
                <Select
                  value={settings.contrast}
                  onValueChange={(value) => updateSetting('contrast', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Thème</label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value) => updateSetting('colorScheme', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatique</SelectItem>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Réduire les animations</label>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
            </div>
          </section>

          {/* Motor Settings */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Moteur
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Délai de clic: {settings.clickDelay}ms
                </label>
                <Slider
                  value={[settings.clickDelay]}
                  onValueChange={([value]) => updateSetting('clickDelay', value)}
                  min={0}
                  max={2000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Taille du curseur: {settings.cursorSize}x
                </label>
                <Slider
                  value={[settings.cursorSize]}
                  onValueChange={([value]) => updateSetting('cursorSize', value)}
                  min={1}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Touches rémanentes</label>
                <Switch
                  checked={settings.stickyKeys}
                  onCheckedChange={(checked) => updateSetting('stickyKeys', checked)}
                />
              </div>
            </div>
          </section>

          {/* Cognitive Settings */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Focus className="h-4 w-4" />
              Cognitif
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Guide de lecture</label>
                <Switch
                  checked={settings.readingGuide}
                  onCheckedChange={(checked) => updateSetting('readingGuide', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode simplifié</label>
                <Switch
                  checked={settings.simplicityMode}
                  onCheckedChange={(checked) => updateSetting('simplicityMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sans distraction</label>
                <Switch
                  checked={settings.distractionFree}
                  onCheckedChange={(checked) => updateSetting('distractionFree', checked)}
                />
              </div>
            </div>
          </section>

          {/* Audio Settings */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Son activé</label>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Retour audio</label>
                <Switch
                  checked={settings.audioFeedback}
                  onCheckedChange={(checked) => updateSetting('audioFeedback', checked)}
                />
              </div>

              {settings.soundEnabled && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Volume: {Math.round(settings.volume * 100)}%
                  </label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([value]) => updateSetting('volume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Screen Reader */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Lecteur d'écran
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode optimisé</label>
                <Switch
                  checked={settings.screenReaderOptimized}
                  onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Annonces</label>
                <Switch
                  checked={settings.announcements}
                  onCheckedChange={(checked) => updateSetting('announcements', checked)}
                />
              </div>
            </div>
          </section>

          {/* Reset */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="w-full"
            >
              Réinitialiser les paramètres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};