import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';

interface EcosSelectorProps {
  selectedSituation: string;
  setSelectedSituation: (situation: string) => void;
}

const ecosSituations = [
  { code: 'S1', title: 'Situation de départ 1 - Consultation' },
  { code: 'S2', title: 'Situation de départ 2 - Urgence' },
  { code: 'S3', title: 'Situation de départ 3 - Prévention' },
];

export const EcosSelector: React.FC<EcosSelectorProps> = ({
  selectedSituation,
  setSelectedSituation
}) => {
  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900">
        <TranslatedText text="Situation ECOS" />
      </label>
      <Select value={selectedSituation} onValueChange={setSelectedSituation}>
        <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
          <SelectValue placeholder="Sélectionnez une situation ECOS" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl">
          {ecosSituations.map((situation) => (
            <SelectItem key={situation.code} value={situation.code} className="text-base py-3">
              {situation.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};