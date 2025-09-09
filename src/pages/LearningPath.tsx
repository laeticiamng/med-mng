import React from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { SmartLearningPath } from '@/components/learning/SmartLearningPath';
import { Helmet } from 'react-helmet-async';

const LearningPath: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Parcours d'Apprentissage - MED-MNG</title>
        <meta name="description" content="Suivez des parcours d'apprentissage personnalisés et intelligents pour votre formation médicale" />
      </Helmet>
      
      <ConsistentBackground variant="primary">
        <SmartLearningPath />
      </ConsistentBackground>
    </>
  );
};

export default LearningPath;