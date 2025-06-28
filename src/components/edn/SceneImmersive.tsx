
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
    }, 3000);

    return () => clearInterval(interval);
  }, [sceneData.mots_cles.length]);

  // Styles uniques basés sur l'item code pour créer une identité visuelle distincte
  const getUniqueTheme = (code: string) => {
    const themes = {
      'IC1': {
        primary: 'from-blue-600 to-cyan-500',
        secondary: 'from-blue-100 via-cyan-50 to-blue-100',
        accent: 'text-blue-800',
        particle: '💊',
        bgPattern: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
      },
      'IC2': {
        primary: 'from-emerald-600 to-teal-500',
        secondary: 'from-emerald-100 via-teal-50 to-emerald-100',
        accent: 'text-emerald-800',
        particle: '⚕️',
        bgPattern: 'radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)'
      },
      'IC3': {
        primary: 'from-purple-600 to-indigo-500',
        secondary: 'from-purple-100 via-indigo-50 to-purple-100',
        accent: 'text-purple-800',
        particle: '🧬',
        bgPattern: 'radial-gradient(circle at 40% 60%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
      },
      'IC4': {
        primary: 'from-rose-600 to-pink-500',
        secondary: 'from-rose-100 via-pink-50 to-rose-100',
        accent: 'text-rose-800',
        particle: '❤️',
        bgPattern: 'radial-gradient(circle at 25% 75%, rgba(244, 63, 94, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
      },
      'default': {
        primary: 'from-amber-600 to-orange-500',
        secondary: 'from-amber-100 via-orange-50 to-amber-100',
        accent: 'text-amber-800',
        particle: '🔬',
        bgPattern: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
      }
    };
    
    return themes[code as keyof typeof themes] || themes.default;
  };

  const theme = getUniqueTheme(itemCode);

  return (
    <div className="space-y-12 min-h-screen relative overflow-hidden">
      {/* Background unique avec motifs */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: theme.bgPattern }}
      />
      
      {/* Particules flottantes animées */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-pulse"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${15 + (i * 6)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          >
            {theme.particle}
          </div>
        ))}
      </div>

      {/* En-tête immersif */}
      <div className="text-center relative z-10 pt-16">
        <div className={`inline-block bg-gradient-to-r ${theme.primary} text-white px-8 py-4 rounded-full shadow-2xl mb-8`}>
          <h2 className="text-4xl font-bold">🌟 Scène Immersive 🌟</h2>
        </div>
        <div className={`max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-white/50`}>
          <p className={`text-xl leading-relaxed ${theme.accent}`}>
            {sceneData.description}
          </p>
          {sceneData.setting && (
            <div className={`mt-4 text-base ${theme.accent} opacity-80 italic`}>
              📍 {sceneData.setting}
            </div>
          )}
        </div>
      </div>

      {/* Scène centrale ultra-immersive */}
      <div className={`relative bg-gradient-to-br ${theme.secondary} rounded-3xl mx-8 p-16 min-h-[600px] flex items-center justify-center overflow-hidden shadow-2xl border-4 border-white/30`}>
        
        {/* Effet de profondeur avec cercles concentriques */}
        <div className="absolute inset-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/20 animate-pulse`}
              style={{
                width: `${200 + (i * 100)}px`,
                height: `${200 + (i * 100)}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>

        {/* Représentation des personnages ou éléments médicaux */}
        <div className="relative z-10 flex items-center justify-center space-x-20">
          {sceneData.characters ? (
            // Scène avec personnages
            sceneData.characters.slice(0, 3).map((character, index) => (
              <div key={index} className="relative text-center group">
                <div className="relative">
                  {/* Avatar stylisé avec effet 3D */}
                  <div className={`w-32 h-40 bg-gradient-to-b ${theme.primary} rounded-t-full opacity-80 shadow-2xl transform group-hover:scale-110 transition-all duration-500`} />
                  <div className={`w-40 h-24 bg-gradient-to-b ${theme.primary} rounded-b-3xl opacity-70 -mt-3 shadow-xl transform group-hover:scale-105 transition-all duration-500`} />
                  
                  {/* Halo lumineux */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${theme.primary} rounded-full opacity-20 blur-xl animate-pulse`} />
                </div>
                
                {/* Informations personnage avec animation */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
                  <div className={`bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border-2 border-white/50 ${theme.accent} font-bold text-lg`}>
                    {character.name}
                  </div>
                  <div className={`mt-1 text-sm ${theme.accent} opacity-70 font-medium`}>
                    {character.role}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Scène médicale abstraite
            <div className="flex items-center space-x-16">
              <div className="relative">
                <div className={`w-40 h-48 bg-gradient-to-b ${theme.primary} rounded-t-full opacity-70 shadow-2xl`} />
                <div className={`w-48 h-28 bg-gradient-to-b ${theme.primary} rounded-b-3xl opacity-60 -mt-4 shadow-xl`} />
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold">
                  MÉDECIN
                </div>
              </div>
              
              {/* Zone d'interaction centrale */}
              <div className="flex flex-col items-center space-y-6">
                <div className="text-6xl animate-bounce">
                  {theme.particle}
                </div>
                <div className={`bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border-2 border-white/50 ${isAnimating ? 'scale-110' : 'scale-100'} transition-all duration-300`}>
                  <span className={`${theme.accent} font-bold text-2xl`}>
                    {sceneData.mots_cles[currentWordIndex]}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className={`w-40 h-48 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-full opacity-70 shadow-2xl`} />
                <div className={`w-48 h-28 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-3xl opacity-60 -mt-4 shadow-xl`} />
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold">
                  PATIENT
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mots-clés flottants avec animations avancées */}
        <div className="absolute inset-0 pointer-events-none">
          {sceneData.mots_cles.map((mot, index) => (
            <div
              key={index}
              className={`absolute font-bold transition-all duration-1000 ${
                index === currentWordIndex
                  ? `${theme.accent} opacity-100 scale-125 shadow-lg`
                  : `${theme.accent} opacity-30 scale-90`
              }`}
              style={{
                left: `${15 + (index * 12)}%`,
                top: `${20 + (index * 8)}%`,
                transform: `rotate(${(index - 2) * 8}deg)`,
                fontSize: index === currentWordIndex ? '1.25rem' : '1rem',
                textShadow: index === currentWordIndex ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {mot}
            </div>
          ))}
        </div>

        {/* Effet de vagues en arrière-plan */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-24 opacity-20">
            <path d="M0,60 C300,100 500,20 800,60 C1000,100 1200,40 1200,60 L1200,120 L0,120 Z" fill="currentColor" className={theme.accent} />
          </svg>
        </div>
      </div>

      {/* Conclusion immersive */}
      <div className="text-center relative z-10 pb-16">
        <div className={`max-w-2xl mx-auto bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-white/50`}>
          <p className={`text-lg ${theme.accent} italic leading-relaxed`}>
            {sceneData.effet}
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
