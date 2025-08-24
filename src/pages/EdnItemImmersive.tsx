
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Volume2, BookOpen } from 'lucide-react';
import { ImmersiveHeader } from '@/components/edn/immersive/ImmersiveHeader';
import { ImmersiveNavigation } from '@/components/edn/immersive/ImmersiveNavigation';
import { ImmersiveContent } from '@/components/edn/immersive/ImmersiveContent';
import { useImmersiveLogic } from '@/components/edn/immersive/useImmersiveLogic';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

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
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center relative z-10">
            <div className="animate-pulse text-2xl sm:text-3xl text-foreground mb-3 font-bold">Chargement de l'expérience immersive...</div>
            <p className="text-lg sm:text-xl text-muted-foreground">Préparation du contenu pédagogique avancé</p>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  if (!item) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Item non trouvé</h1>
            <Link 
              to="/edn" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ← Retour à la liste des items EDN
            </Link>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="secondary">
      <PageHeader
        title={item?.title || "Expérience Immersive"}
        subtitle={`Mode immersif avancé - Section ${currentSection + 1} sur ${sections.length}`}
        icon={BookOpen}
        badge={{
          text: item?.item_code || "EDN",
          variant: "outline"
        }}
        showBackButton
        backTo="/edn"
      />

      <div className="pt-16 pb-6 px-4 relative z-10" style={{ paddingTop: '2rem' }}>
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
    </ConsistentBackground>
  );
};

export default EdnItemImmersive;
