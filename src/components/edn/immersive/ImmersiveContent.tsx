
import { PitchIntroSection } from './PitchIntroSection';
import { SceneImmersive } from '../SceneImmersive';
import { TableauRangA } from '../tableau/TableauRangA';
import { TableauRangB } from '../tableau/TableauRangB';
import { ParolesMusicales } from '../ParolesMusicales';
import { BandeDessinee } from '../BandeDessinee';
import { InteractionDragDrop } from '../InteractionDragDrop';
import { QuizFinal } from '../QuizFinal';

interface ImmersiveContentProps {
  currentSection: number;
  item: {
    id: string;
    title: string;
    subtitle?: string;
    item_code: string;
    pitch_intro?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    scene_immersive?: any;
    paroles_musicales?: string[];
    interaction_config?: any;
    quiz_questions?: any;
  };
}

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  console.log('ImmersiveContent - Section:', currentSection, 'Item:', item.item_code);

  const renderContent = () => {
    switch (currentSection) {
      case 0: // Pitch d'introduction
        return (
          <PitchIntroSection
            title={item.title}
            itemCode={item.item_code}
            subtitle={item.subtitle || ''}
            pitchIntro={item.pitch_intro || ''}
          />
        );

      case 1: // Scène immersive
        return (
          <SceneImmersive 
            data={item.scene_immersive || {}}
          />
        );

      case 2: // Tableau Rang A
        return (
          <TableauRangA 
            data={{
              tableau_rang_a: item.tableau_rang_a,
              title: item.title,
              item_code: item.item_code
            }}
          />
        );

      case 3: // Tableau Rang B
        return (
          <TableauRangB 
            data={{
              tableau_rang_b: item.tableau_rang_b,
              title: item.title,
              item_code: item.item_code
            }}
          />
        );

      case 4: // Paroles musicales
        return (
          <ParolesMusicales 
            paroles={item.paroles_musicales || []}
          />
        );

      case 5: // Bande dessinée
        return (
          <BandeDessinee 
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              slug: item.item_code.toLowerCase(),
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
          />
        );

      case 6: // Interaction
        return (
          <InteractionDragDrop 
            config={item.interaction_config}
          />
        );

      case 7: // Quiz final
        return (
          <QuizFinal 
            questions={item.quiz_questions}
          />
        );

      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Section non trouvée</h2>
            <p className="text-gray-600">Cette section n'existe pas encore.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[400px] p-4 sm:p-6">
      {renderContent()}
    </div>
  );
};
