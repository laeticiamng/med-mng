
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { EnhancedBandeDessinee } from '@/components/edn/EnhancedBandeDessinee';
import { TableauCompetencesOICWithRealData } from '@/components/edn/tableau/TableauCompetencesOICWithRealData';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { EnhancedQuizFinal } from '@/components/edn/EnhancedQuizFinal';
import { TranslatedText } from '@/components/TranslatedText';

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
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tableau-a':
        console.log('🚀 [' + new Date().toISOString() + '] CHARGEMENT RANG A AVEC VRAIES DONNÉES OIC');
        return (
          <div>
            <div style={{ 
              padding: '15px', 
              background: '#e8f5e8', 
              border: '2px solid #4ade80',
              marginBottom: '20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#166534'
            }}>
              ✅ NOUVEAU: Chargement des compétences OIC RÉELLES depuis backup_oic_competences pour {item.item_code} Rang A
            </div>
            <TableauCompetencesOICWithRealData 
              itemCode={item.item_code} 
              rang="A" 
            />
          </div>
        );
      
      case 'tableau-b':
        console.log('🚀 [' + new Date().toISOString() + '] CHARGEMENT RANG B AVEC VRAIES DONNÉES OIC');
        return (
          <div>
            <div style={{ 
              padding: '15px', 
              background: '#e0e7ff', 
              border: '2px solid #6366f1',
              marginBottom: '20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#3730a3'
            }}>
              ✅ NOUVEAU: Chargement des compétences OIC RÉELLES depuis backup_oic_competences pour {item.item_code} Rang B
            </div>
            <TableauCompetencesOICWithRealData 
              itemCode={item.item_code} 
              rang="B" 
            />
          </div>
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
        const hasLyrics = (item.paroles_rang_a && item.paroles_rang_a.length > 0) || 
                         (item.paroles_rang_b && item.paroles_rang_b.length > 0);
        
        if (!hasLyrics) {
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
            paroles_rang_a={item.paroles_rang_a}
            paroles_rang_b={item.paroles_rang_b}
            paroles_rang_ab={item.paroles_rang_ab}
            itemCode={item.item_code}
            tableauRangA={item.tableau_rang_a}
            tableauRangB={item.tableau_rang_b}
          />
        );
      
      case 'quiz':
        return item.quiz_questions ? (
          <EnhancedQuizFinal 
            questions={item.quiz_questions} 
            itemCode={item.item_code}
            itemTitle={item.title}
          />
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
