import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DocFlemmeImmersive } from '@/components/docflemme/DocFlemmeImmersive';

// Données de démonstration pour DocFlemme
const demoItemData = {
  item_code: 'IC-001',
  title: 'Communication Médecin-Patient',
  subtitle: 'Maîtriser la relation thérapeutique',
  pitch_intro: 'Découvrez l\'art de la communication médicale à travers une expérience sensorielle révolutionnaire',
  paroles_rang_a: [
    'Écoute active, regard bienveillant',
    'Chaque mot compte dans l\'instant',
    'L\'empathie guide ma démarche',
    'Pour une relation authentique'
  ],
  paroles_rang_b: [
    'Situations difficiles, annonces délicates',
    'Gérer l\'émotion avec tact',
    'Communication non-verbale',
    'L\'art du silence thérapeutique'
  ],
  paroles_rang_ab: [
    'Maîtrise complète de la communication',
    'Adaptation à chaque contexte',
    'Excellence relationnelle',
    'Humanité et professionnalisme'
  ],
  tableau_rang_a: {
    title: 'Communication de base',
    sections: [
      {
        title: 'Écoute active',
        content: 'Techniques fondamentales d\'écoute en consultation',
        keywords: ['écoute', 'attention', 'présence']
      }
    ]
  },
  tableau_rang_b: {
    title: 'Communication avancée',
    sections: [
      {
        title: 'Gestion des situations difficiles',
        content: 'Approches pour les consultations complexes',
        keywords: ['conflit', 'tension', 'résolution']
      }
    ]
  }
};

const DocFlemmePage = () => {
  const { itemCode } = useParams<{ itemCode: string }>();
  const navigate = useNavigate();

  // En production, récupérer les vraies données selon l'itemCode
  const itemData = demoItemData;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>DocFlemme Studio - {itemData.title} | MED-MNG</title>
        <meta name="description" content={`Génération musicale révolutionnaire pour ${itemData.title}. Apprends en courant, révise sous la douche avec DocFlemme.`} />
        <meta name="keywords" content="DocFlemme, génération musicale, apprentissage médical, neurocognition, MED-MNG" />
      </Helmet>
      
      <DocFlemmeImmersive 
        itemData={itemData}
        onBack={handleBack}
      />
    </>
  );
};

export default DocFlemmePage;