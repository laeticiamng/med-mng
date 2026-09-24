import { TranslatedText } from '@/components/TranslatedText';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AppFooter } from '@/components/layout/AppFooter';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingPlans } from '@/components/med-mng/PricingPlans';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { ArrowLeft, Shield, CreditCard } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { trackConversionEvent } from '@/lib/conversionTracking';

export const MedMngPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscriptionActive } = useSubscription();
  const estAbonne = isSubscriptionActive();
  const { logActivity } = useActivityTracking();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('checkout') === 'cancel') {
      toast.info("Paiement annulé : aucun montant n'a été débité.");
    }
  }, [searchParams]);

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_pricing' } });
    trackConversionEvent('page_view', { page: 'pricing' });
  }, []);

  return (
    <>
      <SEOHead
        title="Tarifs – MED MNG Premium 69 €/an | MED-MNG"
        description="MED MNG : fiches officielles des 367 items EDN gratuites et 10 items d'essai en immersion. MED MNG Premium : contenu immersif des 367 items et génération audio, 69 €/an ou 9,90 €/mois."
        keywords="tarifs EDN, abonnement ECOS, préparation médecine, prix"
        canonical="/med-mng/pricing"
      />
      <PremiumBackground variant="blue" className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 pt-20">
          <PremiumButton
            variant="glass"
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.home)}
            className="flex items-center gap-2 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText text="Retour à l'accueil" />
          </PremiumButton>
        </div>

        <div className="container mx-auto px-4 py-4 sm:py-8 flex-1">
        
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Une offre simple pour préparer les EDN 2027
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Les fiches officielles des 367 items sont gratuites, et 10 items d'essai sont ouverts en immersion complète.
              MED MNG Premium ouvre le contenu immersif des 367 items et la génération audio.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Paiement sécurisé par Stripe
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Résiliation depuis votre profil
              </Badge>
            </div>
          </div>

          {estAbonne && (
            <PremiumCard variant="glass" className="mb-8 p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Votre abonnement MED MNG Premium est actif</h3>
                  <p className="text-muted-foreground text-sm">Vous pouvez le gérer ou le résilier depuis votre profil.</p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">Actif</Badge>
              </div>
            </PremiumCard>
          )}

          <PricingPlans
            estAbonne={estAbonne}
            onSelectPlan={(formule) => {
              const cible = `/med-mng/subscribe/${formule}`;
              if (!user) {
                // Le choix est conservé : retour vers la page d'abonnement après inscription.
                navigate(`${ROUTE_PATHS.medMngSignup}?next=${encodeURIComponent(cible)}`);
                return;
              }
              navigate(cible);
            }}
          />

          {/* FAQ */}
          <div className="max-w-4xl mx-auto mt-12">
            <PricingFAQ />
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <PremiumCard variant="gradient" className="p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">Envie d'essayer ?</h3>
              <p className="text-base mb-6 opacity-90">
                Créez votre compte gratuit et testez la méthode sur les 10 items d'essai.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <PremiumButton onClick={() => navigate(ROUTE_PATHS.ednComplete)} variant="primary" size="lg">
                  Essayer gratuitement
                </PremiumButton>
                <PremiumButton onClick={() => navigate(ROUTE_PATHS.medMngLogin)} variant="glass" size="lg">
                  Se connecter
                </PremiumButton>
              </div>
            </PremiumCard>
          </div>
        </div>
        
      </PremiumBackground>
    </>
  );
};
