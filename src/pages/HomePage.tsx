import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import MainSections from '@/components/MainSections';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';

const HomePage = () => {
  return (
    <MedMngLayout className="medical-container medical-section">
      <div className="space-y-12">
        <HeroSection />
        <MainSections />
      </div>
    </MedMngLayout>
  );
};

export default HomePage;