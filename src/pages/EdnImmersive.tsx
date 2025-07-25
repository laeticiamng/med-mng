import React from 'react';
import { useImmersiveLogic } from '@/components/edn/immersive/useImmersiveLogic';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ImmersiveContent } from '@/components/edn/immersive/ImmersiveContent';

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item non trouvé</h2>
          <p className="text-gray-600">L'item EDN demandé n'existe pas ou n'est pas disponible.</p>
          <Link to="/edn-complete" className="mt-4 inline-block">
            <Button>Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasNext = currentSection < sections.length - 1;
  const hasPrev = currentSection > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/edn-complete" className="flex items-center gap-2 text-amber-700 hover:text-amber-900">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {item.item_code}
              </Badge>
              <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleAudio}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                Audio
              </Button>
              <Volume2 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Section {currentSection + 1} sur {sections.length}</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-sm font-medium text-amber-700">
              {sections[currentSection]}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              
              <div className="space-y-2 mb-6">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setSection(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      index === currentSection
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                        : index < currentSection
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentSection
                          ? 'bg-amber-500 text-white'
                          : index < currentSection
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <ImmersiveContent
                item={item}
                currentSection={currentSection}
                sections={sections}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdnImmersive;