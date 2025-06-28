
import { ParolesMusicales } from '../ParolesMusicales';
import { TableauRangA } from '../TableauRangA';
import { TableauRangB } from '../TableauRangB';
import { BandeDessinee } from '../BandeDessinee';
import { InteractionDragDrop } from '../InteractionDragDrop';
import { QuizFinal } from '../QuizFinal';
import { SceneImmersive } from '../SceneImmersive';

interface ImmersiveContentProps {
  currentSection: number;
  item: any;
}

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  const renderContent = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-amber-900 mb-6">
                {item.title}
              </h1>
              {item.subtitle && (
                <p className="text-xl text-amber-700 mb-8">
                  {item.subtitle}
                </p>
              )}
              {item.pitch_intro && (
                <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                  <p className="text-lg text-amber-800 leading-relaxed">
                    {item.pitch_intro}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="p-6">
            <TableauRangA data={item.tableau_rang_a} />
          </div>
        );

      case 2:
        return (
          <div className="p-6">
            <TableauRangB data={item.tableau_rang_b} />
          </div>
        );

      case 3:
        return (
          <div className="p-6">
            <ParolesMusicales 
              paroles={item.paroles_musicales || []} 
              itemCode={item.item_code}
              itemTitle={item.title}
            />
          </div>
        );

      case 4:
        return (
          <div className="p-6">
            <BandeDessinee data={item.bd_data} />
          </div>
        );

      case 5:
        return (
          <div className="p-6">
            <InteractionDragDrop config={item.interaction_config} />
          </div>
        );

      case 6:
        return (
          <div className="p-6">
            <QuizFinal questions={item.quiz_questions || []} />
          </div>
        );

      case 7:
        return (
          <div className="p-6">
            <SceneImmersive scene={item.scene_immersive} />
          </div>
        );

      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-amber-900">
              Section en développement
            </h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[500px]">
      {renderContent()}
    </div>
  );
};
