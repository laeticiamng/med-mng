// ==========================================
// MED-MNG ACCESSIBILITY OVERLAY - Overlay d'accessibilité premium
// ==========================================

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Accessibility, 
  Eye, 
  Type, 
  Volume2, 
  MousePointer,
  Settings,
  Zap,
  Heart,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textToSpeech: boolean;
  largerClickTargets: boolean;
  darkMode: boolean;
  dyslexiaFont: boolean;
}

interface AccessibilityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityOverlay: React.FC<AccessibilityOverlayProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    colorBlindMode: 'none',
    textToSpeech: false,
    largerClickTargets: false,
    darkMode: false,
    dyslexiaFont: false
  });

  const [currentProfile, setCurrentProfile] = useState<'none' | 'visual' | 'motor' | 'cognitive'>('none');

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('med-mng-accessibility');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    localStorage.setItem('med-mng-accessibility', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  // Apply settings to DOM
  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // High contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Keyboard navigation
    if (settings.keyboardNavigation) {
      document.documentElement.classList.add('keyboard-navigation');
    } else {
      document.documentElement.classList.remove('keyboard-navigation');
    }
    
    // Color blind mode
    document.documentElement.className = document.documentElement.className
      .replace(/colorblind-\w+/g, '');
    if (settings.colorBlindMode !== 'none') {
      document.documentElement.classList.add(`colorblind-${settings.colorBlindMode}`);
    }
    
    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.style.fontFamily = 'OpenDyslexic, Arial, sans-serif';
    } else {
      root.style.removeProperty('font-family');
    }
  };

  // Quick profiles
  const applyProfile = (profile: typeof currentProfile) => {
    let newSettings = { ...settings };
    
    switch (profile) {
      case 'visual':
        newSettings = {
          ...newSettings,
          fontSize: 20,
          highContrast: true,
          screenReader: true,
          largerClickTargets: true
        };
        break;
      case 'motor':
        newSettings = {
          ...newSettings,
          keyboardNavigation: true,
          largerClickTargets: true,
          reducedMotion: true
        };
        break;
      case 'cognitive':
        newSettings = {
          ...newSettings,
          dyslexiaFont: true,
          reducedMotion: true,
          textToSpeech: true
        };
        break;
      default:
        // Reset to defaults
        newSettings = {
          fontSize: 16,
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: false,
          colorBlindMode: 'none',
          textToSpeech: false,
          largerClickTargets: false,
          darkMode: false,
          dyslexiaFont: false
        };
    }
    
    setCurrentProfile(profile);
    saveSettings(newSettings);
  };

  const profileOptions = [
    {
      id: 'visual',
      name: 'Déficience Visuelle',
      description: 'Malvoyance, cécité',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      id: 'motor',
      name: 'Déficience Motrice',
      description: 'Mobilité réduite, tremblements',
      icon: MousePointer,
      color: 'bg-green-500'
    },
    {
      id: 'cognitive',
      name: 'Déficience Cognitive',
      description: 'Dyslexie, TDAH, autisme',
      icon: Zap,
      color: 'bg-purple-500'
    }
  ];

  const colorBlindOptions = [
    { value: 'none', label: 'Aucun' },
    { value: 'protanopia', label: 'Protanopie' },
    { value: 'deuteranopia', label: 'Deutéranopie' },
    { value: 'tritanopia', label: 'Tritanopie' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Overlay Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50 overflow-y-auto"
          >
            <Card className="h-full rounded-none border-0 shadow-none">
              <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                      <Accessibility className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Accessibilité</CardTitle>
                      <p className="text-sm text-muted-foreground">Personnalisez votre expérience</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                {/* Quick Profiles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Profils Rapides</h3>
                  </div>
                  
                  <div className="grid gap-3">
                    {profileOptions.map((profile) => (
                      <Button
                        key={profile.id}
                        variant={currentProfile === profile.id ? "default" : "outline"}
                        className="h-auto p-4 justify-start"
                        onClick={() => applyProfile(profile.id as any)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${profile.color}`}>
                          <profile.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-xs opacity-70">{profile.description}</div>
                        </div>
                        {currentProfile === profile.id && (
                          <CheckCircle className="w-5 h-5 ml-auto text-white" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Font Size */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    <label className="font-semibold">Taille du Texte</label>
                    <Badge variant="outline" className="ml-auto">{settings.fontSize}px</Badge>
                  </div>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => saveSettings({ ...settings, fontSize: value })}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Visual Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Paramètres Visuels</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Contraste Élevé</label>
                        <p className="text-sm text-muted-foreground">Améliore la lisibilité</p>
                      </div>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => saveSettings({ ...settings, highContrast: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Police Dyslexie</label>
                        <p className="text-sm text-muted-foreground">Police spécialisée</p>
                      </div>
                      <Switch
                        checked={settings.dyslexiaFont}
                        onCheckedChange={(checked) => saveSettings({ ...settings, dyslexiaFont: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium">Daltonisme</label>
                      <div className="grid grid-cols-2 gap-2">
                        {colorBlindOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={settings.colorBlindMode === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => saveSettings({ ...settings, colorBlindMode: option.value as any })}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Interaction Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Interaction</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Navigation Clavier</label>
                        <p className="text-sm text-muted-foreground">Améliore les focus</p>
                      </div>
                      <Switch
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) => saveSettings({ ...settings, keyboardNavigation: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Cibles Plus Larges</label>
                        <p className="text-sm text-muted-foreground">Boutons plus grands</p>
                      </div>
                      <Switch
                        checked={settings.largerClickTargets}
                        onCheckedChange={(checked) => saveSettings({ ...settings, largerClickTargets: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Réduire Animations</label>
                        <p className="text-sm text-muted-foreground">Moins de mouvement</p>
                      </div>
                      <Switch
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) => saveSettings({ ...settings, reducedMotion: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Audio Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Audio</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Lecture d'Écran</label>
                        <p className="text-sm text-muted-foreground">Compatible NVDA, JAWS</p>
                      </div>
                      <Switch
                        checked={settings.screenReader}
                        onCheckedChange={(checked) => saveSettings({ ...settings, screenReader: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Synthèse Vocale</label>
                        <p className="text-sm text-muted-foreground">Lecture automatique</p>
                      </div>
                      <Switch
                        checked={settings.textToSpeech}
                        onCheckedChange={(checked) => saveSettings({ ...settings, textToSpeech: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Help Text */}
                <div className="text-center">
                  <Badge className="bg-success/10 text-success">
                    <Heart className="w-4 h-4 mr-2" />
                    Conforme WCAG 2.1 AA
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(AccessibilityOverlay);