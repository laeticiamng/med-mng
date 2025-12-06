import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTE_PATHS } from '@/config/routes';

interface ConsentCheckboxesProps {
  cguAccepted: boolean;
  onCguChange: (checked: boolean) => void;
  healthDataAccepted: boolean;
  onHealthDataChange: (checked: boolean) => void;
  internationalTransferAccepted: boolean;
  onInternationalTransferChange: (checked: boolean) => void;
  ageVerified: boolean;
  onAgeChange: (checked: boolean) => void;
  showErrors?: boolean;
}

export const ConsentCheckboxes = ({
  cguAccepted,
  onCguChange,
  healthDataAccepted,
  onHealthDataChange,
  internationalTransferAccepted,
  onInternationalTransferChange,
  ageVerified,
  onAgeChange,
  showErrors = false
}: ConsentCheckboxesProps) => {
  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">Consentements requis</h4>
          <p className="text-sm text-muted-foreground">
            Conformément au RGPD, nous avons besoin de votre consentement explicite pour traiter vos données.
          </p>
        </div>
      </div>

      {/* 1. Acceptation CGU + Politique de confidentialité */}
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${showErrors && !cguAccepted ? 'bg-destructive/10 border border-destructive' : 'bg-muted/50'}`}>
        <Checkbox
          id="cgu-consent"
          checked={cguAccepted}
          onCheckedChange={onCguChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="cgu-consent" className="cursor-pointer text-sm leading-relaxed">
            <span className="font-semibold">J'accepte les{' '}</span>
            <Link to={ROUTE_PATHS.cgu} target="_blank" className="text-primary hover:underline font-semibold">
              Conditions Générales d'Utilisation
            </Link>
            {' '}et la{' '}
            <Link to={ROUTE_PATHS.politiqueConfidentialite} target="_blank" className="text-primary hover:underline font-semibold">
              Politique de Confidentialité
            </Link>
            <span className="text-destructive ml-1">*</span>
          </Label>
          {showErrors && !cguAccepted && (
            <p className="text-xs text-destructive mt-1">⚠️ Acceptation obligatoire pour créer un compte</p>
          )}
        </div>
      </div>

      {/* 2. Consentement données de santé (RGPD Article 9) */}
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${showErrors && !healthDataAccepted ? 'bg-destructive/10 border border-destructive' : 'bg-muted/50'}`}>
        <Checkbox
          id="health-data-consent"
          checked={healthDataAccepted}
          onCheckedChange={onHealthDataChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="health-data-consent" className="cursor-pointer text-sm leading-relaxed">
            <span className="font-semibold">J'autorise le traitement de mes données pédagogiques médicales</span>
            {' '}(historique de révisions, résultats de quiz, progressions d'apprentissage) considérées comme{' '}
            <span className="font-semibold text-primary">données relatives à la santé</span> au sens de l'Article 9 du RGPD.
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Alert className="mt-2 bg-primary/10 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              Ces données sont chiffrées, stockées en France (Supabase EU) et ne sont jamais revendues. 
              Vous pouvez retirer ce consentement à tout moment depuis votre profil.
            </AlertDescription>
          </Alert>
          {showErrors && !healthDataAccepted && (
            <p className="text-xs text-destructive mt-1">⚠️ Consentement obligatoire pour les fonctionnalités pédagogiques</p>
          )}
        </div>
      </div>

      {/* 3. Consentement transfert international (OpenAI/Suno US) */}
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${showErrors && !internationalTransferAccepted ? 'bg-destructive/10 border border-destructive' : 'bg-muted/50'}`}>
        <Checkbox
          id="international-transfer-consent"
          checked={internationalTransferAccepted}
          onCheckedChange={onInternationalTransferChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="international-transfer-consent" className="cursor-pointer text-sm leading-relaxed">
            <span className="font-semibold">J'autorise le transfert de mes prompts pédagogiques</span>
            {' '}(textes envoyés pour génération IA) vers les serveurs d'
            <span className="font-semibold">OpenAI (USA)</span> et{' '}
            <span className="font-semibold">Suno AI (USA)</span> pour la génération de contenus musicaux et visuels.
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Alert className="mt-2 bg-warning/10 border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-xs text-warning-foreground">
              <strong>Transfert hors UE :</strong> OpenAI et Suno AI sont soumis au Cloud Act américain. 
              Vos prompts (sans données personnelles identifiantes) sont traités selon leurs politiques respectives. 
              Les contenus générés restent votre propriété et sont stockés en UE.
            </AlertDescription>
          </Alert>
          {showErrors && !internationalTransferAccepted && (
            <p className="text-xs text-destructive mt-1">⚠️ Consentement obligatoire pour utiliser le générateur IA</p>
          )}
        </div>
      </div>

      {/* 4. Vérification d'âge */}
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${showErrors && !ageVerified ? 'bg-destructive/10 border border-destructive' : 'bg-muted/50'}`}>
        <Checkbox
          id="age-verification"
          checked={ageVerified}
          onCheckedChange={onAgeChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="age-verification" className="cursor-pointer text-sm leading-relaxed">
            <span className="font-semibold">Je certifie avoir au moins 16 ans</span>
            {' '}ou avoir l'autorisation de mon représentant légal pour utiliser MED MNG.
            <span className="text-destructive ml-1">*</span>
          </Label>
          {showErrors && !ageVerified && (
            <p className="text-xs text-destructive mt-1">⚠️ Certification d'âge obligatoire</p>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
        <p className="flex items-center gap-1">
          <span className="text-destructive">*</span>
          <span>Champs obligatoires pour créer un compte</span>
        </p>
        <p className="mt-1">
          Vous pouvez retirer ces consentements à tout moment depuis votre Profil &gt; Paramètres &gt; Confidentialité. 
          Le retrait entraînera la désactivation des fonctionnalités concernées.
        </p>
      </div>
    </div>
  );
};
