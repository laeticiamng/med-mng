
import React from 'react';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { MusicGenerationHeader } from '@/components/home/MusicGenerationHeader';
import { MusicGenerationActions } from '@/components/home/MusicGenerationActions';
import { MusicGenerationFeatures } from '@/components/home/MusicGenerationFeatures';
import { MusicGenerationHowItWorks } from '@/components/home/MusicGenerationHowItWorks';
import { MusicGenerationCTA } from '@/components/home/MusicGenerationCTA';

export const MusicGenerationSection = () => {
  const freeTrialData = useFreeTrialLimit();
  
  // Protection supplémentaire contre les erreurs de destructuration
  if (!freeTrialData || !freeTrialData.isInitialized) {
    return (
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }
  
  const { getRemainingGenerations, maxFreeGenerations } = freeTrialData;
  const remainingFree = getRemainingGenerations ? getRemainingGenerations() : 0;

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
