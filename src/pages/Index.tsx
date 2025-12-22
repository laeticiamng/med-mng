import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { ROUTE_PATHS } from "@/config/routes";
import { supabase } from "@/integrations/supabase/client";
import { StudyHomeHero } from "@/components/home/StudyHomeHero";
import { MedMngLayout } from "@/components/med-mng/MedMngLayout";
import { AntiAnxietyOnboarding } from "@/components/onboarding/AntiAnxietyOnboarding";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastItem, setLastItem] = useState<{ code: string; title: string; type: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch last viewed item
        const { data: lastProgress } = await (supabase as any)
          .from('med_mng_item_progress')
          .select('item_id, last_seen_at, med_mng_items(code, title, item_type)')
          .eq('user_id', user.id)
          .order('last_seen_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (lastProgress?.med_mng_items) {
          setLastItem({
            code: lastProgress.med_mng_items.code,
            title: lastProgress.med_mng_items.title,
            type: lastProgress.med_mng_items.item_type || 'Item',
          });
        }
        
        // Check onboarding status
        const { data } = await (supabase as any)
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!data?.onboarding_completed) {
          setShowOnboarding(true);
        }
      } else {
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
        title="MED MNG - Révise la médecine en musique | EDN & ECOS"
        description="Apprends la médecine autrement. Mémorise les 367 items EDN et les simulations ECOS grâce à la musique."
        keywords="médecine, EDN, ECOS, musique, révision, mémorisation, étudiants médecine"
        canonical="/"
      />
      
      <AntiAnxietyOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      <MedMngLayout>
        <div className="container mx-auto px-4 max-w-2xl">
          <StudyHomeHero lastItem={lastItem} />
        </div>
      </MedMngLayout>
    </>
  );
};

export default Index;