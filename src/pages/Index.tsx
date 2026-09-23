import { SEOHead } from "@/components/seo/SEOHead";
import { AppleHero } from "@/components/home/AppleHero";
import { AppleMusicPlayer } from "@/components/home/AppleMusicPlayer";
import { AppleFeatureShowcase } from "@/components/home/AppleFeatureShowcase";
import { AppleFinalCTA } from "@/components/home/AppleFinalCTA";
import { ApplePlatformFeatures } from "@/components/home/ApplePlatformFeatures";
import { StickyMobileCTA } from "@/components/home/StickyMobileCTA";
import { AntiAnxietyOnboarding } from "@/components/onboarding/AntiAnxietyOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { forwardRef, useEffect, useState } from "react";

const Index = forwardRef<HTMLDivElement>((_, ref) => {
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
            if (import.meta.env.DEV) console.warn('Onboarding check failed:', error.message);
          }
          
          if (!data?.onboarding_completed) {
            setShowOnboarding(true);
          }
        }
        // Anonymous visitors: NO modal — let them see the hero first
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error checking user:', err);
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
          if (import.meta.env.DEV) console.warn('Failed to save onboarding status:', error.message);
        }
      } else {
        sessionStorage.setItem('med-mng-onboarding-seen', 'true');
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error saving onboarding:', err);
      sessionStorage.setItem('med-mng-onboarding-seen', 'true');
    }
  };

  return (
    <div ref={ref}>
      <SEOHead
        title="MED MNG - Apprends la médecine en musique | EDN & ECOS"
        description="🎧 Les 367 items EDN avec leurs compétences rang A et rang B, un quiz et des paroles de chanson générées par IA, plus des situations ECOS guidées. Gratuit."
        keywords="médecine, EDN, ECOS, musique, révision, mémorisation, étudiants médecine, apprentissage musical"
        canonical="https://medmng.com/"
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
        <ApplePlatformFeatures />
        {/* CONSTAT : la section « Ce qu’ils en disent » affichait 4 témoignages
            d’étudiants écrits en dur (« Marie L. », « Thomas K. »…) et une note
            « 4.8/5 » : aucun utilisateur réel derrière, aucune source. Des avis
            fictifs présentés comme réels sont une pratique commerciale trompeuse
            (art. L.121-2 du code de la consommation) : section et composant retirés. */}
        <AppleFinalCTA />
      </div>
      
      {/* Sticky CTA mobile */}
      <StickyMobileCTA />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
