import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EdnItemHeader } from '@/components/edn/item/EdnItemHeader';
import { EdnItemNavigation } from '@/components/edn/item/EdnItemNavigation';
import { EdnItemContent } from '@/components/edn/item/EdnItemContent';
import { useEdnItem } from '@/hooks/useEdnItem';
import { TranslatedText } from '@/components/TranslatedText';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { EdnImmersiveScene } from '@/components/immersive/EdnImmersiveScene';
import { CompetenceTracker } from '@/components/immersive/CompetenceTracker';
import { BookOpen, Brain } from 'lucide-react';

type SectionType = 'immersive' | 'competences' | 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const EdnItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('immersive');

  if (loading) {
    return (
      <ImmersiveLayout 
        variant="medical"
        intensity="low"
      >
        <div className="min-h-screen flex items-center justify-center">        
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-white mb-3">
              <TranslatedText text="Chargement de l'expérience immersive" />
            </h2>
            <p className="text-gray-300 text-lg">
              <TranslatedText text="Préparation des compétences et objectifs d'apprentissage..." />
            </p>
          </div>
        </div>
      </ImmersiveLayout>
    );
  }

  if (!item) {
    return (
      <ImmersiveLayout 
        variant="medical"
        intensity="low"
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">
              <TranslatedText text="Item EDN non trouvé" />
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              <TranslatedText text="L'item demandé n'existe pas ou n'est pas disponible." />
            </p>
          </div>
        </div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout
      variant="medical"
      intensity="medium"
      header={{
        title: item.title,
        subtitle: `Item EDN ${item.item_code} - Expérience d'apprentissage immersive`,
        icon: <BookOpen className="h-6 w-6" />,
        badge: { text: item.item_code, color: 'blue' },
        backTo: "/edn",
        actions: (
          <div className="flex gap-2">
            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Brain className="h-4 w-4 text-white" />
            </button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Enhanced Navigation */}
        <EdnItemNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        
        {/* Dynamic Content Based on Section */}
        {activeSection === 'immersive' && (
          <EdnImmersiveScene 
            item={item}
            onProgressUpdate={(progress) => console.log('Progress:', progress)}
          />
        )}
        
        {activeSection === 'competences' && (
          <CompetenceTracker 
            competences={[
              ...(item.competences_oic_rang_a || []),
              ...(item.competences_oic_rang_b || [])
            ]}
            onCompetenceSelect={(comp) => console.log('Selected:', comp)}
            onStartPractice={(comp) => console.log('Practice:', comp)}
          />
        )}
        
        {!['immersive', 'competences'].includes(activeSection) && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8">
              <EdnItemContent activeSection={activeSection} item={item} />
            </div>
          </div>
        )}
      </div>
    </ImmersiveLayout>
  );
};

export default EdnItem;