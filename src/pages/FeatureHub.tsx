import React from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { ComprehensiveFeatureHub } from '@/components/features/ComprehensiveFeatureHub';
import { Helmet } from 'react-helmet-async';

const FeatureHub: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Hub des Fonctionnalités - MED-MNG</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de MED-MNG pour révolutionner votre apprentissage médical" />
      </Helmet>
      
      <ConsistentBackground variant="secondary">
        <ComprehensiveFeatureHub />
      </ConsistentBackground>
    </>
  );
};

export default FeatureHub;