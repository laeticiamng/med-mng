/**
 * Panel de paramètres avancés Suno V4.5+
 * Affiche vocalGender, negativeTags, styleWeight, etc.
 */

import React from 'react';
import { ChevronDown, ChevronUp, Music2, Mic2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { type VocalGender, type AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';

interface AdvancedSunoParamsPanelProps {
  params: AdvancedSunoParams;
  isEnabled: boolean;
  onToggleEnabled: () => void;
  onSetVocalGender: (gender: VocalGender | undefined) => void;
  onSetNegativeTags: (tags: string) => void;
  onSetStyleWeight: (weight: number) => void;
  onSetWeirdnessConstraint: (constraint: number) => void;
  onReset: () => void;
}

export const AdvancedSunoParamsPanel: React.FC<AdvancedSunoParamsPanelProps> = ({
  params,
  isEnabled,
  onToggleEnabled,
  onSetVocalGender,
  onSetNegativeTags,
  onSetStyleWeight,
  onSetWeirdnessConstraint,
  onReset
}) => {
  return (
    <Collapsible open={isEnabled} onOpenChange={onToggleEnabled}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <TranslatedText text="Paramètres avancés Suno" />
            {isEnabled && (
              <Badge variant="secondary" className="text-xs">V4.5+</Badge>
            )}
          </span>
          {isEnabled ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <PremiumCard variant="glass" className="p-4 mt-2 space-y-4">
          {/* Vocal Gender */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mic2 className="h-4 w-4" />
              <TranslatedText text="Genre vocal" />
            </Label>
            <Select 
              value={params.vocalGender || 'auto'} 
              onValueChange={(v) => onSetVocalGender(v === 'auto' ? undefined : v as VocalGender)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Auto-détection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-détection</SelectItem>
                <SelectItem value="male">Masculin</SelectItem>
                <SelectItem value="female">Féminin</SelectItem>
                <SelectItem value="mixed">Mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Negative Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              <TranslatedText text="Tags à éviter" />
            </Label>
            <Input
              value={params.negativeTags || ''}
              onChange={(e) => onSetNegativeTags(e.target.value)}
              placeholder="ex: autotune, distortion, noise"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              <TranslatedText text="Séparés par des virgules. Ex: autotune, distortion" />
            </p>
          </div>

          {/* Style Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label><TranslatedText text="Intensité du style" /></Label>
              <span className="text-sm text-muted-foreground">{params.styleWeight}%</span>
            </div>
            <Slider
              value={[params.styleWeight || 50]}
              onValueChange={([v]) => onSetStyleWeight(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtil</span>
              <span>Prononcé</span>
            </div>
          </div>

          {/* Weirdness Constraint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label><TranslatedText text="Originalité" /></Label>
              <span className="text-sm text-muted-foreground">{params.weirdnessConstraint}%</span>
            </div>
            <Slider
              value={[params.weirdnessConstraint || 30]}
              onValueChange={([v]) => onSetWeirdnessConstraint(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Classique</span>
              <span>Expérimental</span>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            <TranslatedText text="Réinitialiser" />
          </Button>
        </PremiumCard>
      </CollapsibleContent>
    </Collapsible>
  );
};
