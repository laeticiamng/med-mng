
import React from 'react';
import { TableauSection } from './TableauSection';
import { QuizSection } from './QuizSection';
import { ParolesMusicales } from '../ParolesMusicales';
import { BandeDessinee } from '../BandeDessinee';
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
    
    console.log('🎵 Rendu section:', currentSection, 'paroles_musicales:', item.paroles_musicales);
    
    switch (currentSection) {
      case 0: // Pitch d'introduction
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            {item.pitch_intro ? (
              <p className="text-lg leading-relaxed">{item.pitch_intro}</p>
            ) : (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded">
                <p className="text-destructive">⚠️ Pitch d'introduction non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 1: // Scène immersive
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Scène immersive</h2>
            {item.scene_immersive ? (
              <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Contexte</h3>
                <p className="text-muted-foreground mb-4">{item.scene_immersive.setting || 'Contexte médical professionnel'}</p>
                
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
                    <p className="text-muted-foreground">{item.scene_immersive.scenario}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
                <p className="text-destructive">⚠️ Scène immersive non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 2: // Tableau Rang A
        return (
          <TableauSection
            key={`rang-a-${item.slug}-${currentSection}`}
            data={item.tableau_rang_a}
            title="Fondamentaux - Rang A"
            type="rang_a"
          />
        );

      case 3: // Tableau Rang B
        return (
          <TableauSection
            key={`rang-b-${item.slug}-${currentSection}`}
            data={item.tableau_rang_b}
            title="Approfondissements - Rang B"
            type="rang_b"
          />
        );

      case 4: // Paroles musicales
        console.log('🎵 Affichage section Paroles musicales, données:', {
          paroles: item.paroles_musicales,
          length: item.paroles_musicales?.length,
          item_code: item.item_code
        });
        
        return (
          <div>
            {/* Toujours afficher la section, même si les paroles sont incomplètes */}
            <ParolesMusicales
              paroles={item.paroles_musicales || []}
              itemCode={item.item_code}
              tableauRangA={item.tableau_rang_a}
              tableauRangB={item.tableau_rang_b}
            />
            
            {/* Afficher un avertissement si les paroles sont insuffisantes */}
            {(!item.paroles_musicales || item.paroles_musicales.length < 2) && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-warning">
                  ⚠️ <strong>Paroles incomplètes</strong> - Cet item nécessite des paroles plus complètes avec au moins 3 couplets et un refrain répété.
                </p>
                <p className="text-warning/80 mt-2 text-sm">
                  Données actuelles : {item.paroles_musicales?.length || 0} paragraphe(s) trouvé(s)
                </p>
              </div>
            )}
          </div>
        );

      case 5: // Bande dessinée
        return (
          <BandeDessinee
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              slug: item.slug,
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a,
              tableau_rang_b: item.tableau_rang_b
            }}
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
          <div className="p-4 bg-warning/10 border border-warning/30 rounded">
            <p className="text-warning">Section en cours de développement...</p>
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
