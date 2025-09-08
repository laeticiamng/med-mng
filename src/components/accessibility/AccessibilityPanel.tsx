import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from './AccessibilityProvider';
import { Palette, Eye, Zap, Type, Volume2 } from 'lucide-react';

export const AccessibilityPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    announceToScreenReader(`Paramètre ${String(key)} modifié`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="medical-card w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Accessibilité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <label className="medical-label">Contraste élevé</label>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
              aria-label="Activer le contraste élevé"
            />
          </div>

          {/* Focus Visible */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <label className="medical-label">Focus visible</label>
            </div>
            <Switch
              checked={settings.focusVisible}
              onCheckedChange={(checked) => handleSettingChange('focusVisible', checked)}
              aria-label="Améliorer la visibilité du focus"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <label className="medical-label">Réduire les animations</label>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              aria-label="Réduire les animations et mouvements"
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <label className="medical-label">Taille de police</label>
            </div>
            <Select
              value={settings.fontSize}
              onValueChange={(value) => handleSettingChange('fontSize', value)}
            >
              <SelectTrigger aria-label="Sélectionner la taille de police">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petite</SelectItem>
                <SelectItem value="medium">Normale</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                updateSettings({
                  highContrast: false,
                  focusVisible: true,
                  reducedMotion: false,
                  fontSize: 'medium'
                });
                announceToScreenReader('Paramètres d\'accessibilité réinitialisés');
              }}
              className="flex-1"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};