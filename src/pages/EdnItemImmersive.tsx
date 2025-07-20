
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 relative overflow-hidden">
      {/* Background texture - hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-20 hidden sm:block">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23D4A574&quot; fill-opacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <ImmersiveHeader
        isAudioPlaying={isAudioPlaying}
        currentSection={currentSection}
        sectionsLength={sections.length}
        progress={progress}
        currentSectionName={sections[currentSection]}
        onToggleAudio={toggleAudio}
      />

      {/* Main content - responsive padding */}
      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl overflow-hidden">
          <ImmersiveContent 
            key={`content-${item.slug}-${currentSection}`}
            currentSection={currentSection} 
            item={item} 
            sections={sections}
          />
          
          <ImmersiveNavigation
            currentSection={currentSection}
            sectionsLength={sections.length}
            onPrevSection={prevSection}
            onNextSection={nextSection}
            onSetSection={setSection}
          />
        </Card>
      </div>

      {/* Floating audio indicator - responsive positioning */}
      {isAudioPlaying && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-amber-600 text-white p-2 sm:p-3 rounded-full shadow-lg animate-pulse z-50">
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      )}
    </div>
  );
};

export default EdnItemImmersive;
