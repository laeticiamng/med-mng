import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/config/routes';
import { FORMULES_PREMIUM, NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { GENERATION_AUDIO_DISPONIBLE } from '@/config/offre';
import { AnnonceAudioSuspendue } from './AnnonceAudioSuspendue';

interface EncartGenerationAudioProps {
  /** Visiteur non connecté : on propose aussi la connexion. */
  connecte?: boolean;
  className?: string;
}

/**
 * Encart permanent affiché À LA PLACE des boutons « Générer » pour un
 * utilisateur sans Med MNG Premium. Les paroles restent lisibles ; seule la
 * génération audio est réservée. Avant, le bouton restait cliquable et un
 * message passager « Inclus dans Premium » apparaissait après le clic.
 */
export function EncartGenerationAudio({ connecte = true, className }: EncartGenerationAudioProps) {
  if (!GENERATION_AUDIO_DISPONIBLE) return <AnnonceAudioSuspendue className={className} />;
  return (
    <div
      className={`rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3 ${className ?? ''}`}
      role="note"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">La génération audio est incluse dans {NOM_OFFRE_PREMIUM}</p>
          <p className="text-sm text-muted-foreground">
            {QUOTA_GENERATIONS_AUDIO_PREMIUM} chansons générées par mois, pour les rangs A, B ou A+B de chaque item —
            {' '}{FORMULES_PREMIUM.annuel.prixAffiche} ou {FORMULES_PREMIUM.mensuel.prixAffiche}. Les paroles restent consultables.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:pl-12">
        <Button asChild size="sm">
          <Link to={ROUTE_PATHS.medMngPricing}>Voir l'offre</Link>
        </Button>
        {!connecte && (
          <Button asChild size="sm" variant="outline">
            <Link to={ROUTE_PATHS.medMngLogin}>Se connecter</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
