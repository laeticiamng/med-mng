
import { SceneTheme } from './sceneTypes';

interface SceneConclusionProps {
  theme: SceneTheme;
}

export const SceneConclusion = ({ theme }: SceneConclusionProps) => {
  return (
    <div className="text-center relative z-10 pb-20">
      <div className={`max-w-4xl mx-auto bg-card/95 backdrop-blur-lg p-8 rounded-3xl ${theme.glowColor} shadow-2xl border-4 border-border/50`}>
        <div className="text-6xl mb-6">🚀</div>
        <p className={`text-2xl ${theme.accent} italic leading-relaxed font-medium`}>
          Voyage Immersif Terminé - Compétences Maîtrisées !
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.primary} animate-pulse`}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
