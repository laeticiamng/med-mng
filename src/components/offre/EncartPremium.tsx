import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { FORMULES_PREMIUM, NOMBRE_ITEMS_GRATUITS, NOMBRE_ITEMS_TOTAL, NOM_OFFRE_PREMIUM } from '@/config/offre';

interface EncartPremiumProps {
  /** Ce qui est verrouillé, ex. « Les paroles de cet item ». */
  contenu?: string;
  className?: string;
}

/**
 * Encart sobre affiché à la place du contenu immersif d'un item hors des
 * items d'essai, pour un visiteur sans abonnement Premium.
 */
export function EncartPremium({ contenu, className }: EncartPremiumProps) {
  const annuel = FORMULES_PREMIUM.annuel;
  return (
    <Card className={`max-w-xl mx-auto border-primary/30 ${className ?? ''}`}>
      <CardContent className="p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold">
          Contenu {NOM_OFFRE_PREMIUM} — {annuel.prixAffiche}
        </h2>
        <p className="text-sm text-muted-foreground">
          {contenu ? `${contenu} fait partie de ${NOM_OFFRE_PREMIUM}. ` : ''}
          Les fiches officielles (rang A et rang B) restent accessibles gratuitement pour les {NOMBRE_ITEMS_TOTAL} items,
          et le contenu immersif complet est offert pour {NOMBRE_ITEMS_GRATUITS} items d'essai.
        </p>
        <p className="text-sm text-muted-foreground">
          {NOM_OFFRE_PREMIUM} : paroles, récits, planches et quiz des {NOMBRE_ITEMS_TOTAL} items, et génération audio.
          {' '}{annuel.prixAffiche} ({annuel.equivalentMensuel}) ou {FORMULES_PREMIUM.mensuel.prixAffiche}.
        </p>
        <Button asChild size="lg">
          <Link to={ROUTE_PATHS.medMngPricing}>Voir l'offre Premium</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
