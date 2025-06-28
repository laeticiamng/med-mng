
import { SceneTheme } from './sceneTypes';

interface SceneBackgroundProps {
  theme: SceneTheme;
  itemCode: string;
}

export const SceneBackground = ({ theme, itemCode }: SceneBackgroundProps) => {
  return (
    <>
      {/* Background spectaculaire unique */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ background: theme.gradientOverlay }}
      />
      
      {/* Grille holographique de fond */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id={`grid-${itemCode}`} width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke={theme.accent} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${itemCode})`} />
        </svg>
      </div>

      {/* Particules animées avancées */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-bounce opacity-70"
            style={{
              left: `${5 + (i * 5.5)}%`,
              top: `${10 + (i * 4)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 4)}s`,
              transform: `rotate(${i * 20}deg)`
            }}
          >
            {i % 3 === 0 ? theme.particle : i % 3 === 1 ? theme.uniqueElement : '✨'}
          </div>
        ))}
      </div>
    </>
  );
};
