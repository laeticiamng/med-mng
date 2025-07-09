
import React from 'react';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { MusicGenerationHeader } from '@/components/home/MusicGenerationHeader';
import { MusicGenerationActions } from '@/components/home/MusicGenerationActions';
import { MusicGenerationFeatures } from '@/components/home/MusicGenerationFeatures';
import { MusicGenerationHowItWorks } from '@/components/home/MusicGenerationHowItWorks';
import { MusicGenerationCTA } from '@/components/home/MusicGenerationCTA';

export const MusicGenerationSection = () => {
  const freeTrialData = useFreeTrialLimit();
  
  if (!freeTrialData.isInitialized) {
    return null; // ou un loader
  }
  
  const { getRemainingGenerations, maxFreeGenerations } = freeTrialData;
  const remainingFree = getRemainingGenerations();

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        <MusicGenerationHeader 
          remainingFree={remainingFree}
          maxFreeGenerations={maxFreeGenerations}
        />
        
        <MusicGenerationActions remainingFree={remainingFree} />

        <div className="mt-12">
          <MusicGenerationFeatures />
        </div>

        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <MusicGenerationHowItWorks />
            <MusicGenerationCTA remainingFree={remainingFree} />
          </div>
        </div>
      </div>
    </section>
  );
};
