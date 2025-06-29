
import { TableauRangA } from '../tableau/TableauRangA';
import { TableauRangBIC4 } from '../tableau/TableauRangBIC4';
import { SceneImmersive } from '../SceneImmersive';
import { ParolesMusicales } from '../ParolesMusicales';
import { InteractionDragDrop } from '../InteractionDragDrop';
import { QuizFinal } from '../QuizFinal';
import { PitchIntroSection } from './PitchIntroSection';
import { isIC4Item } from '../tableau/TableauRangAUtilsIC4Integration';

interface ImmersiveContentProps {
  item: any;
  currentSection: number;
}

export const ImmersiveContent = ({ item, currentSection }: ImmersiveContentProps) => {
  const renderContent = () => {
    switch (currentSection) {
      case 0:
        return (
          <PitchIntroSection 
            title={item.title || ''}
            itemCode={item.item_code || ''}
            subtitle={item.subtitle || ''}
            pitchIntro={item.pitch_intro || ''}
          />
        );
      
      case 1:
        return <SceneImmersive data={item.scene_immersive} />;
      
      case 2:
        return <TableauRangA data={item} />;
      
      case 3:
        // Utiliser le composant spécialisé pour IC-4 Rang B
        if (isIC4Item(item)) {
          return <TableauRangBIC4 data={item} />;
        }
        return <TableauRangA data={{ ...item, tableau_rang_a: item.tableau_rang_b }} />;
      
      case 4:
        return <ParolesMusicales paroles={item.paroles_musicales} />;
      
      case 5:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bande dessinée</h2>
            <p className="text-gray-600">Cette section sera bientôt disponible.</p>
          </div>
        );
      
      case 6:
        return item.interaction_config ? (
          <InteractionDragDrop config={item.interaction_config} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Interaction</h2>
            <p className="text-gray-600">Aucune interaction configurée pour cet item.</p>
          </div>
        );
      
      case 7:
        return item.quiz_questions ? (
          <QuizFinal 
            questions={item.quiz_questions.questions || []} 
            rewards={item.reward_messages}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz final</h2>
            <p className="text-gray-600">Aucun quiz configuré pour cet item.</p>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Section non trouvée</h2>
            <p className="text-gray-600">Cette section n'existe pas.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {renderContent()}
    </div>
  );
};
