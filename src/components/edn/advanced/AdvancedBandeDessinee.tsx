import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Sparkles, Zap } from 'lucide-react';
import MicroInteractions from '@/components/experience/MicroInteractions';

interface AdvancedBandeDessineeProps {
  itemData: {
    id: string;
    title: string;
    bd_data?: {
      pages?: Array<{
        id: string;
        imageUrl?: string;
        text?: string;
        dialogue?: string[];
        effects?: string[];
      }>;
      characters?: Array<{
        name: string;
        description: string;
        color?: string;
      }>;
    };
    item_code?: string;
  };
  competences: string[];
  onProgress?: (progress: number) => void;
}

export const AdvancedBandeDessinee: React.FC<AdvancedBandeDessineeProps> = ({
  itemData,
  competences,
  onProgress
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('single');
  const [showEffects, setShowEffects] = useState(true);

  const bdData = itemData.bd_data || {};
  const pages = bdData.pages || [];
  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (isAutoPlay && totalPages > 0) {
      const timer = setInterval(() => {
        setCurrentPageIndex(prev => {
          const nextIndex = prev < totalPages - 1 ? prev + 1 : 0;
          const progress = ((nextIndex + 1) / totalPages) * 100;
          setReadingProgress(progress);
          onProgress?.(progress);
          return nextIndex;
        });
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [isAutoPlay, totalPages, onProgress]);

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      const newIndex = currentPageIndex + 1;
      setCurrentPageIndex(newIndex);
      const progress = ((newIndex + 1) / totalPages) * 100;
      setReadingProgress(progress);
      onProgress?.(progress);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      const progress = ((newIndex + 1) / totalPages) * 100;
      setReadingProgress(progress);
      onProgress?.(progress);
    }
  };

  const resetReading = () => {
    setCurrentPageIndex(0);
    setReadingProgress(0);
    setIsAutoPlay(false);
    onProgress?.(0);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const mockPages = totalPages === 0 ? [
    {
      id: '1',
      imageUrl: '/placeholder.svg',
      text: 'Page de démonstration',
      dialogue: ['Bienvenue dans cette bande dessinée interactive !', 'Explorez l\'histoire page par page.'],
      effects: ['✨', '💫']
    },
    {
      id: '2', 
      imageUrl: '/placeholder.svg',
      text: 'Deuxième page',
      dialogue: ['L\'aventure continue...', 'Découvrez de nouveaux éléments.'],
      effects: ['🌟', '⭐']
    }
  ] : pages;

  const displayPages = totalPages === 0 ? mockPages : pages;
  const displayCurrentPage = displayPages[currentPageIndex];

  return (
    <Card className="min-h-[700px] bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
      <MicroInteractions>
        <CardHeader className="bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Bande Dessinée Interactive
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {currentPageIndex + 1} / {displayPages.length}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {itemData.title} - Lecture immersive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEffects(!showEffects)}
                className={showEffects ? 'bg-blue-100' : ''}
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetReading}
                disabled={currentPageIndex === 0 && !isAutoPlay}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={toggleAutoPlay}
                className="gap-2"
              >
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoPlay ? 'Pause' : 'Auto'}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression de lecture</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Zone de lecture principale */}
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden mb-6" style={{ aspectRatio: '16/10' }}>
            {/* Image de la page */}
            <div className="relative h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              {displayCurrentPage?.imageUrl ? (
                <img 
                  src={displayCurrentPage.imageUrl} 
                  alt={`Page ${currentPageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-semibold">{displayCurrentPage?.text || `Page ${currentPageIndex + 1}`}</p>
                </div>
              )}

              {/* Effets visuels */}
              {showEffects && displayCurrentPage?.effects && (
                <div className="absolute inset-0 pointer-events-none">
                  {displayCurrentPage.effects.map((effect, index) => (
                    <div
                      key={index}
                      className="absolute text-2xl animate-bounce"
                      style={{
                        left: `${20 + (index * 20)}%`,
                        top: `${15 + (index * 15)}%`,
                        animationDelay: `${index * 0.5}s`,
                        animationDuration: '2s'
                      }}
                    >
                      {effect}
                    </div>
                  ))}
                </div>
              )}

              {/* Bulles de dialogue */}
              {displayCurrentPage?.dialogue && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    {displayCurrentPage.dialogue.map((line, index) => (
                      <p key={index} className="text-sm mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0}
                className="rounded-r-none bg-white/80 hover:bg-white/90"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPageIndex === displayPages.length - 1}
                className="rounded-l-none bg-white/80 hover:bg-white/90"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Miniatures des pages */}
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
            {displayPages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => {
                  setCurrentPageIndex(index);
                  const progress = ((index + 1) / displayPages.length) * 100;
                  setReadingProgress(progress);
                  onProgress?.(progress);
                }}
                className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                  index === currentPageIndex 
                    ? 'border-blue-500 bg-blue-100' 
                    : 'border-muted bg-muted/50 hover:border-blue-300'
                }`}
              >
                <div className="w-full h-full rounded bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-xs">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>

          {/* Personnages */}
          {bdData.characters && bdData.characters.length > 0 && (
            <Card className="bg-background/50 mb-6">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Personnages
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bdData.characters.map((character, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: character.color || '#6366f1' }}
                      >
                        {character.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{character.name}</p>
                        <p className="text-xs text-muted-foreground">{character.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compétences développées */}
          <Card className="bg-background/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Compétences développées
              </h4>
              <div className="flex flex-wrap gap-2">
                {competences.map((comp, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </MicroInteractions>
    </Card>
  );
};