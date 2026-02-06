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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Only show onboarding for authenticated users who haven't completed it
          const { data, error } = await supabase
            .from('user_onboarding')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.warn('Onboarding check failed:', error.message);
          }
          
          if (!data?.onboarding_completed) {
            setShowOnboarding(true);
          }
        }
        // Anonymous visitors: NO modal — let them see the hero first
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };
    checkUser();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('user_onboarding').upsert({
          user_id: user.id,
          onboarding_completed: true,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        if (error) {
          console.warn('Failed to save onboarding status:', error.message);
        }
      } else {
        sessionStorage.setItem('med-mng-onboarding-seen', 'true');
      }
    } catch (err) {
      console.error('Error saving onboarding:', err);
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
