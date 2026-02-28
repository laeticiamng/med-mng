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
import { ArrowLeft, Shield, Clock, CreditCard } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackConversionEvent } from '@/lib/conversionTracking';

export const MedMngPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_pricing' } });
    trackConversionEvent('page_view', { page: 'pricing' });
  }, []);

  return (
    <>
      <SEOHead
        title="Tarifs – Gratuit, Pro 19€, Premium 39€ | MED-MNG"
        description="Préparez l'EDN et les ECOS avec MED-MNG. Essai gratuit 7 jours. 367 items, examen illimité, musique IA, cas cliniques. À partir de 19€/mois."
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
              Un seul objectif : réussir l'EDN
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              367 items, examens illimités, cas cliniques, musique IA. Tout ce qu'il faut pour cartonner.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                7 jours d'essai gratuit
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Sans engagement
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Annulation en 1 clic
              </Badge>
            </div>
          </div>

          {/* Current subscription */}
          {subscription && (
            <PremiumCard variant="glass" className="mb-8 p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Votre abonnement actuel</h3>
                  <p className="text-muted-foreground text-sm">
                    Plan {subscription.plan_name} — {subscription.monthly_quota} générations/mois
                  </p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">Actif</Badge>
              </div>
            </PremiumCard>
          )}

          {/* Pricing Plans - 3 tiers */}
          <PricingPlans 
            currentPlan={subscription?.plan_name?.toLowerCase()}
            onSelectPlan={(planId) => {
              if (!user) {
                navigate(ROUTE_PATHS.medMngSignup);
                return;
              }
              navigate(`/med-mng/subscribe/${planId}`);
            }}
          />

          {/* Comparaison Pro vs Premium */}
          <div className="mt-10 max-w-3xl mx-auto">
            <PremiumCard variant="glass" className="p-6">
              <h3 className="text-lg font-bold text-foreground text-center mb-6">Pro vs Premium — en détail</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground">Fonctionnalité</th>
                      <th className="text-center py-2 px-3 text-foreground font-semibold">Pro 19€</th>
                      <th className="text-center py-2 px-3 text-foreground font-semibold">Premium 39€</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {[
                      ['367 items EDN', true, true],
                      ['Examens illimités', true, true],
                      ['Cas cliniques complets', true, true],
                      ['Musique IA', true, true],
                      ['QCM illimité', true, true],
                      ['IA avancée & chat illimité', false, true],
                      ['Planning personnalisé IA', false, true],
                      ['Percentile national simulé', false, true],
                      ['Cas cliniques premium', false, true],
                      ['Support VIP prioritaire', false, true],
                    ].map(([feature, pro, premium], i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 px-3">{feature as string}</td>
                        <td className="text-center py-2 px-3">{pro ? '✅' : '—'}</td>
                        <td className="text-center py-2 px-3">{premium ? '✅' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumCard>
          </div>

          {/* Pack 6 mois */}
          <div className="mt-8 max-w-md mx-auto">
            <PremiumCard variant="glass" className="p-6 text-center">
              <p className="text-sm font-semibold text-foreground mb-1">💡 Pack 6 mois Pro</p>
              <p className="text-2xl font-bold text-foreground">
                <span className="line-through text-muted-foreground text-lg mr-2">114€</span>
                99€
              </p>
              <p className="text-xs text-muted-foreground mt-1">Soit 16,50€/mois — Économisez 15€</p>
            </PremiumCard>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto mt-12">
            <PricingFAQ />
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <PremiumCard variant="gradient" className="p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">Prêt à cartonner à l'EDN ?</h3>
              <p className="text-base mb-6 opacity-90">
                Rejoignez les étudiants qui révisent déjà avec MED-MNG
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
        <AppFooter />
      </PremiumBackground>
    </>
  );
};
