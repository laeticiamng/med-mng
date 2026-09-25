/**
 * Panneau des paramètres avancés du générateur audio.
 * Chaque réglage est transmis au serveur (mm-generate-music) et a un effet réel :
 * voix (m/f), sons à éviter, intensité du style, originalité.
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
import {
  STYLE_WEIGHT_DEFAUT,
  WEIRDNESS_DEFAUT,
  type VocalGender,
  type AdvancedSunoParams,
} from '@/hooks/music/useAdvancedSunoParams';

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

const PARAM_TOOLTIPS = {
  vocalGender: "Voix masculine ou féminine. « Au choix » laisse le service décider.",
  negativeTags: "Sons ou styles à éviter, en anglais, séparés par des virgules (ex. : autotune, distortion, noise). Ils s'ajoutent aux exclusions déjà prévues pour le style.",
  styleWeight: "Fidélité au style choisi. Plus élevé = style plus marqué, moins de surprises (défaut 70 %).",
  weirdnessConstraint: "Originalité. Plus élevé = résultat plus inattendu, parfois moins lisible pour réviser (défaut 30 %)."
};

const SUGGESTIONS_EXCLUSIONS = ['autotune', 'distortion', 'noise', 'whispering'];

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
  const styleWeight = params.styleWeight ?? STYLE_WEIGHT_DEFAUT;
  const weirdness = params.weirdnessConstraint ?? WEIRDNESS_DEFAUT;

  const modifiedCount = [
    params.vocalGender,
    params.negativeTags?.trim(),
    styleWeight !== STYLE_WEIGHT_DEFAUT ? styleWeight : null,
    weirdness !== WEIRDNESS_DEFAUT ? weirdness : null,
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
            <TranslatedText text="Réglages avancés (voix, exclusions, intensité)" />
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
            {/* Voix */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-2 cursor-help">
                    <Mic2 className="h-4 w-4" />
                    <TranslatedText text="Voix" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.vocalGender}</p>
                </TooltipContent>
              </Tooltip>
              <Select
                value={params.vocalGender || 'auto'}
                onValueChange={(v) => onSetVocalGender(v === 'm' || v === 'f' ? v : undefined)}
              >
                <SelectTrigger className="w-full" aria-label="Voix">
                  <SelectValue placeholder="Au choix du service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Wand2 className="h-3 w-3" />
                      Au choix du service (recommandé)
                    </span>
                  </SelectItem>
                  <SelectItem value="m">Voix masculine</SelectItem>
                  <SelectItem value="f">Voix féminine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exclusions */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-2 cursor-help">
                    <Music2 className="h-4 w-4" />
                    <TranslatedText text="Sons à éviter" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.negativeTags}</p>
                </TooltipContent>
              </Tooltip>
              <Input
                value={params.negativeTags || ''}
                onChange={(e) => onSetNegativeTags(e.target.value)}
                placeholder="ex. : autotune, distortion, noise"
                className="text-sm"
                maxLength={300}
              />
              <div className="flex flex-wrap gap-1">
                {SUGGESTIONS_EXCLUSIONS.map(tag => (
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

            {/* Intensité du style */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between cursor-help">
                    <Label className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <TranslatedText text="Fidélité au style" />
                    </Label>
                    <span className="text-sm font-medium text-primary">{styleWeight} %</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.styleWeight}</p>
                </TooltipContent>
              </Tooltip>
              <Slider
                value={[styleWeight]}
                onValueChange={([v]) => onSetStyleWeight(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
                aria-label="Fidélité au style"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Libre (0 %)</span>
                <span>Défaut 70 %</span>
                <span>Très marqué (100 %)</span>
              </div>
            </div>

            {/* Originalité */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between cursor-help">
                    <Label><TranslatedText text="Originalité" /></Label>
                    <span className="text-sm font-medium text-primary">{weirdness} %</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{PARAM_TOOLTIPS.weirdnessConstraint}</p>
                </TooltipContent>
              </Tooltip>
              <Slider
                value={[weirdness]}
                onValueChange={([v]) => onSetWeirdnessConstraint(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
                aria-label="Originalité"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Classique (0 %)</span>
                <span>Défaut 30 %</span>
                <span>Expérimental (100 %)</span>
              </div>
            </div>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
            disabled={modifiedCount === 0}
          >
            <TranslatedText text="Réinitialiser les réglages" />
            {modifiedCount > 0 && ` (${modifiedCount})`}
          </Button>
        </PremiumCard>
      </CollapsibleContent>
    </Collapsible>
  );
};
