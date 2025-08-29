import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EdnItemContent } from '@/components/edn/item/EdnItemContent';
import { useEdnItem } from '@/hooks/useEdnItem';
import { TranslatedText } from '@/components/TranslatedText';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { ImmersiveEdnExperience } from '@/components/edn/immersive/ImmersiveEdnExperience';
import { EnhancedLearningExperience } from '@/components/edn/immersive/EnhancedLearningExperience';
import { AdvancedInteractionTracker } from '@/components/edn/immersive/AdvancedInteractionTracker';
import { AdvancedEdnNavigation } from '@/components/edn/navigation/AdvancedEdnNavigation';
import { useCompetenceAnalyzer } from '@/components/edn/immersive/CompetenceAnalyzer';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const EdnItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');
  const [sectionProgress, setSectionProgress] = useState<any[]>([]);

  // Analyser les compétences de l'item
  const { competences, primaryCompetence } = useCompetenceAnalyzer({
    itemCode: item?.item_code || '',
    title: item?.title || '',
    tableau_rang_a: item?.tableau_rang_a,
    tableau_rang_b: item?.tableau_rang_b,
    competences_oic_rang_a: item?.competences_oic_rang_a,
    competences_oic_rang_b: item?.competences_oic_rang_b
  });

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
  };

  const handleProgressUpdate = (sectionId: string, data: any) => {
    setSectionProgress(prev => {
      const existingIndex = prev.findIndex(p => p.sectionId === sectionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...data };
        return updated;
      } else {
        return [...prev, { sectionId, ...data }];
      }
    });
  };

  if (loading) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">        
          <div className="text-center relative z-10">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              <TranslatedText text="Chargement de l'item EDN" />
            </h2>
            <p className="text-muted-foreground text-lg">
              <TranslatedText text="Préparation du contenu pédagogique complet..." />
            </p>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  if (!item) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center relative z-10">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              <TranslatedText text="Item EDN non trouvé" />
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              <TranslatedText text="L'item demandé n'existe pas ou n'est pas disponible." />
            </p>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen">
        <EnhancedLearningExperience
          itemCode={item.item_code}
          currentSection={activeSection}
          onSectionChange={handleSectionChange}
        >
          <AdvancedInteractionTracker
            sectionId={activeSection}
            onDataUpdate={(data) => handleProgressUpdate(activeSection, data)}
          >
            <ImmersiveEdnExperience
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              item={item}
            >
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Navigation latérale */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      <AdvancedEdnNavigation
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        competences={competences}
                        itemTitle={item.title}
                        progress={sectionProgress}
                      />
                    </div>
                  </div>
                  
                  {/* Contenu principal */}
                  <div className="lg:col-span-3">
                    <EdnItemContent activeSection={activeSection} item={item} />
                  </div>
                </div>
              </div>
            </ImmersiveEdnExperience>
          </AdvancedInteractionTracker>
        </EnhancedLearningExperience>
      </div>
    </ConsistentBackground>
  );
};

export default EdnItem;