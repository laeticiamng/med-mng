import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Crown, Lock, Music, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaywallGateProps {
  /** Feature required to access the content */
  feature?: 'tableaux' | 'quiz' | 'bande_dessinee' | 'save_music';
  /** Minimum plan tier required */
  requiredTier?: 'basic' | 'pro' | 'premium';
  /** Preview content shown behind the paywall blur */
  children: React.ReactNode;
  /** Title displayed on the paywall overlay */
  title?: string;
  /** Description of what premium unlocks */
  description?: string;
  /** Show blurred preview of the content */
  showPreview?: boolean;
  /** Compact mode for inline usage */
  compact?: boolean;
}

const TIER_ORDER = { free: 0, basic: 1, pro: 2, premium: 3 };

/**
 * PaywallGate - Wraps premium content with a paywall overlay.
 *
 * Shows a blurred preview of the content with a CTA to upgrade.
 * If the user has sufficient access, renders children normally.
 */
export const PaywallGate: React.FC<PaywallGateProps> = ({
  feature,
  requiredTier = 'premium',
  children,
  title = 'Contenu Premium',
  description = 'Passez au Premium pour accéder à cette fonctionnalité et débloquer musique IA illimitée, cas cliniques avancés et mode examen EDN.',
  showPreview = true,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasFeatureAccess, getPlanTier, loading } = useSubscription();

  // Check access
  const currentTier = getPlanTier();
  const hasAccess = feature
    ? hasFeatureAccess(feature)
    : TIER_ORDER[currentTier] >= TIER_ORDER[requiredTier];

  // If user has access, render children normally
  if (hasAccess && user) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (compact) {
    return (
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
          <Button
            size="sm"
            onClick={() => user ? navigate(ROUTE_PATHS.medMngPricing) : navigate(ROUTE_PATHS.medMngSignup)}
            className="gap-1 flex-shrink-0"
          >
            <Crown className="h-3 w-3" />
            {user ? 'Upgrade' : 'S\'inscrire'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Blurred preview */}
      {showPreview && (
        <div className="overflow-hidden rounded-lg max-h-[400px] pointer-events-none select-none" aria-hidden="true">
          <div className="filter blur-sm opacity-60 scale-[1.02]">
            {children}
          </div>
        </div>
      )}

      {/* Paywall overlay */}
      <div className={`${showPreview ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <Card className="max-w-md mx-auto border-accent/30 bg-background/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-accent" />
            </div>

            <Badge variant="secondary" className="mb-3">
              <Crown className="h-3 w-3 mr-1" />
              Premium requis
            </Badge>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{description}</p>

            <div className="space-y-3 mb-6 text-left">
              {[
                { icon: Music, text: 'Musique IA illimitée' },
                { icon: Sparkles, text: 'Cas cliniques avancés' },
                { icon: Crown, text: 'Mode examen conditions EDN' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-accent" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {user ? (
                <Button
                  onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
                  className="w-full gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Passer au Premium - 39€/mois
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.medMngSignup)}
                    className="w-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Créer un compte gratuit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                    className="w-full text-sm"
                  >
                    Déjà un compte ? Se connecter
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
