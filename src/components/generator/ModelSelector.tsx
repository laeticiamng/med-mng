/**
 * Sélecteur de modèle Suno avec sauvegarde des préférences
 * ✅ NOUVEAU: Support V5, descriptions, recommandations
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Clock, Crown } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';

interface ModelInfo {
  value: SunoModel;
  label: string;
  description: string;
  maxDuration: string;
  speed: 'fast' | 'normal' | 'slow';
  quality: 'good' | 'great' | 'best';
  recommended?: boolean;
  new?: boolean;
}

const MODELS: ModelInfo[] = [
  {
    value: 'V4',
    label: 'Suno V4',
    description: 'Qualité audio optimale, génération rapide',
    maxDuration: '4 min',
    speed: 'fast',
    quality: 'good'
  },
  {
    value: 'V4_5',
    label: 'Suno V4.5',
    description: 'Meilleur mélange de genres, durée étendue',
    maxDuration: '8 min',
    speed: 'normal',
    quality: 'great'
  },
  {
    value: 'V4_5ALL',
    label: 'Suno V4.5 ALL',
    description: 'Meilleure structure de chanson, recommandé pour l\'éducation',
    maxDuration: '8 min',
    speed: 'normal',
    quality: 'best',
    recommended: true
  },
  {
    value: 'V4_5PLUS',
    label: 'Suno V4.5+',
    description: 'Son enrichi, nouvelles fonctionnalités créatives',
    maxDuration: '8 min',
    speed: 'slow',
    quality: 'best'
  },
  {
    value: 'V5',
    label: 'Suno V5',
    description: 'Expression musicale supérieure, dernière génération',
    maxDuration: '10 min',
    speed: 'fast',
    quality: 'best',
    new: true
  }
];

interface ModelSelectorProps {
  value: SunoModel;
  onChange: (model: SunoModel) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  compact = false
}) => {
  const selectedModel = MODELS.find(m => m.value === value) || MODELS[2];

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Zap className="h-3 w-3 text-success" />;
      case 'normal': return <Clock className="h-3 w-3 text-warning" />;
      case 'slow': return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'best': return <Badge variant="default" className="text-[10px] h-4 bg-primary/80">Premium</Badge>;
      case 'great': return <Badge variant="secondary" className="text-[10px] h-4">Pro</Badge>;
      default: return <Badge variant="outline" className="text-[10px] h-4">Standard</Badge>;
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Modèle" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center gap-1.5">
                      <span>{model.label}</span>
                      {model.new && <Sparkles className="h-3 w-3 text-primary" />}
                      {model.recommended && <Crown className="h-3 w-3 text-warning" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{selectedModel.label}</p>
            <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <TranslatedText text="Modèle IA" />
      </Label>
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Sélectionner un modèle" />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map(model => (
            <SelectItem 
              key={model.value} 
              value={model.value}
              className="py-3"
            >
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.label}</span>
                    {model.new && (
                      <Badge variant="default" className="text-[10px] h-4 bg-gradient-to-r from-primary to-purple-500">
                        Nouveau
                      </Badge>
                    )}
                    {model.recommended && (
                      <Badge variant="outline" className="text-[10px] h-4 border-warning text-warning">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        Recommandé
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getSpeedIcon(model.speed)}
                  {getQualityBadge(model.quality)}
                  <Badge variant="outline" className="text-[10px] h-4">{model.maxDuration}</Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Aperçu du modèle sélectionné */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedModel.label}</span>
            {getQualityBadge(selectedModel.quality)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {getSpeedIcon(selectedModel.speed)}
            <span>Max {selectedModel.maxDuration}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{selectedModel.description}</p>
      </div>
    </div>
  );
};
