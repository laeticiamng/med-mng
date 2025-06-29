import React from 'react';
import { TableauSection } from './TableauSection';
import { QuizSection } from './QuizSection';
import { ParolesMusicales } from '../ParolesMusicales';
import { BandesDessinées } from '../BandesDessinées';
import { InteractionSection } from './InteractionSection';
import { Badge } from '@/components/ui/badge';

interface ImmersiveContentProps {
  item: any;
  currentSection: number;
  sections: string[];
}

export const ImmersiveContent: React.FC<ImmersiveContentProps> = ({
  item,
  currentSection,
  sections
}) => {
  const renderSection = () => {
    const sectionName = sections[currentSection];
    
    switch (currentSection) {
      case 0: // Pitch d'introduction
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            {item.pitch_intro ? (
              <p className="text-lg leading-relaxed">{item.pitch_intro}</p>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">⚠️ Pitch d'introduction non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 1: // Scène immersive
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Scène immersive</h2>
            {item.scene_immersive ? (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Contexte</h3>
                <p className="text-gray-700 mb-4">{item.scene_immersive.setting || 'Contexte médical professionnel'}</p>
                
                {item.scene_immersive.characters && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Personnages :</h4>
                    <div className="space-y-2">
                      {item.scene_immersive.characters.map((char: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline">{char.role}</Badge>
                          <span>{char.name} - {char.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.scene_immersive.scenario && (
                  <div>
                    <h4 className="font-semibold mb-2">Scénario :</h4>
                    <p className="text-gray-700">{item.scene_immersive.scenario}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">⚠️ Scène immersive non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 2: // Tableau Rang A
        return (
          <TableauSection
            data={item.tableau_rang_a}
            title="Fondamentaux - Rang A"
            type="rang_a"
          />
        );

      case 3: // Tableau Rang B
        return (
          <TableauSection
            data={item.tableau_rang_b}
            title="Approfondissements - Rang B"
            type="rang_b"
          />
        );

      case 4: // Paroles musicales
        return (
          <ParolesMusicales
            paroles={item.paroles_musicales}
            itemCode={item.item_code}
            tableauRangA={item.tableau_rang_a}
            tableauRangB={item.tableau_rang_b}
          />
        );

      case 5: // Bande dessinée
        return (
          <BandesDessinées
            itemCode={item.item_code}
            title={item.title}
            content={item.tableau_rang_a}
          />
        );

      case 6: // Interaction
        return (
          <InteractionSection
            interactionConfig={item.interaction_config}
            itemCode={item.item_code}
          />
        );

      case 7: // Quiz final
        return (
          <QuizSection
            quizData={item.quiz_questions}
            itemCode={item.item_code}
          />
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700">Section en cours de développement...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[600px]">
      {renderSection()}
    </div>
  );
};
