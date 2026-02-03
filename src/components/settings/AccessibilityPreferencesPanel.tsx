import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Type, 
  Volume2, 
  Zap, 
  RotateCcw,
  Download,
  Upload,
  Accessibility,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAccessibilityPreferences, AccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { toast } from 'sonner';

/**
 * Panneau de configuration des préférences d'accessibilité
 */
export const AccessibilityPreferencesPanel: React.FC = () => {
  const {
    preferences,
    isLoading,
    updatePreference,
    resetToDefaults,
    exportPreferences,
    importPreferences,
    fontFamilies,
    fontSizes,
    lineSpacings,
    difficulties,
  } = useAccessibilityPreferences();

  const handleExport = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-mng-accessibility-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Préférences exportées');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        if (importPreferences(text)) {
          toast.success('Préférences importées');
        } else {
          toast.error('Fichier invalide');
        }
      }
    };
    input.click();
  };

  const fontLabels: Record<AccessibilityPreferences['fontFamily'], string> = {
    default: 'Standard',
    dyslexia: 'Dyslexie (OpenDyslexic)',
    serif: 'Serif (Georgia)',
    mono: 'Monospace',
  };

  const sizeLabels: Record<AccessibilityPreferences['fontSize'], string> = {
    small: 'Petit (14px)',
    medium: 'Normal (16px)',
    large: 'Grand (18px)',
    xlarge: 'Très grand (20px)',
  };

  const spacingLabels: Record<AccessibilityPreferences['lineSpacing'], string> = {
    normal: 'Normal',
    relaxed: 'Aéré',
    loose: 'Très aéré',
  };

  const difficultyLabels: Record<AccessibilityPreferences['defaultDifficulty'], string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    adaptive: 'Adaptatif (IA)',
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Accessibility className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Accessibilité</CardTitle>
              <CardDescription>
                Personnalisez l'expérience selon vos besoins
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" />
              Importer
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Section Typographie */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Typographie</h3>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Police de caractères</Label>
              <RadioGroup
                value={preferences.fontFamily}
                onValueChange={(v) => updatePreference('fontFamily', v as AccessibilityPreferences['fontFamily'])}
                className="grid grid-cols-2 gap-2"
              >
                {fontFamilies.map(font => (
                  <div key={font} className="flex items-center space-x-2">
                    <RadioGroupItem value={font} id={`font-${font}`} />
                    <Label htmlFor={`font-${font}`} className="cursor-pointer">
                      {fontLabels[font]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Taille du texte</Label>
              <RadioGroup
                value={preferences.fontSize}
                onValueChange={(v) => updatePreference('fontSize', v as AccessibilityPreferences['fontSize'])}
                className="grid grid-cols-2 gap-2"
              >
                {fontSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <Label htmlFor={`size-${size}`} className="cursor-pointer">
                      {sizeLabels[size]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Espacement des lignes</Label>
              <RadioGroup
                value={preferences.lineSpacing}
                onValueChange={(v) => updatePreference('lineSpacing', v as AccessibilityPreferences['lineSpacing'])}
                className="flex gap-4"
              >
                {lineSpacings.map(spacing => (
                  <div key={spacing} className="flex items-center space-x-2">
                    <RadioGroupItem value={spacing} id={`spacing-${spacing}`} />
                    <Label htmlFor={`spacing-${spacing}`} className="cursor-pointer">
                      {spacingLabels[spacing]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </motion.section>
        
        <Separator />
        
        {/* Section Audio */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Audio</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Vitesse de lecture</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {preferences.audioSpeed.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[preferences.audioSpeed]}
                onValueChange={([v]) => updatePreference('audioSpeed', v)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x (lent)</span>
                <span>1.0x</span>
                <span>2.0x (rapide)</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Lecture automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Lire automatiquement les contenus audio
                </p>
              </div>
              <Switch
                checked={preferences.autoPlayAudio}
                onCheckedChange={(v) => updatePreference('autoPlayAudio', v)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Descriptions audio</Label>
                <p className="text-sm text-muted-foreground">
                  Activer les descriptions vocales des images
                </p>
              </div>
              <Switch
                checked={preferences.audioDescriptions}
                onCheckedChange={(v) => updatePreference('audioDescriptions', v)}
              />
            </div>
          </div>
        </motion.section>
        
        <Separator />
        
        {/* Section Visuel */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Affichage</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Contraste élevé</Label>
                <p className="text-sm text-muted-foreground">
                  Améliorer la lisibilité du texte
                </p>
              </div>
              <Switch
                checked={preferences.highContrast}
                onCheckedChange={(v) => updatePreference('highContrast', v)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Réduire les animations</Label>
                <p className="text-sm text-muted-foreground">
                  Désactiver les transitions et mouvements
                </p>
              </div>
              <Switch
                checked={preferences.reduceMotion}
                onCheckedChange={(v) => updatePreference('reduceMotion', v)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Grandes zones cliquables</Label>
                <p className="text-sm text-muted-foreground">
                  Augmenter la taille des boutons (min. 48px)
                </p>
              </div>
              <Switch
                checked={preferences.largeClickTargets}
                onCheckedChange={(v) => updatePreference('largeClickTargets', v)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode lecteur d'écran</Label>
                <p className="text-sm text-muted-foreground">
                  Optimiser pour NVDA, VoiceOver, JAWS
                </p>
              </div>
              <Switch
                checked={preferences.screenReaderOptimized}
                onCheckedChange={(v) => updatePreference('screenReaderOptimized', v)}
              />
            </div>
          </div>
        </motion.section>
        
        <Separator />
        
        {/* Section QCM/Exercices */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">QCM & Exercices</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Difficulté par défaut</Label>
              <RadioGroup
                value={preferences.defaultDifficulty}
                onValueChange={(v) => updatePreference('defaultDifficulty', v as AccessibilityPreferences['defaultDifficulty'])}
                className="grid grid-cols-2 gap-2"
              >
                {difficulties.map(diff => (
                  <div key={diff} className="flex items-center space-x-2">
                    <RadioGroupItem value={diff} id={`diff-${diff}`} />
                    <Label htmlFor={`diff-${diff}`} className="cursor-pointer">
                      {difficultyLabels[diff]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Afficher les indices</Label>
                <p className="text-sm text-muted-foreground">
                  Proposer des aides lors des QCM
                </p>
              </div>
              <Switch
                checked={preferences.showHints}
                onCheckedChange={(v) => updatePreference('showHints', v)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Temps prolongé (+50%)</Label>
                  <p className="text-sm text-muted-foreground">
                    Pour les examens chronométrés
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.extendedTime}
                onCheckedChange={(v) => updatePreference('extendedTime', v)}
              />
            </div>
          </div>
        </motion.section>
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            ♿ Ces paramètres sont sauvegardés automatiquement et s'appliquent à toute la plateforme.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityPreferencesPanel;
