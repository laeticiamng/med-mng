import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Camera, Users, Sparkles, Eye } from 'lucide-react';
import { SceneBackground } from '../scene/SceneBackground';
import { SceneCentralArea } from '../scene/SceneCentralArea';
import { getUniqueSpectacularTheme } from '../scene/sceneThemes';
import MicroInteractions from '@/components/experience/MicroInteractions';

interface AdvancedSceneImmersiveProps {
  itemData: {
    id: string;
    title: string;
    scene_data?: {
      description?: string;
      mots_cles?: string[];
      effet?: string;
      setting?: string;
      characters?: Array<{
        name: string;
        role: string;
        description: string;
      }>;
      scenario?: string;
    };
    item_code?: string;
  };
  competences: string[];
  onProgress?: (progress: number) => void;
}

export const AdvancedSceneImmersive: React.FC<AdvancedSceneImmersiveProps> = ({ 
  itemData, 
  competences,
  onProgress 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<'characters' | 'competences' | 'excellence'>('characters');
  const [immersionLevel, setImmersionLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const theme = getUniqueSpectacularTheme(itemData.item_code || 'default');
  const sceneData = itemData.scene_data || {};

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 1, 100);
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 500);

      return () => clearInterval(timer);
    }
  }, [isPlaying, onProgress]);

  useEffect(() => {
    if (isPlaying) {
      const wordTimer = setInterval(() => {
        setCurrentWordIndex(prev => (prev + 1) % ((sceneData.mots_cles?.length || 1)));
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }, 2000);

      return () => clearInterval(wordTimer);
    }
  }, [isPlaying, sceneData.mots_cles]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && progress >= 100) {
      setProgress(0);
    }
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
    setCurrentWordIndex(0);
  };

  const handleSectionChange = (section: 'characters' | 'competences' | 'excellence') => {
    setActiveSection(section);
    setImmersionLevel(prev => Math.min(prev + 1, 5));
  };

  return (
    <Card className="relative min-h-[600px] overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
      <MicroInteractions>
        <div className="absolute inset-0">
          <SceneBackground theme={theme} itemCode={itemData.item_code || 'default'} />
        </div>

        <CardHeader className="relative z-10 bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: theme.gradientOverlay }}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Scène Immersive
                  <Badge variant="secondary" className="animate-pulse">
                    Niveau {immersionLevel}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {itemData.title} - Exploration interactive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={progress === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handlePlay}
                className="gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Démarrer'}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-6">
          {/* Navigation des sections */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { key: 'characters' as const, icon: Users, label: 'Personnages' },
              { key: 'competences' as const, icon: Sparkles, label: 'Compétences' },
              { key: 'excellence' as const, icon: Eye, label: 'Excellence' }
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={activeSection === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleSectionChange(key)}
                className="gap-2 transition-all duration-300"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Zone centrale interactive */}
          <div className="relative">
            <SceneCentralArea
              theme={theme}
              activeSection={activeSection}
              characters={sceneData.characters}
              motsCles={sceneData.mots_cles}
              currentWordIndex={currentWordIndex}
              isAnimating={isAnimating}
              effet={sceneData.effet}
            />
          </div>

          {/* Informations contextuelles */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: theme.accent }} />
                  Compétences développées
                </h4>
                <div className="flex flex-wrap gap-1">
                  {competences.map((comp, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {sceneData.scenario && (
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Camera className="h-4 w-4" style={{ color: theme.primary }} />
                    Scénario
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {sceneData.scenario}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </MicroInteractions>
    </Card>
  );
};