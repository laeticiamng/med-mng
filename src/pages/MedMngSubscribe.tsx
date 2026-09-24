import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/config/routes';
import {
  FORMULES_PREMIUM,
  NOM_OFFRE_PREMIUM,
  NOMBRE_ITEMS_TOTAL,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
  formuleDepuisParametre,
} from '@/config/offre';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

/**
 * /med-mng/subscribe/:planId — dernière étape avant le paiement Stripe.
 * `planId` : « annuel » ou « mensuel » (les anciens liens « premium » mènent
 * à l'annuel ; « standard » / « pro » renvoient vers les tarifs).
 *
 * La case de renonciation au droit de rétractation est obligatoire : l'accès
 * au contenu numérique est immédiat (art. L221-28 13° du Code de la consommation).
 */
export const MedMngSubscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, isSubscriptionActive, loading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [renonciation, setRenonciation] = useState(false);
  const [afficherErreur, setAfficherErreur] = useState(false);
  const { logActivity } = useActivityTracking();

  const formule = formuleDepuisParametre(planId);
  const offre = formule ? FORMULES_PREMIUM[formule] : null;

  useEffect(() => {
    if (!user) {
      navigate(`${ROUTE_PATHS.medMngLogin}?next=${encodeURIComponent(`/med-mng/subscribe/${planId ?? 'annuel'}`)}`);
      return;
    }
    if (!formule) {
      navigate(ROUTE_PATHS.medMngPricing);
    }
  }, [user, formule, planId, navigate]);

  const payer = async () => {
    if (!formule || !user) return;
    if (!renonciation) {
      setAfficherErreur(true);
      return;
    }
    setIsProcessing(true);
    logActivity({ activity_type: 'study', metadata: { action: 'checkout_start', plan: formule } });
    // Redirige vers Stripe en cas de succès ; affiche un message sinon.
    await createCheckout(formule, true);
    setIsProcessing(false);
  };

  if (!offre) return null;

  const dejaAbonne = !loading && isSubscriptionActive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl">Finaliser votre abonnement</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {NOM_OFFRE_PREMIUM} — formule {offre.libelle.toLowerCase()} : {offre.prixAffiche}
              {offre.equivalentMensuel ? ` (${offre.equivalentMensuel})` : ''}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">Votre abonnement inclut :</h3>
              <ul className="space-y-2 text-primary/80">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Paroles, récits, planches et quiz des {NOMBRE_ITEMS_TOTAL} items</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de chansons par mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Fiches officielles (rang A, rang B) et situations ECOS</span>
                </li>
              </ul>
            </div>

            {dejaAbonne ? (
              <div className="space-y-3 text-center">
                <p className="text-sm">Votre abonnement {NOM_OFFRE_PREMIUM} est déjà actif.</p>
                <Button onClick={() => navigate(ROUTE_PATHS.medMngProfile)} variant="outline">
                  Gérer mon abonnement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="renonciation-retractation"
                    checked={renonciation}
                    onCheckedChange={(v) => {
                      setRenonciation(v === true);
                      if (v === true) setAfficherErreur(false);
                    }}
                    aria-invalid={afficherErreur && !renonciation}
                    aria-describedby="renonciation-aide"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="renonciation-retractation" className="text-sm leading-snug cursor-pointer">
                      Je demande l'accès immédiat au contenu et reconnais perdre mon droit de rétractation dès cet accès.
                    </Label>
                    <p id="renonciation-aide" className="text-xs text-muted-foreground">
                      Obligatoire. Voir l'article « Droit de rétractation » des{' '}
                      <Link to={ROUTE_PATHS.cgv} className="underline" target="_blank" rel="noopener noreferrer">CGV</Link>.
                    </p>
                    {afficherErreur && !renonciation && (
                      <p className="text-xs text-destructive" role="alert">
                        Veuillez cocher cette case pour poursuivre.
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={payer}
                  disabled={isProcessing}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground py-3"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Redirection vers le paiement…' : `Payer ${offre.prixAffiche} par carte (Stripe)`}
                </Button>

                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <p>
                    Renouvellement automatique {formule === 'annuel' ? 'chaque année' : 'chaque mois'}, au même prix.
                  </p>
                  <p>Résiliation possible à tout moment depuis votre profil, avec effet à la fin de la période payée.</p>
                  <p>
                    <Link to={ROUTE_PATHS.medMngPricing} className="underline">
                      Changer de formule
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
