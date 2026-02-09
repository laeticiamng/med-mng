import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubscriptionPlan = "free" | "premium" | "institution";

interface PremiumAccessState {
  isPremium: boolean;
  isInstitution: boolean;
  isLoading: boolean;
  plan: SubscriptionPlan;
}

interface PaywallProps {
  /** The content to display behind the blurred overlay. */
  children: ReactNode;
  /** A human-readable description of the premium feature being gated. */
  feature: string;
  /** The minimum plan required to access the gated content. */
  requiredPlan: "premium" | "institution";
  /** Optional additional class names for the root wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Plan definitions (French)
// ---------------------------------------------------------------------------

interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
  icon: ReactNode;
}

const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Gratuit",
    price: "0\u00A0\u20AC",
    description: "Acc\u00E8s de base aux ressources EDN",
    features: [
      "Fiches EDN essentielles",
      "QCM d\u2019entra\u00EEnement limit\u00E9s",
      "Suivi de progression basique",
    ],
    highlighted: false,
    icon: <Lock className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "premium",
    name: "Premium",
    price: "9,99\u00A0\u20AC/mois",
    description: "Tout le contenu + g\u00E9n\u00E9ration musique illimit\u00E9e",
    features: [
      "Tout le contenu EDN",
      "G\u00E9n\u00E9ration de musique illimit\u00E9e",
      "QCM illimit\u00E9s avec corrections d\u00E9taill\u00E9es",
      "Statistiques avanc\u00E9es",
      "Support prioritaire",
    ],
    highlighted: true,
    icon: <Crown className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "institution",
    name: "Institution",
    price: "Sur devis",
    description: "Solution multi-utilisateurs pour les universit\u00E9s",
    features: [
      "Tout le contenu Premium",
      "Gestion multi-utilisateurs",
      "Tableau de bord administrateur",
      "Int\u00E9gration LMS",
      "Support d\u00E9di\u00E9",
      "Facturation centralis\u00E9e",
    ],
    highlighted: false,
    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
  },
];

// ---------------------------------------------------------------------------
// Hook: usePremiumAccess
// ---------------------------------------------------------------------------

/**
 * Checks the current authenticated user\u2019s subscription plan via the
 * Supabase `profiles` table (`subscription_plan` column).
 *
 * Returns reactive state that updates when the auth session changes.
 */
export function usePremiumAccess(): PremiumAccessState {
  const [state, setState] = useState<PremiumAccessState>({
    isPremium: false,
    isInstitution: false,
    isLoading: true,
    plan: "free",
  });

  const fetchPlan = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ isPremium: false, isInstitution: false, isLoading: false, plan: "free" });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[usePremiumAccess] Error fetching subscription plan:", error.message);
        setState({ isPremium: false, isInstitution: false, isLoading: false, plan: "free" });
        return;
      }

      const raw = (data?.subscription_plan ?? "free") as string;
      const plan: SubscriptionPlan =
        raw === "premium" || raw === "institution" ? raw : "free";

      setState({
        isPremium: plan === "premium" || plan === "institution",
        isInstitution: plan === "institution",
        isLoading: false,
        plan,
      });
    } catch (err) {
      console.error("[usePremiumAccess] Unexpected error:", err);
      setState({ isPremium: false, isInstitution: false, isLoading: false, plan: "free" });
    }
  }, []);

  useEffect(() => {
    fetchPlan();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchPlan();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPlan]);

  return state;
}

// ---------------------------------------------------------------------------
// Helper: does the user's current plan satisfy the required plan?
// ---------------------------------------------------------------------------

function planSatisfies(current: SubscriptionPlan, required: "premium" | "institution"): boolean {
  if (required === "premium") {
    return current === "premium" || current === "institution";
  }
  return current === "institution";
}

// ---------------------------------------------------------------------------
// Sub-component: PlanCard
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: PlanDefinition }) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-shadow hover:shadow-lg",
        plan.highlighted &&
          "border-primary ring-2 ring-primary/20 shadow-md"
      )}
    >
      {plan.highlighted && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          Recommand\u00E9
        </Badge>
      )}

      <CardHeader className="items-center text-center gap-2">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            plan.highlighted
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {plan.icon}
        </div>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <p className="text-2xl font-bold text-foreground">{plan.price}</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-2" role="list">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-sm text-foreground">
              <Sparkles
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component: Paywall
// ---------------------------------------------------------------------------

export function Paywall({
  children,
  feature,
  requiredPlan,
  className,
}: PaywallProps) {
  const { plan, isLoading } = usePremiumAccess();

  // While loading, render children without the overlay to avoid a flash of
  // the paywall for users who do have access.
  if (isLoading) {
    return (
      <div className={cn("relative", className)} aria-busy="true">
        {children}
      </div>
    );
  }

  // If the user already satisfies the required plan, render children directly.
  if (planSatisfies(plan, requiredPlan)) {
    return <>{children}</>;
  }

  // Otherwise, show the blurred preview with the paywall overlay.
  return (
    <section
      className={cn("relative", className)}
      aria-label={`Contenu premium verrouill\u00E9\u00A0: ${feature}`}
    >
      {/* Blurred content preview */}
      <div
        className="pointer-events-none select-none"
        aria-hidden="true"
        style={{ filter: "blur(6px)" }}
      >
        {children}
      </div>

      {/* Glassmorphism overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex flex-col items-center justify-center",
          "bg-background/60 backdrop-blur-md",
          "rounded-lg border border-border/50"
        )}
        role="dialog"
        aria-modal="false"
        aria-label="Paywall"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Contenu r\u00E9serv\u00E9 aux membres{" "}
              {requiredPlan === "institution" ? "Institution" : "Premium"}
            </h2>
            <p className="max-w-md text-muted-foreground">
              La fonctionnalit\u00E9{" "}
              <span className="font-medium text-foreground">{feature}</span>{" "}
              n\u00E9cessite un abonnement{" "}
              {requiredPlan === "institution" ? "Institution" : "Premium"} pour
              \u00EAtre d\u00E9bloqu\u00E9e.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="gap-2">
            <Link to="/med-mng/pricing">
              D\u00E9bloquer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Paywall;
