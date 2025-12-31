
import { useEffect, useState, useRef, useCallback } from 'react';
import { SceneImmersiveProps, SceneData, SceneCharacter } from './scene/sceneTypes';
import { getUniqueSpectacularTheme } from './scene/sceneThemes';
import { SceneBackground } from './scene/SceneBackground';
import { SceneHeader } from './scene/SceneHeader';
import { SceneCentralArea } from './scene/SceneCentralArea';
import { SceneConclusion } from './scene/SceneConclusion';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Star, Pause, Play, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SceneImmersive = ({ data, itemCode = "default" }: SceneImmersiveProps) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const loadUserStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) loadStats(user.id);
  }, [loadStats]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'scene_immersive', action: 'view', itemCode }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, 'itemReviewed');
        }
      }
    };
    trackView();
  }, [itemCode, logActivity, addPoints]);

  // Contenu personnalisé basé sur les vraies données de l'item (format DB)
  // Structure DB: { theme, context, setting: {location, atmosphere, characters}, interactions, case_presentation, learning_outcomes }
  const dbData = data as any;
  
  const getMotsCles = (): string[] => {
    // Priorité: keywords explicites > personnages de setting > characters > fallback
    if (data.mots_cles && data.mots_cles.length > 0) return data.mots_cles;
    if (data.keywords && data.keywords.length > 0) return data.keywords;
    if (dbData.setting?.characters && Array.isArray(dbData.setting.characters)) {
      return dbData.setting.characters;
    }
    if (dbData.learning_outcomes && Array.isArray(dbData.learning_outcomes)) {
      return dbData.learning_outcomes.slice(0, 4);
    }
    if (data.characters) return data.characters.map((c: SceneCharacter) => c.role);
    return ["Diagnostic", "Traitement", "Patient", "Expertise"];
  };

  // Extraire la description depuis plusieurs sources possibles
  const getDescription = (): string => {
    if (data.description) return data.description;
    if (data.scenario) return data.scenario;
    if (dbData.context) return dbData.context;
    if (dbData.case_presentation?.clinical_challenge) return dbData.case_presentation.clinical_challenge;
    return `Explorez ${itemCode} à travers cette scène médicale immersive.`;
  };

  // Extraire le setting depuis la structure imbriquée
  const getSetting = (): string => {
    if (typeof data.setting === 'string') return data.setting;
    if (dbData.setting?.location) return dbData.setting.location;
    if (dbData.setting?.atmosphere) return dbData.setting.atmosphere;
    if (data.lieu) return data.lieu;
    return "Environnement médical";
  };

  // Extraire les personnages depuis plusieurs formats
  const getCharacters = (): SceneCharacter[] | undefined => {
    if (data.characters) return data.characters;
    if (data.personnages) return data.personnages;
    if (dbData.setting?.characters && Array.isArray(dbData.setting.characters)) {
      return dbData.setting.characters.map((name: string) => ({
        name,
        role: name,
        description: `Participant dans le cas clinique ${itemCode}`
      }));
    }
    return undefined;
  };

  // Extraire l'objectif depuis interactions ou learning_objectives
  const getObjective = (): string | undefined => {
    if (data.objective) return data.objective;
    if (data.objectif) return data.objectif;
    if (dbData.interactions?.[0]?.learning_objectives?.rang_a) {
      return dbData.interactions[0].learning_objectives.rang_a;
    }
    return undefined;
  };

  // Extraire la conclusion depuis learning_outcomes
  const getConclusion = (): string | undefined => {
    if (data.conclusion) return data.conclusion;
    if (data.resolution) return data.resolution;
    if (dbData.learning_outcomes && Array.isArray(dbData.learning_outcomes)) {
      return dbData.learning_outcomes.join(' • ');
    }
    return undefined;
  };

  const sceneData = {
    description: getDescription(),
    mots_cles: getMotsCles(),
    effet: data.effet || data.effect || 
      (dbData.setting?.atmosphere ? `Atmosphère: ${dbData.setting.atmosphere}` : 
      `Maîtrisez les compétences essentielles de ${itemCode}`),
    setting: getSetting(),
    characters: getCharacters(),
    objective: getObjective(),
    context: dbData.context || data.context || data.contexte || getDescription(),
    conclusion: getConclusion()
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % sceneData.mots_cles.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [sceneData.mots_cles.length, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const sectionInterval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3);
    }, 6000);

    return () => clearInterval(sectionInterval);
  }, [isPaused]);

  const theme = getUniqueSpectacularTheme(itemCode);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  const handleReset = () => { setZoomLevel(1); setActiveSection(0); setCurrentWordIndex(0); };

  return (
    <div className="space-y-16 min-h-screen relative overflow-auto" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
      <SceneBackground theme={theme} itemCode={itemCode} />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-background/80 backdrop-blur-sm"
          disabled={zoomLevel <= 0.6}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-background/80 backdrop-blur-sm"
          disabled={zoomLevel >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-background/80 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Gamification Stats Banner */}
      {stats && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border/50">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-bold text-warning">{stats.currentStreak ?? 0}j</span>
          <Star className="h-4 w-4 text-primary ml-1" />
          <span className="text-sm font-bold text-primary">Nv.{stats.level ?? 1}</span>
        </div>
      )}
      
      <SceneHeader 
        theme={theme} 
        description={sceneData.description} 
        setting={sceneData.setting}
      />

      <SceneCentralArea
        theme={theme}
        activeSection={activeSection}
        characters={sceneData.characters}
        motsCles={sceneData.mots_cles}
        currentWordIndex={currentWordIndex}
        isAnimating={isAnimating}
        effet={sceneData.effet}
        context={sceneData.context || sceneData.description}
      />

      <SceneConclusion 
        theme={theme} 
        conclusion={sceneData.conclusion}
        objective={sceneData.objective}
      />
    </div>
  );
};
