import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  AIDE_AMBIANCE,
  AMBIANCE_MAX,
  verifierAmbianceLocale,
} from '../../../supabase/functions/_shared/mm-ambiance';

interface AmbianceLibreProps {
  valeur: string;
  onChange: (valeur: string) => void;
  disabled?: boolean;
}

/**
 * Ambiance musicale libre : décrite en français, réellement transmise au moteur (tags
 * ajoutés au style choisi), après contrôle des noms d'artistes, titres et imitations.
 */
export const AmbianceLibre: React.FC<AmbianceLibreProps> = ({
  valeur,
  onChange,
  disabled,
}) => {
  const verdict = verifierAmbianceLocale(valeur);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="ambiance-libre"
        className="text-sm font-medium text-foreground"
      >
        Préciser l'ambiance{' '}
        <span className="font-normal text-muted-foreground">(facultatif)</span>
      </label>
      <Textarea
        id="ambiance-libre"
        value={valeur}
        onChange={(e) => onChange(e.target.value.slice(0, AMBIANCE_MAX + 20))}
        placeholder="Ex. : piano doux, pluie en fond, tempo lent, nostalgique"
        rows={2}
        disabled={disabled}
        aria-invalid={!verdict.ok}
        aria-describedby="ambiance-aide"
        className="resize-none"
      />
      <div
        id="ambiance-aide"
        className="flex items-start justify-between gap-3 text-xs"
      >
        <span
          className={verdict.ok ? 'text-muted-foreground' : 'text-destructive'}
        >
          {verdict.ok ? AIDE_AMBIANCE : verdict.raison}
        </span>
        <span
          className={
            valeur.trim().length > AMBIANCE_MAX
              ? 'text-destructive'
              : 'text-muted-foreground'
          }
        >
          {valeur.trim().length}/{AMBIANCE_MAX}
        </span>
      </div>
    </div>
  );
};
