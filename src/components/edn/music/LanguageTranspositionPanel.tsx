
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Languages, Music } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';
import { TranslatedText } from '@/components/TranslatedText';

interface LanguageTranspositionPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onTranspose: (targetLanguage: string, rang: 'A' | 'B') => void;
  currentLanguage: SupportedLanguage;
  hasRangA: boolean;
  hasRangB: boolean;
}

export const LanguageTranspositionPanel = ({
  isVisible,
  onToggle,
  onTranspose,
  currentLanguage,
  hasRangA,
  hasRangB
}: LanguageTranspositionPanelProps) => {
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<string>('');
  const [isTransposing, setIsTransposing] = useState<{rangA: boolean, rangB: boolean}>({
    rangA: false,
    rangB: false
  });

  const availableLanguages = Object.entries(SUPPORTED_LANGUAGES).filter(
    ([code]) => code !== currentLanguage
  );

  const handleTranspose = async (rang: 'A' | 'B') => {
    if (!selectedTargetLanguage) return;
    
    setIsTransposing(prev => ({ ...prev, [`rang${rang}`]: true }));
    
    try {
      await onTranspose(selectedTargetLanguage, rang);
    } finally {
      setIsTransposing(prev => ({ ...prev, [`rang${rang}`]: false }));
    }
  };

  return (
    <Card className="border-2 border-dashed border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
      <CardHeader 
        className="cursor-pointer hover:bg-accent/10 transition-colors"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-accent" />
            <TranslatedText text="Transposer dans une autre langue" />
          </div>
          {isVisible ? (
            <ChevronUp className="h-5 w-5 text-accent" />
          ) : (
            <ChevronDown className="h-5 w-5 text-accent" />
          )}
        </CardTitle>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="space-y-4">
          <div className="bg-accent/10 rounded-lg p-3">
            <p className="text-sm text-accent">
              <TranslatedText text="Vous pouvez transposer vos musiques générées dans d'autres langues tout en gardant la même mélodie et le même style musical." />
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <TranslatedText text="Choisir la langue cible" />
              </label>
              <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une langue..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span>{info.flag}</span>
                        <span>{info.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTargetLanguage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasRangA && (
                  <Button
                    onClick={() => handleTranspose('A')}
                    disabled={isTransposing.rangA || !selectedTargetLanguage}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    {isTransposing.rangA ? (
                      <TranslatedText text="Transposition Rang A..." />
                    ) : (
                      <TranslatedText text="Transposer Rang A" />
                    )}
                  </Button>
                )}

                {hasRangB && (
                  <Button
                    onClick={() => handleTranspose('B')}
                    disabled={isTransposing.rangB || !selectedTargetLanguage}
                    className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    {isTransposing.rangB ? (
                      <TranslatedText text="Transposition Rang B..." />
                    ) : (
                      <TranslatedText text="Transposer Rang B" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
