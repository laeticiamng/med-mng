import React from 'react';
import { Settings2, User, Sliders, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TranslatedText } from '@/components/TranslatedText';
import { VocalGender, SunoModel } from '@/types/music';

interface AdvancedMusicOptionsProps {
  model: SunoModel;
  setModel: (model: SunoModel) => void;
  vocalGender?: VocalGender;
  setVocalGender: (gender: VocalGender | undefined) => void;
  negativeTags: string;
  setNegativeTags: (tags: string) => void;
  instrumental: boolean;
  setInstrumental: (instrumental: boolean) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SUNO_MODELS: { value: SunoModel; label: string; description: string }[] = [
  { value: 'V5', label: 'V5', description: 'Expression musicale supérieure' },
  { value: 'V4_5ALL', label: 'V4.5 ALL', description: 'Meilleure structure de chanson' },
  { value: 'V4_5PLUS', label: 'V4.5+', description: 'Son plus riche, max 8 min' },
  { value: 'V4_5', label: 'V4.5', description: 'Mélange de genres' },
  { value: 'V4', label: 'V4', description: 'Qualité audio, max 4 min' },
];

export const AdvancedMusicOptions: React.FC<AdvancedMusicOptionsProps> = ({
  model,
  setModel,
  vocalGender,
  setVocalGender,
  negativeTags,
  setNegativeTags,
  instrumental,
  setInstrumental,
  isOpen,
  setIsOpen
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between p-3 rounded-lg bg-card/30 border border-border/20 hover:border-border/40">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <TranslatedText text="Options avancées Suno V4.5+" />
        </div>
        <Badge variant="outline" className="text-xs">
          {model}
        </Badge>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 p-4 rounded-lg bg-card/20 border border-border/20">
        {/* Modèle Suno */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Modèle Suno
          </Label>
          <Select value={model} onValueChange={(v) => setModel(v as SunoModel)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Choisir un modèle" />
            </SelectTrigger>
            <SelectContent>
              {SUNO_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground">- {m.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Genre vocal */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-accent" />
            Genre vocal (optionnel)
          </Label>
          <Select 
            value={vocalGender || 'auto'} 
            onValueChange={(v) => setVocalGender(v === 'auto' ? undefined : v as VocalGender)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Auto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automatique</SelectItem>
              <SelectItem value="m">Masculin</SelectItem>
              <SelectItem value="f">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Styles à éviter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Sliders className="h-4 w-4 text-warning" />
            Styles à éviter (optionnel)
          </Label>
          <Input
            placeholder="Ex: Heavy Metal, Upbeat Drums"
            value={negativeTags}
            onChange={(e) => setNegativeTags(e.target.value)}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Séparez les styles par des virgules
          </p>
        </div>

        {/* Mode instrumental */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
          <Label className="flex items-center gap-2 text-sm cursor-pointer">
            <span>Mode instrumental (sans voix)</span>
          </Label>
          <Switch
            checked={instrumental}
            onCheckedChange={setInstrumental}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
