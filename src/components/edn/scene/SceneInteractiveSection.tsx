
import { SceneTheme } from './sceneTypes';

interface Character {
  name: string;
  role: string;
  description: string;
}

interface SceneInteractiveSectionProps {
  activeSection: number;
  theme: SceneTheme;
  characters?: Character[];
  motsCles: string[];
  currentWordIndex: number;
  isAnimating: boolean;
  effet: string;
}

export const SceneInteractiveSection = ({ 
  activeSection, 
  theme, 
  characters, 
  motsCles, 
  currentWordIndex, 
  isAnimating, 
  effet 
}: SceneInteractiveSectionProps) => {
  const renderCharactersSection = () => (
    <div className="flex items-center justify-center space-x-32 animate-fade-in">
      {characters ? (
        characters.slice(0, 3).map((character, index) => (
          <div key={index} className="relative text-center group">
            <div className="relative transform group-hover:scale-110 transition-all duration-500">
              {/* Avatar holographique */}
              <div className={`w-48 h-60 bg-gradient-to-b ${theme.primary} rounded-t-full opacity-90 ${theme.glowColor} shadow-2xl`} />
              <div className={`w-56 h-32 bg-gradient-to-b ${theme.primary} rounded-b-3xl opacity-80 -mt-4 ${theme.glowColor} shadow-xl`} />
              
              {/* Halo énergétique */}
              <div className={`absolute -inset-8 bg-gradient-to-r ${theme.primary} rounded-full opacity-30 blur-2xl animate-pulse`} />
            </div>
            
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center">
              <div className={`bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full ${theme.glowColor} shadow-lg border-3 border-white/50 ${theme.accent} font-bold text-2xl`}>
                {character.name}
              </div>
              <div className={`mt-2 text-lg ${theme.accent} opacity-80 font-semibold`}>
                {character.role}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center space-x-24">
          <div className="relative transform hover:scale-110 transition-all duration-500">
            <div className={`w-56 h-64 bg-gradient-to-b ${theme.primary} rounded-t-full opacity-80 ${theme.glowColor} shadow-2xl`} />
            <div className={`w-64 h-36 bg-gradient-to-b ${theme.primary} rounded-b-3xl opacity-70 -mt-6 ${theme.glowColor} shadow-xl`} />
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold">
              MÉDECIN
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-8">
            <div className="text-8xl animate-bounce">
              {theme.particle}
            </div>
            <div className={`bg-white/95 backdrop-blur-sm px-12 py-6 rounded-full ${theme.glowColor} shadow-lg border-3 border-white/50 ${isAnimating ? 'scale-125' : 'scale-100'} transition-all duration-500`}>
              <span className={`${theme.accent} font-bold text-3xl`}>
                {motsCles[currentWordIndex]}
              </span>
            </div>
          </div>
          
          <div className="relative transform hover:scale-110 transition-all duration-500">
            <div className={`w-56 h-64 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-full opacity-80 shadow-2xl`} />
            <div className={`w-64 h-36 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-3xl opacity-70 -mt-6 shadow-xl`} />
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold">
              PATIENT
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompetencesSection = () => (
    <div className="text-center animate-fade-in">
      <div className={`text-6xl mb-8 ${theme.accent}`}>
        {theme.uniqueElement}
      </div>
      <h3 className={`text-4xl font-bold ${theme.accent} mb-6`}>
        Compétences Intégrées
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {motsCles.map((mot, index) => (
          <div
            key={index}
            className={`p-6 bg-white/90 backdrop-blur-sm rounded-xl ${theme.glowColor} shadow-lg border-2 border-white/50 transform hover:scale-105 transition-all duration-300`}
          >
            <span className={`${theme.accent} font-bold text-lg`}>
              {mot}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExcellenceSection = () => (
    <div className="text-center animate-fade-in">
      <div className="text-8xl mb-8">🎯</div>
      <h3 className={`text-5xl font-bold ${theme.accent} mb-8`}>
        Excellence Garantie
      </h3>
      <div className={`text-2xl ${theme.accent} leading-relaxed max-w-4xl mx-auto`}>
        {effet}
      </div>
      <div className="mt-8 flex justify-center space-x-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="text-5xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
            ⭐
          </span>
        ))}
      </div>
    </div>
  );

  switch (activeSection) {
    case 0:
      return renderCharactersSection();
    case 1:
      return renderCompetencesSection();
    case 2:
      return renderExcellenceSection();
    default:
      return renderCharactersSection();
  }
};
