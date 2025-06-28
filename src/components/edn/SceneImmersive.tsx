import { useEffect, useState } from 'react';

interface SceneImmersiveProps {
  data: {
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
  itemCode?: string;
}

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

  // Styles uniques et spectaculaires basés sur l'item code
  const getUniqueSpectacularTheme = (code: string) => {
    const themes = {
      'IC1': {
        primary: 'from-blue-600 via-cyan-500 to-teal-400',
        secondary: 'from-blue-100 via-cyan-50 to-teal-50',
        accent: 'text-blue-800',
        particle: '💊',
        gradientOverlay: 'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 70%), radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
        glowColor: 'shadow-blue-500/50',
        uniqueElement: '🔬',
        name: 'Laboratoire Quantique'
      },
      'IC2': {
        primary: 'from-emerald-600 via-teal-500 to-green-400',
        secondary: 'from-emerald-100 via-teal-50 to-green-50',
        accent: 'text-emerald-800',
        particle: '⚕️',
        gradientOverlay: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 70%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
        glowColor: 'shadow-emerald-500/50',
        uniqueElement: '🏥',
        name: 'Centre Médical Futuriste'
      },
      'IC3': {
        primary: 'from-purple-600 via-indigo-500 to-violet-400',
        secondary: 'from-purple-100 via-indigo-50 to-violet-50',
        accent: 'text-purple-800',
        particle: '🧬',
        gradientOverlay: 'radial-gradient(circle at 40% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 70%), radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
        glowColor: 'shadow-purple-500/50',
        uniqueElement: '🔬',
        name: 'Laboratoire de Génétique'
      },
      'IC4': {
        primary: 'from-rose-600 via-pink-500 to-red-400',
        secondary: 'from-rose-100 via-pink-50 to-red-50',
        accent: 'text-rose-800',
        particle: '❤️',
        gradientOverlay: 'radial-gradient(circle at 20% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 70%), radial-gradient(circle at 80% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
        glowColor: 'shadow-rose-500/50',
        uniqueElement: '🫀',
        name: 'Unité Cardiologique'
      },
      'default': {
        primary: 'from-amber-600 via-orange-500 to-yellow-400',
        secondary: 'from-amber-100 via-orange-50 to-yellow-50',
        accent: 'text-amber-800',
        particle: '🔬',
        gradientOverlay: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
        glowColor: 'shadow-amber-500/50',
        uniqueElement: '⚗️',
        name: 'Station Médicale'
      }
    };
    
    return themes[code as keyof typeof themes] || themes.default;
  };

  const theme = getUniqueSpectacularTheme(itemCode);

  return (
    <div className="space-y-16 min-h-screen relative overflow-hidden">
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

      {/* En-tête spectaculaire et unique */}
      <div className="text-center relative z-10 pt-20">
        <div className={`inline-block bg-gradient-to-r ${theme.primary} text-white px-12 py-6 rounded-full ${theme.glowColor} shadow-2xl mb-12 transform hover:scale-105 transition-all duration-500`}>
          <h2 className="text-5xl font-bold flex items-center gap-4">
            <span className="text-6xl">{theme.uniqueElement}</span>
            {theme.name}
            <span className="text-6xl">{theme.uniqueElement}</span>
          </h2>
        </div>
        <div className={`max-w-5xl mx-auto bg-white/95 backdrop-blur-lg p-10 rounded-3xl ${theme.glowColor} shadow-2xl border-4 border-white/30`}>
          <p className={`text-2xl leading-relaxed ${theme.accent} font-medium`}>
            {sceneData.description}
          </p>
          {sceneData.setting && (
            <div className={`mt-6 text-lg ${theme.accent} opacity-90 italic flex items-center justify-center gap-3`}>
              <span className="text-2xl">📍</span>
              <span>{sceneData.setting}</span>
              <span className="text-2xl">📍</span>
            </div>
          )}
        </div>
      </div>

      {/* Scène centrale ultra-spectaculaire */}
      <div className={`relative bg-gradient-to-br ${theme.secondary} rounded-3xl mx-8 p-20 min-h-[700px] flex items-center justify-center overflow-hidden ${theme.glowColor} shadow-2xl border-4 border-white/40`}>
        
        {/* Effet de profondeur avec anneaux concentriques animés */}
        <div className="absolute inset-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full border-3 ${theme.accent.replace('text-', 'border-')}/20 animate-pulse`}
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
          {activeSection === 0 && (
            <div className="flex items-center justify-center space-x-32 animate-fade-in">
              {sceneData.characters ? (
                sceneData.characters.slice(0, 3).map((character, index) => (
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
                        {sceneData.mots_cles[currentWordIndex]}
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
          )}

          {activeSection === 1 && (
            <div className="text-center animate-fade-in">
              <div className={`text-6xl mb-8 ${theme.accent}`}>
                {theme.uniqueElement}
              </div>
              <h3 className={`text-4xl font-bold ${theme.accent} mb-6`}>
                Compétences Intégrées
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {sceneData.mots_cles.map((mot, index) => (
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
          )}

          {activeSection === 2 && (
            <div className="text-center animate-fade-in">
              <div className="text-8xl mb-8">🎯</div>
              <h3 className={`text-5xl font-bold ${theme.accent} mb-8`}>
                Excellence Garantie
              </h3>
              <div className={`text-2xl ${theme.accent} leading-relaxed max-w-4xl mx-auto`}>
                {sceneData.effet}
              </div>
              <div className="mt-8 flex justify-center space-x-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="text-5xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Effet de vagues énergétiques */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 200" className="w-full h-32 opacity-30">
            <path d="M0,100 C300,150 500,50 800,100 C1000,150 1200,80 1200,100 L1200,200 L0,200 Z" fill="currentColor" className={theme.accent} />
            <path d="M0,120 C400,170 600,70 1000,120 C1100,140 1200,100 1200,120 L1200,200 L0,200 Z" fill="currentColor" className={theme.accent} opacity={0.6} />
          </svg>
        </div>
      </div>

      {/* Conclusion spectaculaire */}
      <div className="text-center relative z-10 pb-20">
        <div className={`max-w-4xl mx-auto bg-white/95 backdrop-blur-lg p-8 rounded-3xl ${theme.glowColor} shadow-2xl border-4 border-white/50`}>
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
    </div>
  );
};
