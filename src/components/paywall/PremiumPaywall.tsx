import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Lock, Sparkles } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PremiumPaywallProps {
  /** What feature is gated */
  feature: string;
  /** Optional preview content shown blurred behind the paywall */
  children?: React.ReactNode;
  /** Minimum required plan tier */
  requiredPlan?: 'standard' | 'pro' | 'premium';
  /** Compact variant for inline usage */
  compact?: boolean;
}

/**
 * Paywall component that gates premium content.
 * Shows a blurred preview of content + CTA to upgrade.
 */
export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({
  feature,
  children,
  requiredPlan = 'premium',
  compact = false,
}) => {
  const navigate = useNavigate();
  const { getPlanTier, createCheckout } = useSubscription();
  const currentTier = getPlanTier();

  const tierOrder = ['free', 'basic', 'standard', 'pro', 'premium'] as const;
  const currentIndex = tierOrder.indexOf(currentTier as any);
  const requiredIndex = tierOrder.indexOf(requiredPlan as any);

  // User has access - render children directly
  if (currentIndex >= requiredIndex) {
    return <>{children}</>;
  }

  const planLabels: Record<string, string> = {
    standard: 'Standard (19€/mois)',
    pro: 'Pro (29€/mois)',
    premium: 'Premium (39€/mois)',
  };

  if (compact) {
    return (
      <div className="relative">
        {children && (
          <div className="pointer-events-none select-none blur-sm opacity-50 max-h-40 overflow-hidden">
            {children}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-3 p-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{feature}</span>
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
            >
              Débloquer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Blurred preview content */}
      {children && (
        <div className="pointer-events-none select-none blur-md opacity-40 max-h-64 overflow-hidden">
          {children}
        </div>
      )}

      {/* Paywall overlay */}
      <div className={`${children ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <Card className="w-full max-w-md border-primary/30 bg-background/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Crown className="h-7 w-7 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-1">Contenu Premium</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{feature}</span> nécessite un abonnement {planLabels[requiredPlan] ?? requiredPlan}.
              </p>
            </div>

            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Aperçu du contenu premium
            </Badge>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full gap-2"
                onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
              >
                <Crown className="h-4 w-4" />
                Voir les tarifs
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const plan = requiredPlan === 'standard' ? 'standard' : requiredPlan === 'pro' ? 'pro' : 'premium';
                  createCheckout(plan);
                }}
              >
                S'abonner maintenant
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Essai gratuit disponible. Annulation à tout moment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumPaywall;
