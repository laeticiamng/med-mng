
import { useEffect, useState } from 'react';

interface SceneImmersiveProps {
  data: {
    description: string;
    mots_cles: string[];
    effet: string;
  };
}

export const SceneImmersive = ({ data }: SceneImmersiveProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % data.mots_cles.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [data.mots_cles.length]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-amber-900 mb-4">Scène Immersive</h2>
        <p className="text-amber-700 max-w-2xl mx-auto">
          {data.description}
        </p>
      </div>

      {/* Scène visuelle */}
      <div className="relative bg-gradient-to-br from-amber-100 to-blue-100 rounded-2xl p-12 min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Halo pulsant */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-blue-200/30 rounded-2xl animate-pulse" />
        
        {/* Silhouettes */}
        <div className="relative z-10 flex items-center justify-center space-x-16">
          {/* Médecin */}
          <div className="relative">
            <div className="w-24 h-32 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full opacity-70" />
            <div className="w-32 h-20 bg-gradient-to-b from-amber-700 to-amber-800 rounded-b-2xl opacity-70 -mt-2" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-amber-900 font-semibold -mt-8">
              Médecin
            </div>
          </div>
          
          {/* Espace de dialogue */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-serif text-amber-900 animate-pulse">
              ↔
            </div>
            <div className="bg-white/80 px-6 py-3 rounded-full shadow-lg">
              <span className="text-amber-800 font-medium text-lg">
                {data.mots_cles[currentWordIndex]}
              </span>
            </div>
          </div>
          
          {/* Patient */}
          <div className="relative">
            <div className="w-24 h-32 bg-gradient-to-b from-blue-800 to-blue-900 rounded-t-full opacity-70" />
            <div className="w-32 h-20 bg-gradient-to-b from-blue-700 to-blue-800 rounded-b-2xl opacity-70 -mt-2" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-blue-900 font-semibold -mt-8">
              Patient
            </div>
          </div>
        </div>

        {/* Mots-clés flottants */}
        <div className="absolute inset-0 pointer-events-none">
          {data.mots_cles.map((mot, index) => (
            <div
              key={index}
              className={`absolute text-sm font-medium transition-all duration-1000 ${
                index === currentWordIndex
                  ? 'text-amber-800 opacity-100 scale-110'
                  : 'text-amber-600 opacity-40 scale-100'
              }`}
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${10 + (index * 10)}%`,
                transform: `rotate(${(index - 2) * 10}deg)`,
              }}
            >
              {mot}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-amber-600 italic">
          {data.effet}
        </p>
      </div>
    </div>
  );
};
