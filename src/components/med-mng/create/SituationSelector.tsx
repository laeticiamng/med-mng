
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SituationSelectorProps {
  selectedSituation: string;
  onSituationChange: (value: string) => void;
  disabled?: boolean;
}

const situations = [
  { code: 'S1', title: 'Situation de départ 1' },
  { code: 'S2', title: 'Situation de départ 2' },
  { code: 'S3', title: 'Situation de départ 3' },
];

export const SituationSelector: React.FC<SituationSelectorProps> = ({
  selectedSituation,
  onSituationChange,
  disabled = false
}) => {
  return (
    <div>
      <Label htmlFor="situation">Situation de départ</Label>
      <Select value={selectedSituation} onValueChange={onSituationChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une situation" />
        </SelectTrigger>
        <SelectContent>
          {situations.map((situation) => (
            <SelectItem key={situation.code} value={situation.code}>
              {situation.code} - {situation.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
