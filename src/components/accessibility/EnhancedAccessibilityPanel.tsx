import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Type, 
  Volume2, 
  Palette, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';

/**
 * Panneau d'accessibilité renforcé avec :
 * - Police OpenDyslexic
 * - Mode contraste élevé
 * - Contrôle de la vitesse audio
 * - Options de lecture améliorées
 */
export const EnhancedAccessibilityPanel: React.FC = () => {
  const { preferences, updatePreference, resetToDefaults, isLoading } = useAccessibilityPreferences();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const fontSizeValue = {
    small: 80,
    medium: 100,
    large: 120,
    xlarge: 140
  }[preferences.fontSize] || 100;

  const lineHeightLabel = {
    normal: 'Normal (1.5)',
    relaxed: 'Aéré (1.75)',
    loose: 'Très aéré (2.0)'
  }[preferences.lineSpacing] || 'Normal';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Accessibilité Renforcée
        </CardTitle>
        <CardDescription>
          Personnalisez l'interface selon vos besoins visuels et auditifs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Lecture */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
            <Type className="h-4 w-4" />
            Lecture et Typographie
          </h4>
          
          {/* Police Dyslexie */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dyslexia-font" className="font-medium">
                Police OpenDyslexic
              </Label>
              <p className="text-xs text-muted-foreground">
                Police conçue pour faciliter la lecture aux personnes dyslexiques
              </p>
            </div>
            <Switch
              id="dyslexia-font"
              checked={preferences.fontFamily === 'dyslexia'}
              onCheckedChange={(checked) => updatePreference('fontFamily', checked ? 'dyslexia' : 'default')}
            />
          </div>

          {/* Taille du texte */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="font-medium">Taille du texte</Label>
              <span className="text-sm text-muted-foreground">{fontSizeValue}%</span>
            </div>
            <Select
              value={preferences.fontSize}
              onValueChange={(value) => updatePreference('fontSize', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petit (80%)</SelectItem>
                <SelectItem value="medium">Normal (100%)</SelectItem>
                <SelectItem value="large">Grand (120%)</SelectItem>
                <SelectItem value="xlarge">Très grand (140%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interligne */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="font-medium">Espacement des lignes</Label>
              <span className="text-sm text-muted-foreground">{lineHeightLabel}</span>
            </div>
            <Select
              value={preferences.lineSpacing}
              onValueChange={(value) => updatePreference('lineSpacing', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (1.5)</SelectItem>
                <SelectItem value="relaxed">Aéré (1.75)</SelectItem>
                <SelectItem value="loose">Très aéré (2.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section Contraste */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            Contraste et Couleurs
          </h4>
          
          {/* Mode contraste élevé */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="font-medium">
                Mode contraste élevé
              </Label>
              <p className="text-xs text-muted-foreground">
                Augmente le contraste pour une meilleure lisibilité
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            />
          </div>

          {/* Réduction des animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="font-medium">
                Réduire les animations
              </Label>
              <p className="text-xs text-muted-foreground">
                Désactive les animations pour réduire les distractions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reduceMotion}
              onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
            />
          </div>

          {/* Grandes cibles de clic */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-targets" className="font-medium">
                Grandes zones cliquables
              </Label>
              <p className="text-xs text-muted-foreground">
                Agrandit les boutons et liens pour faciliter le clic
              </p>
            </div>
            <Switch
              id="large-targets"
              checked={preferences.largeClickTargets}
              onCheckedChange={(checked) => updatePreference('largeClickTargets', checked)}
            />
          </div>
        </div>

        {/* Section Audio */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            Audio et Lecture
          </h4>
          
          {/* Vitesse audio */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="font-medium">Vitesse de lecture audio</Label>
              <span className="text-sm text-muted-foreground">{preferences.audioSpeed}x</span>
            </div>
            <Slider
              value={[preferences.audioSpeed]}
              onValueChange={([value]) => updatePreference('audioSpeed', value)}
              min={0.5}
              max={2.0}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>

          {/* Descriptions audio */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audio-descriptions" className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descriptions audio
              </Label>
              <p className="text-xs text-muted-foreground">
                Active les descriptions audio pour le contenu visuel
              </p>
            </div>
            <Switch
              id="audio-descriptions"
              checked={preferences.audioDescriptions}
              onCheckedChange={(checked) => updatePreference('audioDescriptions', checked)}
            />
          </div>

          {/* Optimisation lecteur d'écran */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader" className="font-medium">
                Optimisé lecteur d'écran
              </Label>
              <p className="text-xs text-muted-foreground">
                Améliore la compatibilité avec les lecteurs d'écran
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={preferences.screenReaderOptimized}
              onCheckedChange={(checked) => updatePreference('screenReaderOptimized', checked)}
            />
          </div>
        </div>

        {/* Bouton reset */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réinitialiser les préférences
          </Button>
        </div>

        {/* Aperçu en direct */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h5 className="font-medium mb-2">Aperçu</h5>
          <p 
            className="text-sm"
            style={{
              fontFamily: preferences.fontFamily === 'dyslexia' ? 'OpenDyslexic, sans-serif' : 'inherit',
              fontSize: `${fontSizeValue}%`,
              lineHeight: preferences.lineSpacing === 'normal' ? 1.5 : 
                         preferences.lineSpacing === 'relaxed' ? 1.75 : 2.0,
            }}
          >
            Ceci est un aperçu du texte avec vos préférences actuelles. 
            Le syndrome de Guillain-Barré est une polyradiculonévrite aiguë...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAccessibilityPanel;
