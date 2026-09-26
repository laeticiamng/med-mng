import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, BookOpen } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  FORMULES_PREMIUM,
  NOM_OFFRE_PREMIUM,
  NOMBRE_ITEMS_GRATUITS,
  NOMBRE_ITEMS_TOTAL,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
  type FormulePremium,
} from '@/config/offre';

interface PricingPlansProps {
  /** Appelé avec la formule choisie (« annuel » ou « mensuel »). */
  onSelectPlan: (formule: FormulePremium) => void;
  /** L'utilisateur a déjà un abonnement Premium actif. */
  estAbonne?: boolean;
}

const INCLUS_GRATUIT = [
  `Fiches officielles des ${NOMBRE_ITEMS_TOTAL} items : compétences rang A et rang B (référentiel LiSA 2026)`,
  `Contenu immersif complet de ${NOMBRE_ITEMS_GRATUITS} items d'essai : paroles, récit, planches, quiz`,
  'Situations ECOS du référentiel',
];

const INCLUS_PREMIUM = [
  `Tout le contenu immersif des ${NOMBRE_ITEMS_TOTAL} items : paroles rang A, rang B et A+B, récit, planches, quiz`,
  `${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de chansons par mois`,
  'Fiches officielles et situations ECOS',
];

/**
 * Offre unique : Gratuit ou MED MNG Premium (69 €/an ou 9,90 €/mois).
 * Source de vérité : src/config/offre.ts.
 */
export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, estAbonne }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const annuel = FORMULES_PREMIUM.annuel;
  const mensuel = FORMULES_PREMIUM.mensuel;

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Gratuit */}
      <Card className="flex flex-col">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-muted text-muted-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Gratuit</CardTitle>
          <CardDescription>Pour découvrir la méthode</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold text-foreground">0 €</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-3 flex-1">
            {INCLUS_GRATUIT.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <div className="pt-6">
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => navigate(user ? ROUTE_PATHS.ednComplete : ROUTE_PATHS.medMngSignup)}
            >
              {user ? 'Réviser les items' : 'Créer mon compte gratuit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Premium */}
      <Card className="relative flex flex-col ring-2 ring-primary shadow-xl">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 shadow-md">Pour préparer les EDN 2028</Badge>
        </div>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-primary text-primary-foreground">
            <Crown className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{NOM_OFFRE_PREMIUM}</CardTitle>
          <CardDescription>Tous les items, en immersion</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold text-foreground">69 €</span>
            <span className="text-sm text-muted-foreground">/an</span>
            <p className="text-sm text-muted-foreground mt-1">
              soit {annuel.equivalentMensuel} — ou {mensuel.prixAffiche}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-3 flex-1">
            {INCLUS_PREMIUM.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <div className="pt-6 space-y-3">
            {estAbonne ? (
              <Button className="w-full" size="lg" disabled>
                Votre abonnement est actif
              </Button>
            ) : (
              <>
                <Button className="w-full" size="lg" onClick={() => onSelectPlan('annuel')}>
                  Choisir l'annuel — {annuel.prixAffiche}
                </Button>
                <Button className="w-full" size="lg" variant="outline" onClick={() => onSelectPlan('mensuel')}>
                  Choisir le mensuel — {mensuel.prixAffiche}
                </Button>
              </>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Renouvellement automatique, résiliable à tout moment depuis votre profil (effet à la fin de la période payée).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
