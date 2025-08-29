
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { TableauCompetencesOICWithRealData } from '@/components/edn/tableau/TableauCompetencesOICWithRealData';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { TranslatedText } from '@/components/TranslatedText';
import { EnhancedTableauDisplay } from '@/components/edn/immersive/EnhancedTableauDisplay';
import { AdvancedSceneImmersive } from '@/components/edn/scene/AdvancedSceneImmersive';
import { AdvancedBandeDessinee } from '@/components/edn/comic/AdvancedBandeDessinee';
import { AdvancedGenerationMusicale } from '@/components/edn/music/AdvancedGenerationMusicale';
import { AdvancedQuizInteractif } from '@/components/edn/quiz/AdvancedQuizInteractif';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  created_at: string;
  updated_at: string;
}

interface EdnItemContentProps {
  activeSection: SectionType;
  item: EdnItemData;
}

export const EdnItemContent = ({ activeSection, item }: EdnItemContentProps) => {
  console.log('🔍 EdnItemContent - Active section:', activeSection);
  console.log('📊 EdnItemContent - Item data:', item);
  console.log('🚨 FORCE UPDATE - Current timestamp:', new Date().toISOString());
  
  // Extraire les compétences depuis les données des tableaux
  const extractCompetences = () => {
    const competences = new Set<string>();
    
    // Ajouter des compétences basées sur l'item_code
    if (item.item_code?.includes('CARDIO') || item.title?.toLowerCase().includes('cardiologie')) {
      competences.add('Cardiologie');
    }
    if (item.item_code?.includes('NEURO') || item.title?.toLowerCase().includes('neurologie')) {
      competences.add('Neurologie');
    }
    if (item.item_code?.includes('DERMATO') || item.title?.toLowerCase().includes('dermatologie')) {
      competences.add('Dermatologie');
    }
    
    // Compétences par défaut selon le rang
    if (item.tableau_rang_a || item.competences_oic_rang_a) {
      competences.add('Diagnostic');
      competences.add('Anamnèse');
      competences.add('Examen clinique');
    }
    if (item.tableau_rang_b || item.competences_oic_rang_b) {
      competences.add('Thérapeutique');
      competences.add('Suivi patient');
      competences.add('Prise de décision');
    }
    
    // Si aucune compétence spécifique, ajouter des compétences générales
    if (competences.size === 0) {
      competences.add('Médecine Générale');
      competences.add('Communication');
      competences.add('Raisonnement clinique');
    }
    
    return Array.from(competences);
  };
  
  const competences = extractCompetences();
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tableau-a':
        console.log('🚀 [' + new Date().toISOString() + '] CHARGEMENT RANG A AVEC VRAIES DONNÉES OIC');
        return (
          <EnhancedTableauDisplay
            itemCode={item.item_code}
            rang="A"
            title={item.title}
          />
        );
      
      case 'tableau-b':
        console.log('🚀 [' + new Date().toISOString() + '] CHARGEMENT RANG B AVEC VRAIES DONNÉES OIC');
        return (
          <EnhancedTableauDisplay
            itemCode={item.item_code}
            rang="B"
            title={item.title}
          />
        );
      
      case 'scene':
        return (
          <AdvancedSceneImmersive 
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
            competences={competences}
          />
        );
      
      case 'bd':
        return (
          <AdvancedBandeDessinee 
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
            competences={competences}
          />
        );
      
      case 'music':
        return (
          <AdvancedGenerationMusicale
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
            competences={competences}
          />
        );
      
      case 'quiz':
        return (
          <AdvancedQuizInteractif 
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
            competences={competences}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {renderActiveSection()}
    </div>
  );
};
