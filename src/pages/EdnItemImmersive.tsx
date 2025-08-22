
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 flex items-center justify-center px-4 relative">
        {/* Suno-style aura effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-pulse text-2xl sm:text-3xl text-white mb-3 font-bold">Chargement de l'expérience immersive...</div>
          <p className="text-lg sm:text-xl text-gray-300">Préparation du contenu pédagogique avancé</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 flex items-center justify-center px-4 relative">
        {/* Suno-style aura effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Item non trouvé</h1>
          <Link 
            to="/edn" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/30"
          >
            ← Retour à la liste des items EDN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 relative overflow-auto">
      {/* Suno-style aura effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <ImmersiveHeader
        isAudioPlaying={isAudioPlaying}
        currentSection={currentSection}
        sectionsLength={sections.length}
        progress={progress}
        currentSectionName={sections[currentSection] || 'Section inconnue'}
        onToggleAudio={toggleAudio}
      />
      
      <div className="pt-16 pb-6 px-4 relative z-10" style={{ paddingTop: '4.5rem' }}>
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
