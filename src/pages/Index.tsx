import { SEOHead } from "@/components/seo/SEOHead";
import { AppleHero } from "@/components/home/AppleHero";
import { AppleMusicPlayer } from "@/components/home/AppleMusicPlayer";
import { AppleFeatureShowcase } from "@/components/home/AppleFeatureShowcase";
import { AppleTestimonials } from "@/components/home/AppleTestimonials";
import { AppleFinalCTA } from "@/components/home/AppleFinalCTA";
import { AntiAnxietyOnboarding } from "@/components/onboarding/AntiAnxietyOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
        // Anonymous users - check sessionStorage
        const hasSeenOnboarding = sessionStorage.getItem('med-mng-onboarding-seen');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    };
    checkUser();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_onboarding').upsert({
        user_id: user.id,
        onboarding_completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } else {
      sessionStorage.setItem('med-mng-onboarding-seen', 'true');
    }
  };

  return (
    <>
      <SEOHead
        title="MED MNG - Apprends la médecine en musique | EDN & ECOS"
        description="🎧 Révolutionne tes révisions. 367 items EDN et simulations ECOS transformés en chansons. Écoute, retiens, réussis. Gratuit pour commencer."
        keywords="médecine, EDN, ECOS, musique, révision, mémorisation, étudiants médecine, apprentissage musical"
        canonical="/"
      />
      
      {/* Anti-anxiety onboarding */}
      <AntiAnxietyOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Apple-style sections */}
      <div className="bg-background">
        <AppleHero />
        <AppleMusicPlayer />
        <AppleFeatureShowcase />
        <AppleTestimonials />
        <AppleFinalCTA />
      </div>
    </>
  );
};

export default Index;
