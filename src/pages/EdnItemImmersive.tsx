
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import { ImmersiveHeader } from '@/components/edn/immersive/ImmersiveHeader';
import { ImmersiveNavigation } from '@/components/edn/immersive/ImmersiveNavigation';
import { ImmersiveContent } from '@/components/edn/immersive/ImmersiveContent';
import { useImmersiveLogic } from '@/components/edn/immersive/useImmersiveLogic';

const EdnItemImmersive = () => {
  const {
    item,
    currentSection,
    isAudioPlaying,
    progress,
    loading,
    sections,
    toggleAudio,
    nextSection,
    prevSection,
    setSection
  } = useImmersiveLogic();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-pulse text-xl sm:text-2xl text-amber-800 mb-2">Chargement de l'expérience immersive...</div>
          <p className="text-sm sm:text-base text-amber-600">Préparation du contenu pédagogique</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-amber-800 mb-4">Item non trouvé</h1>
          <Link to="/edn" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
            Retour à la liste des items EDN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 overflow-auto">
      <ImmersiveHeader
        isAudioPlaying={isAudioPlaying}
        currentSection={currentSection}
        sectionsLength={sections.length}
        progress={progress}
        currentSectionName={sections[currentSection] || 'Section inconnue'}
        onToggleAudio={toggleAudio}
      />
      
      <div className="pt-16 pb-6 px-4" style={{ paddingTop: '4.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <ImmersiveNavigation
            sections={sections}
            currentSection={currentSection}
            onSectionChange={setSection}
            progress={progress}
            hasNext={currentSection < sections.length - 1}
            hasPrev={currentSection > 0}
            onNext={nextSection}
            onPrev={prevSection}
          />
          
          <div className="mt-6 overflow-auto max-h-screen pb-20">
            <ImmersiveContent
              item={item}
              currentSection={currentSection}
              sections={sections}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdnItemImmersive;
