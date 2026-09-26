import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

interface ConsentCheckboxesProps {
  cguAccepted: boolean;
  onCguChange: (checked: boolean) => void;
  showErrors?: boolean;
}

/**
 * Une seule case : l'acceptation des CGU (base légale = le contrat).
 * Les données de révision ne sont pas des données de santé (art. 9 RGPD) et les transferts
 * vers les fournisseurs d'IA reposent sur des garanties contractuelles, pas sur un consentement
 * forcé : un consentement obligatoire pour créer un compte ne serait pas valide.
 */
export const ConsentCheckboxes = ({ cguAccepted, onCguChange, showErrors = false }: ConsentCheckboxesProps) => (
  <div className="space-y-3">
    <div className={`flex items-start space-x-3 rounded-lg p-3 ${showErrors && !cguAccepted ? 'border border-destructive bg-destructive/10' : 'bg-muted/50'}`}>
      <Checkbox id="cgu-consent" checked={cguAccepted} onCheckedChange={(checked) => onCguChange(!!checked)} className="mt-1" />
      <div className="flex-1">
        <Label htmlFor="cgu-consent" className="cursor-pointer text-sm leading-relaxed">
          J'accepte les{' '}
          <Link to={ROUTE_PATHS.cgu} target="_blank" className="font-semibold text-primary hover:underline">
            conditions générales d'utilisation
          </Link>
          <span className="ml-1 text-destructive">*</span>
        </Label>
        {showErrors && !cguAccepted && <p className="mt-1 text-xs text-destructive">Nécessaire pour créer un compte.</p>}
      </div>
    </div>
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>
        Vos données sont hébergées dans l'Union européenne (Francfort) et ne sont jamais revendues. Les textes envoyés pour générer une
        chanson ou une explication (sans votre nom ni votre e-mail) sont traités par nos fournisseurs d'IA, dont certains aux États-Unis,
        sous clauses contractuelles types. Détails dans la{' '}
        <Link to={ROUTE_PATHS.politiqueConfidentialite} target="_blank" className="underline">
          politique de confidentialité
        </Link>
        .
      </span>
    </p>
  </div>
);
