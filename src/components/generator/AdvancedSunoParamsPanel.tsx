/**
 * Panel de paramètres avancés Suno V4.5+
 * ✅ AMÉLIORÉ: Ajout audioWeight slider + meilleurs labels
 */

import React from 'react';
import { ChevronDown, ChevronUp, Music2, Mic2, Sliders, Gauge, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type VocalGender, type AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';

interface AdvancedSunoParamsPanelProps {
  params: AdvancedSunoParams;
  isEnabled: boolean;
  onToggleEnabled: () => void;
  onSetVocalGender: (gender: VocalGender | undefined) => void;
  onSetNegativeTags: (tags: string) => void;
  onSetStyleWeight: (weight: number) => void;
  onSetWeirdnessConstraint: (constraint: number) => void;
  onSetAudioWeight?: (weight: number) => void;
  onReset: () => void;
}

// Tooltips explicatifs pour chaque paramètre
const PARAM_TOOLTIPS = {
  vocalGender: "Choisir le type de voix préféré pour la génération. 'Auto' laisse l'IA décider.",
  negativeTags: "Styles ou sons à éviter dans la génération. Exemples: autotune, distortion, noise, screaming",
  styleWeight: "Contrôle l'intensité du style musical. Plus élevé = style plus prononcé mais moins de variations.",
  weirdnessConstraint: "Niveau d'expérimentation. Plus élevé = résultats plus originaux mais potentiellement moins cohérents.",
  audioWeight: "Influence de l'audio de référence (si fourni). Plus élevé = plus proche de la référence."
};

export const AdvancedSunoParamsPanel: React.FC<AdvancedSunoParamsPanelProps> = ({
  params,
  isEnabled,
  onToggleEnabled,
  onSetVocalGender,
  onSetNegativeTags,
  onSetStyleWeight,
  onSetWeirdnessConstraint,
  onSetAudioWeight,
  onReset
}) => {
  // Compter les paramètres modifiés
  const modifiedCount = [
    params.vocalGender,
    params.negativeTags?.trim(),
    params.styleWeight !== 50 ? params.styleWeight : null,
    params.weirdnessConstraint !== 30 ? params.weirdnessConstraint : null,
    params.audioWeight !== 50 ? params.audioWeight : null
  ].filter(Boolean).length;

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
            {modifiedCount > 0 && (
              <Badge variant="default" className="text-xs">{modifiedCount} modifié{modifiedCount > 1 ? 's' : ''}</Badge>
            )}
          </span>
          {isEnabled ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <PremiumCard variant="glass" className="p-4 mt-2 space-y-5">
          <TooltipProvider>
            {/* Vocal Gender */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-2 cursor-help">
                    <Mic2 className="h-4 w-4" />
                    <TranslatedText text="Genre vocal" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.vocalGender}</p>
                </TooltipContent>
              </Tooltip>
              <Select 
                value={params.vocalGender || 'auto'} 
                onValueChange={(v) => onSetVocalGender(v === 'auto' ? undefined : v as VocalGender)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Auto-détection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Wand2 className="h-3 w-3" />
                      Auto-détection (recommandé)
                    </span>
                  </SelectItem>
                  <SelectItem value="male">Masculin</SelectItem>
                  <SelectItem value="female">Féminin</SelectItem>
                  <SelectItem value="mixed">Mixte / Duo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Negative Tags */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-2 cursor-help">
                    <Music2 className="h-4 w-4" />
                    <TranslatedText text="Tags à éviter" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.negativeTags}</p>
                </TooltipContent>
              </Tooltip>
              <Input
                value={params.negativeTags || ''}
                onChange={(e) => onSetNegativeTags(e.target.value)}
                placeholder="ex: autotune, distortion, noise"
                className="text-sm"
              />
              <div className="flex flex-wrap gap-1">
                {['autotune', 'distortion', 'screaming', 'noise'].map(tag => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const current = params.negativeTags || '';
                      const tags = current.split(',').map(t => t.trim()).filter(Boolean);
                      if (!tags.includes(tag)) {
                        onSetNegativeTags([...tags, tag].join(', '));
                      }
                    }}
                  >
                    +{tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Style Weight */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between cursor-help">
                    <Label className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <TranslatedText text="Intensité du style" />
                    </Label>
                    <span className="text-sm font-medium text-primary">{params.styleWeight}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.styleWeight}</p>
                </TooltipContent>
              </Tooltip>
              <Slider
                value={[params.styleWeight || 50]}
                onValueChange={([v]) => onSetStyleWeight(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtil (0%)</span>
                <span>Équilibré</span>
                <span>Prononcé (100%)</span>
              </div>
            </div>

            {/* Weirdness Constraint */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between cursor-help">
                    <Label><TranslatedText text="Originalité / Créativité" /></Label>
                    <span className="text-sm font-medium text-primary">{params.weirdnessConstraint}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.weirdnessConstraint}</p>
                </TooltipContent>
              </Tooltip>
              <Slider
                value={[params.weirdnessConstraint || 30]}
                onValueChange={([v]) => onSetWeirdnessConstraint(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Classique (0%)</span>
                <span>Équilibré</span>
                <span>Expérimental (100%)</span>
              </div>
            </div>

            {/* Audio Weight (si callback fourni) */}
            {onSetAudioWeight && (
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between cursor-help">
                      <Label><TranslatedText text="Poids audio référence" /></Label>
                      <span className="text-sm font-medium text-primary">{params.audioWeight || 50}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">{PARAM_TOOLTIPS.audioWeight}</p>
                  </TooltipContent>
                </Tooltip>
                <Slider
                  value={[params.audioWeight || 50]}
                  onValueChange={([v]) => onSetAudioWeight(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Libre (0%)</span>
                  <span>Équilibré</span>
                  <span>Fidèle (100%)</span>
                </div>
              </div>
            )}
          </TooltipProvider>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
            disabled={modifiedCount === 0}
          >
            <TranslatedText text="Réinitialiser les paramètres" />
            {modifiedCount > 0 && ` (${modifiedCount})`}
          </Button>
        </PremiumCard>
      </CollapsibleContent>
    </Collapsible>
  );
};
