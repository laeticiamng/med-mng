
import { useEffect, useState, useRef } from 'react';
import { SceneImmersiveProps } from './scene/sceneTypes';
import { getUniqueSpectacularTheme } from './scene/sceneThemes';
import { SceneBackground } from './scene/SceneBackground';
import { SceneHeader } from './scene/SceneHeader';
import { SceneCentralArea } from './scene/SceneCentralArea';
import { SceneConclusion } from './scene/SceneConclusion';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Star } from 'lucide-react';

export const SceneImmersive = ({ data, itemCode = "default" }: SceneImmersiveProps) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

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
  }, [itemCode]);

  const sceneData = {
    description: data.description || data.scenario || "Plongez dans cette scène médicale immersive...",
    mots_cles: data.mots_cles || (data.characters ? data.characters.map(c => c.role) : ["Diagnostic", "Traitement", "Patient", "Expertise"]),
    effet: data.effet || (data.setting ? `Environnement: ${data.setting}` : "Une expérience immersive unique"),
    setting: data.setting,
    characters: data.characters
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % sceneData.mots_cles.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [sceneData.mots_cles.length]);

  useEffect(() => {
    const sectionInterval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3);
    }, 6000);

    return () => clearInterval(sectionInterval);
  }, []);

  const theme = getUniqueSpectacularTheme(itemCode);

  return (
    <div className="space-y-16 min-h-screen relative overflow-auto">
      <SceneBackground theme={theme} itemCode={itemCode} />
      
      {/* Gamification Stats Banner */}
      {stats && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border/50">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-bold text-warning">{stats.currentStreak}j</span>
          <Star className="h-4 w-4 text-primary ml-1" />
          <span className="text-sm font-bold text-primary">Nv.{stats.level}</span>
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
      />

      <SceneConclusion theme={theme} />
    </div>
  );
};
