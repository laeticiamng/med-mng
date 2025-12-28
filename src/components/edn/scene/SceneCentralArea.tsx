
import { SceneTheme } from './sceneTypes';
import { SceneInteractiveSection } from './SceneInteractiveSection';

interface Character {
  name: string;
  role: string;
  description: string;
}

interface SceneCentralAreaProps {
  theme: SceneTheme;
  activeSection: number;
  characters?: Character[];
  motsCles: string[];
  currentWordIndex: number;
  isAnimating: boolean;
  effet: string;
  context?: string;
}

export const SceneCentralArea = ({ 
  theme, 
  activeSection, 
  characters, 
  motsCles, 
  currentWordIndex, 
  isAnimating, 
  effet,
  context
}: SceneCentralAreaProps) => {
  return (
    <div className={`relative bg-gradient-to-br ${theme.secondary} rounded-3xl mx-8 p-20 min-h-[700px] flex flex-col items-center justify-center ${theme.glowColor} shadow-2xl border-4 border-white/40`}>
      
      {/* Contexte en haut si disponible */}
      {context && (
        <div className="absolute top-6 left-6 right-6 z-20">
          <div className="bg-card/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-border/50 shadow-lg">
            <h4 className={`text-sm font-semibold ${theme.accent} mb-1`}>📌 Contexte clinique</h4>
            <p className="text-sm text-muted-foreground">{context}</p>
          </div>
        </div>
      )}
      
      {/* Effet de profondeur avec anneaux concentriques animés */}
      <div className="absolute inset-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full border-2 border-primary/20 animate-pulse`}
            style={{
              width: `${150 + (i * 80)}px`,
              height: `${150 + (i * 80)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + i}s`
            }}
          />
        ))}
      </div>

      {/* Sections interactives multiples */}
      <div className="relative z-10 w-full max-w-6xl">
        <SceneInteractiveSection
          activeSection={activeSection}
          theme={theme}
          characters={characters}
          motsCles={motsCles}
          currentWordIndex={currentWordIndex}
          isAnimating={isAnimating}
          effet={effet}
        />
      </div>

      {/* Effet de vagues énergétiques */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 200" className="w-full h-32 opacity-30">
          <path d="M0,100 C300,150 500,50 800,100 C1000,150 1200,80 1200,100 L1200,200 L0,200 Z" fill="currentColor" className={theme.accent} />
          <path d="M0,120 C400,170 600,70 1000,120 C1100,140 1200,100 1200,120 L1200,200 L0,200 Z" fill="currentColor" className={theme.accent} opacity={0.6} />
        </svg>
      </div>
    </div>
  );
};
