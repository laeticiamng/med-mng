import React from 'react';
import { useImmersiveLogic } from '@/components/edn/immersive/useImmersiveLogic';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft, Play, Pause, Volume2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ImmersiveContent } from '@/components/edn/immersive/ImmersiveContent';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const EdnImmersive = () => {
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
    return <LoadingSpinner />;
  }

  if (!item) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Item non trouvé</h2>
            <p className="text-muted-foreground">L'item EDN demandé n'existe pas ou n'est pas disponible.</p>
            <Link to="/edn" className="mt-4 inline-block">
              <Button>Retour à la liste</Button>
            </Link>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  const hasNext = currentSection < sections.length - 1;
  const hasPrev = currentSection > 0;

  return (
    <ConsistentBackground variant="tertiary">
      <PageHeader
        title={item?.title || "Expérience Immersive EDN"}
        subtitle={`Mode immersif - Section ${currentSection + 1} sur ${sections.length}`}
        icon={BookOpen}
        badge={{
          text: item?.item_code || "EDN",
          variant: "outline"
        }}
        showBackButton
        backTo="/edn"
        actions={
          <Button
            onClick={toggleAudio}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Audio
          </Button>
        }
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Section {currentSection + 1} sur {sections.length}</span>
            <span>{Math.round(progress)}% complété</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-sm font-medium text-primary">
            {sections[currentSection]}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg sticky top-32">
              <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
              
              <div className="space-y-2 mb-6">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setSection(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      index === currentSection
                        ? 'bg-primary/10 text-primary border-2 border-primary/30'
                        : index < currentSection
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentSection
                          ? 'bg-primary text-primary-foreground'
                          : index < currentSection
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      {section}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={prevSection}
                  disabled={!hasPrev}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Précédent
                </Button>
                <Button
                  onClick={nextSection}
                  disabled={!hasNext}
                  size="sm"
                  className="flex-1"
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <ImmersiveContent
                item={item}
                currentSection={currentSection}
                sections={sections}
              />
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default EdnImmersive;