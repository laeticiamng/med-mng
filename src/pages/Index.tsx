import { AntiPanicHero } from "@/components/home/AntiPanicHero";
import { QuickActions } from "@/components/home/QuickActions";
import { ReassuranceSection } from "@/components/home/ReassuranceSection";
import { AntiAnxietyOnboarding } from "@/components/onboarding/AntiAnxietyOnboarding";
import { SEOHead } from "@/components/seo/SEOHead";
import { PremiumBackground } from "@/components/ui/premium-background";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// Composant de loading léger
const Index = () => {
  const [user, setUser] = useState<any>(null);
  const { _stats, loadStats } = useGamification();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        
        // Check onboarding status from Supabase
        const { data } = await (supabase as any)
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!data?.onboarding_completed) {
          setShowOnboarding(true);
        }
      } else {
        // Anonymous users - check sessionStorage (not localStorage for privacy)
        const hasSeenOnboarding = sessionStorage.getItem('med-mng-onboarding-seen');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    };
    checkUser();
  }, [loadStats]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Store in Supabase for logged-in users
      await (supabase as any).from('user_onboarding').upsert({
        user_id: user.id,
        onboarding_completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } else {
      // Use sessionStorage for anonymous (clears on browser close)
      sessionStorage.setItem('med-mng-onboarding-seen', 'true');
    }
  };

  return (
    <>
      <SEOHead
        title="MED MNG - Révise la médecine en musique | EDN & ECOS"
        description="🎧 Apprends la médecine autrement. Mémorise les 367 items EDN et les simulations ECOS grâce à la musique. Écoute, retiens, réussis."
        keywords="médecine, EDN, ECOS, musique, révision, mémorisation, étudiants médecine, apprentissage musical, items EDN"
        canonical="/"
      />
      
      {/* Anti-anxiety onboarding for new users */}
      <AntiAnxietyOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      <PremiumBackground>
        <div className="container mx-auto px-4">
          {/* Hero Section - Anti-Panic */}
          <div className="pt-16 pb-16">
            <AntiPanicHero 
              showGamification={!!user}
              stats={_stats || undefined}
            />
          </div>

          {/* Quick Actions - Decision-first */}
          <div className="pb-20">
            <QuickActions />
          </div>

          {/* Reassurance Section */}
          <div className="pb-20">
            <ReassuranceSection />
          </div>
        </div>
      </PremiumBackground>
    </>
  );
};

export default Index;