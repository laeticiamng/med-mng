
import { useEffect, useState } from 'react';
import { SceneImmersiveProps } from './scene/sceneTypes';
import { getUniqueSpectacularTheme } from './scene/sceneThemes';
import { SceneBackground } from './scene/SceneBackground';
import { SceneHeader } from './scene/SceneHeader';
import { SceneCentralArea } from './scene/SceneCentralArea';
import { SceneConclusion } from './scene/SceneConclusion';

export const SceneImmersive = ({ data, itemCode = "default" }: SceneImmersiveProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

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
    <div className="space-y-16 min-h-screen relative overflow-hidden">
      <SceneBackground theme={theme} itemCode={itemCode} />
      
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
