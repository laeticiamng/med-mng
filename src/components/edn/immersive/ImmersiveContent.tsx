
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

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  console.log('ImmersiveContent - currentSection:', currentSection);
  console.log('ImmersiveContent - item data:', item);
  console.log('ImmersiveContent - tableau_rang_a data:', item.tableau_rang_a);
  console.log('ImmersiveContent - tableau_rang_a type:', typeof item.tableau_rang_a);

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
        console.log('Rendering TableauRangA with data:', item.tableau_rang_a);
        
        // Vérifier si tableau_rang_a existe
        if (!item.tableau_rang_a) {
          console.log('tableau_rang_a is null or undefined');
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
              <p className="text-amber-700">Contenu en cours de préparation...</p>
            </div>
          );
        }

        // Parser le JSON si c'est une string
        let tableauData = item.tableau_rang_a;
        if (typeof item.tableau_rang_a === 'string') {
          try {
            tableauData = JSON.parse(item.tableau_rang_a);
            console.log('Parsed tableau_rang_a:', tableauData);
          } catch (error) {
            console.error('Error parsing tableau_rang_a JSON:', error);
            return (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
                <p className="text-amber-700">Erreur dans le format des données...</p>
              </div>
            );
          }
        }

        // Vérifier que les données parsées ont la bonne structure
        if (!tableauData || !tableauData.colonnes || !tableauData.lignes) {
          console.log('tableau_rang_a missing required properties:', tableauData);
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
              <p className="text-amber-700">Structure de données incomplète...</p>
            </div>
          );
        }

        return <TableauRangA data={tableauData} />;
      case 3:
        return <TableauRangB data={item.tableau_rang_b} />;
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
