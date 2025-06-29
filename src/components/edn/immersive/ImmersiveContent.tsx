
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
        return <SceneImmersive data={item.scene_immersive} itemCode={item.item_code} />;
      
      case 2:
        // Vérifier que les données tableau_rang_a existent
        if (!item.tableau_rang_a) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">📊</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  Tableau Rang A en cours de finalisation
                </h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Le contenu du Tableau Rang A pour {item.item_code} est en cours de mise à jour depuis Supabase.
              </p>
              <div className="text-sm text-yellow-600 bg-yellow-100 rounded p-3">
                <p><strong>Item:</strong> {item.item_code} - {item.title}</p>
                <p><strong>Status:</strong> Données Supabase en cours de synchronisation</p>
              </div>
            </div>
          );
        }
        return <TableauRangA data={item.tableau_rang_a} />;
      
      case 3:
        // Vérifier que les données tableau_rang_b existent
        if (!item.tableau_rang_b) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">📊</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  Tableau Rang B en cours de finalisation
                </h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Le contenu du Tableau Rang B pour {item.item_code} est en cours de mise à jour depuis Supabase.
              </p>
              <div className="text-sm text-yellow-600 bg-yellow-100 rounded p-3">
                <p><strong>Item:</strong> {item.item_code} - {item.title}</p>
                <p><strong>Status:</strong> Données Supabase en cours de synchronisation</p>
              </div>
            </div>
          );
        }
        
        // Utiliser le composant spécialisé pour IC-4 Rang B
        if (isIC4Item(item)) {
          return <TableauRangBIC4 data={item.tableau_rang_b} />;
        }
        return <TableauRangA data={item.tableau_rang_b} />;
      
      case 4:
        // Vérifier que les paroles musicales existent et sont complètes
        if (!item.paroles_musicales || item.paroles_musicales.length < 2) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">🎵</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  Paroles musicales en cours de finalisation
                </h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Les paroles musicales pour {item.item_code} sont en cours de mise à jour depuis Supabase.
              </p>
              <div className="text-sm text-yellow-600 bg-yellow-100 rounded p-3">
                <p><strong>Item:</strong> {item.item_code} - {item.title}</p>
                <p><strong>Paroles disponibles:</strong> {item.paroles_musicales?.length || 0}/2 rangs</p>
                <p><strong>Status:</strong> Données Supabase en cours de synchronisation</p>
              </div>
            </div>
          );
        }

        console.log('🎵 Section Paroles Musicales - Item data:', {
          item_code: item.item_code,
          title: item.title,
          paroles_musicales: item.paroles_musicales,
          paroles_length: item.paroles_musicales?.length || 0
        });
        
        return (
          <ParolesMusicales 
            paroles={item.paroles_musicales || []} 
            itemCode={item.item_code}
            itemTitle={item.title}
          />
        );
      
      case 5:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bande dessinée</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 font-medium">🎨 Génération d'images en cours</p>
              <p className="text-blue-600 text-sm mt-2">
                Les images de bande dessinée sont en cours de génération depuis Supabase et seront figées pour une expérience optimale.
              </p>
            </div>
            <p className="text-gray-600">Cette section sera bientôt disponible avec des vraies images générées.</p>
          </div>
        );
      
      case 6:
        if (!item.interaction_config) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">🎯</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  Interaction en cours de finalisation
                </h3>
              </div>
              <p className="text-yellow-700 mb-4">
                L'interaction pour {item.item_code} est en cours de mise à jour depuis Supabase.
              </p>
            </div>
          );
        }
        return <InteractionDragDrop config={item.interaction_config} />;
      
      case 7:
        if (!item.quiz_questions) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">❓</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  Quiz en cours de finalisation
                </h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Le quiz pour {item.item_code} est en cours de mise à jour depuis Supabase.
              </p>
              <p className="text-yellow-600 text-sm">
                <strong>Répartition cible:</strong> 70% questions Rang A, 30% questions Rang B
              </p>
            </div>
          );
        }
        return (
          <QuizFinal 
            questions={item.quiz_questions.questions || []} 
            rewards={item.reward_messages}
          />
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
