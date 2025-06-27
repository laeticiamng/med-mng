
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { TableauRangA } from '@/components/edn/TableauRangA';
import { TableauRangB } from '@/components/edn/TableauRangB';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { InteractionDragDrop } from '@/components/edn/InteractionDragDrop';
import { QuizFinal } from '@/components/edn/QuizFinal';
import { PitchIntroSection } from './PitchIntroSection';

interface EdnItemImmersive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  item_code: string;
  pitch_intro: string;
  visual_ambiance: any;
  audio_ambiance: any;
  tableau_rang_a: any;
  tableau_rang_b: any;
  scene_immersive: any;
  paroles_musicales: string[];
  interaction_config: any;
  quiz_questions: any;
  reward_messages: any;
}

interface ImmersiveContentProps {
  currentSection: number;
  item: EdnItemImmersive;
}

// Fonction utilitaire pour parser les données JSON de manière sécurisée
const parseJSONSafely = (data: any, defaultValue: any = null) => {
  if (!data) {
    console.log('parseJSONSafely: No data provided');
    return defaultValue;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      console.log('parseJSONSafely: Successfully parsed JSON string:', parsed);
      return parsed;
    } catch (error) {
      console.error('parseJSONSafely: Error parsing JSON string:', error);
      return defaultValue;
    }
  }
  
  if (typeof data === 'object') {
    console.log('parseJSONSafely: Data is already an object:', data);
    return data;
  }
  
  console.log('parseJSONSafely: Unknown data type:', typeof data, data);
  return defaultValue;
};

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  console.log('ImmersiveContent - currentSection:', currentSection);
  console.log('ImmersiveContent - item data:', item);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <PitchIntroSection
            title={item.title}
            itemCode={item.item_code}
            subtitle={item.subtitle}
            pitchIntro={item.pitch_intro}
          />
        );
      case 1:
        return <SceneImmersive data={item.scene_immersive} />;
      case 2:
        console.log('Rendering TableauRangA - Raw data:', item.tableau_rang_a);
        console.log('Rendering TableauRangA - Data type:', typeof item.tableau_rang_a);
        
        const tableauRangAData = parseJSONSafely(item.tableau_rang_a);
        console.log('Rendering TableauRangA - Parsed data:', tableauRangAData);
        
        if (!tableauRangAData || !tableauRangAData.colonnes || !tableauRangAData.lignes) {
          console.error('TableauRangA: Invalid data structure:', tableauRangAData);
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
              <p className="text-amber-700">Données du tableau non disponibles ou invalides</p>
              <pre className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
                Raw data: {JSON.stringify(item.tableau_rang_a, null, 2)}
              </pre>
            </div>
          );
        }
        
        return <TableauRangA data={tableauRangAData} />;
        
      case 3:
        console.log('Rendering TableauRangB - Raw data:', item.tableau_rang_b);
        console.log('Rendering TableauRangB - Data type:', typeof item.tableau_rang_b);
        
        const tableauRangBData = parseJSONSafely(item.tableau_rang_b);
        console.log('Rendering TableauRangB - Parsed data:', tableauRangBData);
        
        if (!tableauRangBData || !tableauRangBData.colonnes || !tableauRangBData.lignes) {
          console.error('TableauRangB: Invalid data structure:', tableauRangBData);
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang B</h2>
              <p className="text-amber-700">Données du tableau non disponibles ou invalides</p>
              <pre className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
                Raw data: {JSON.stringify(item.tableau_rang_b, null, 2)}
              </pre>
            </div>
          );
        }
        
        return <TableauRangB data={tableauRangBData} />;
        
      case 4:
        return <ParolesMusicales paroles={item.paroles_musicales} />;
      case 5:
        return <BandeDessinee itemData={{ ...item, slug: item.slug }} />;
      case 6:
        return <InteractionDragDrop config={item.interaction_config} />;
      case 7:
        return <QuizFinal questions={item.quiz_questions} rewards={item.reward_messages} />;
      default:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-serif text-amber-900">Section non trouvée</h2>
            <p className="text-amber-700">Cette section n'existe pas encore.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-8 min-h-[600px]">
      {renderCurrentSection()}
    </div>
  );
};
