
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { TableauRangA } from '@/components/edn/TableauRangA';
import { TableauRangB } from '@/components/edn/tableau/TableauRangB';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { QuizFinal } from '@/components/edn/QuizFinal';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
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
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tableau-a':
        console.log('📋 Rendering Tableau Rang A for:', item.item_code);
        return item.tableau_rang_a ? (
          <TableauRangA data={item.tableau_rang_a} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Tableau Rang A en cours de développement" />
          </div>
        );
      
      case 'tableau-b':
        console.log('📋 Rendering Tableau Rang B for:', item.item_code);
        console.log('📊 Tableau Rang B raw data:', item.tableau_rang_b);
        
        // Passer les données complètes avec itemCode requis
        return (
          <TableauRangB 
            data={{
              title: item.title,
              item_code: item.item_code,
              tableau_rang_b: item.tableau_rang_b,
              // Forcer le thème Rang B pour le traitement
              theme: item.item_code === 'IC-2' ? 'Rang B - IC-2 Valeurs professionnelles' : undefined
            }}
            itemCode={item.item_code}
          />
        );
      
      case 'scene':
        return item.scene_immersive ? (
          <SceneImmersive data={item.scene_immersive} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Scène immersive en cours de développement" />
          </div>
        );
      
      case 'bd':
        return (
          <EnhancedBandeDessinee 
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
      
      case 'music':
        if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
          return (
            <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
              <Music className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                <TranslatedText text="Paroles musicales en préparation" />
              </h3>
              <p className="text-amber-600 mb-4">
                <TranslatedText text="Les paroles pour cet item sont en cours de création." />
              </p>
              <Link to="/edn/music-library">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Music className="h-4 w-4 mr-2" />
                  <TranslatedText text="Voir ma bibliothèque musicale" />
                </Button>
              </Link>
            </div>
          );
        }
        
        return (
          <ParolesMusicales 
            paroles={item.paroles_musicales} 
            itemCode={item.item_code}
            tableauRangA={item.tableau_rang_a}
            tableauRangB={item.tableau_rang_b}
          />
        );
      
      case 'quiz':
        return item.quiz_questions ? (
          <QuizFinal questions={item.quiz_questions} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Quiz en cours de développement" />
          </div>
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
