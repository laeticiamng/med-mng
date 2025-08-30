import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music, Mic } from 'lucide-react';

interface ParolesMusicalesProps {
  paroles: string[];
  itemCode?: string;
  title?: string;
}

export const ParolesMusicales = ({ paroles, itemCode = "IC-1", title = "Paroles Musicales" }: ParolesMusicalesProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isKaraokeMode, setIsKaraokeMode] = useState(false);

  // Auto-avancement des paroles pendant la lecture
  useEffect(() => {
    if (isPlaying && paroles.length > 0) {
      const interval = setInterval(() => {
        setCurrentVerseIndex((prev) => (prev + 1) % paroles.length);
      }, 4000); // Change de couplet toutes les 4 secondes

      return () => clearInterval(interval);
    }
  }, [isPlaying, paroles.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextVerse = () => {
    setCurrentVerseIndex((prev) => (prev + 1) % paroles.length);
  };

  const prevVerse = () => {
    setCurrentVerseIndex((prev) => (prev - 1 + paroles.length) % paroles.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!paroles || paroles.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 p-8 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-2xl font-bold text-purple-800 mb-4">Paroles Musicales</h3>
          <p className="text-purple-600 mb-6">
            Les paroles musicales pour cet item sont en cours de génération...
          </p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-300">
            <p className="text-purple-700 font-medium">
              🎶 Bientôt disponible : une mélodie unique pour retenir les concepts essentiels de l'item {itemCode} !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
      
      {/* Effets visuels de fond */}
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-pulse"
            style={{
              left: `${Math.min(Math.max(Math.random() * 90, 5), 85)}%`,
              top: `${Math.min(Math.max(Math.random() * 90, 5), 85)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {['🎵', '🎶', '♪', '♫'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* En-tête */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Music className="h-8 w-8" />
          <h2 className="text-3xl font-black uppercase tracking-wide">
            🎵 {title} 🎵
          </h2>
          <Music className="h-8 w-8" />
        </div>
        <p className="text-white/90 text-lg font-medium">
          Item {itemCode} • Apprentissage Musical Immersif
        </p>
      </div>

      {/* Zone de lecture principale */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
        
        {/* Mode karaoké toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsKaraokeMode(!isKaraokeMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isKaraokeMode 
                ? 'bg-white text-purple-600 shadow-lg' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Mic className="h-5 w-5" />
            <span className="font-semibold">Mode Karaoké</span>
          </button>
        </div>

        {/* Affichage des paroles */}
        <div className={`text-center transition-all duration-500 ${isKaraokeMode ? 'transform scale-110' : ''}`}>
          <div className="mb-4">
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Couplet {currentVerseIndex + 1} / {paroles.length}
            </span>
          </div>
          
          <div className={`text-2xl font-bold leading-relaxed transition-all duration-700 ${
            isPlaying ? 'animate-pulse' : ''
          }`}>
            {paroles[currentVerseIndex] || "En attente des paroles..."}
          </div>

          {/* Indicateur de progression */}
          {isPlaying && (
            <div className="mt-6 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-4000 animate-pulse"
                style={{ width: `${((currentVerseIndex + 1) / paroles.length) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Contrôles de lecture */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center space-x-6">
          
          {/* Bouton précédent */}
          <button
            onClick={prevVerse}
            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 hover:scale-110"
            disabled={paroles.length <= 1}
          >
            <SkipBack className="h-6 w-6" />
          </button>

          {/* Bouton play/pause principal */}
          <button
            onClick={togglePlay}
            className={`bg-white text-purple-600 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </button>

          {/* Bouton suivant */}
          <button
            onClick={nextVerse}
            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 hover:scale-110"
            disabled={paroles.length <= 1}
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>

        {/* Contrôles de volume */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          <div className="flex-1 max-w-32">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <span className="text-sm font-medium w-12 text-center">
            {isMuted ? '0%' : Math.round(volume * 100) + '%'}
          </span>
        </div>
      </div>

      {/* Liste des couplets */}
      <div className="relative z-10 mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
        <h4 className="text-center font-bold mb-4">📜 Tous les couplets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {paroles.map((parole, index) => (
            <button
              key={index}
              onClick={() => setCurrentVerseIndex(index)}
              className={`text-left p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                index === currentVerseIndex
                  ? 'bg-white text-purple-600 border-white shadow-lg font-bold'
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <div className="text-sm font-semibold mb-1">Couplet {index + 1}</div>
              <div className="text-xs opacity-80 line-clamp-2">
                {parole.length > 50 ? parole.substring(0, 50) + '...' : parole}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer motivant */}
      <div className="relative z-10 text-center mt-6">
        <p className="text-white/80 text-sm font-medium">
          🎯 Mémorisez en musique • Apprenez en rythme • Maîtrisez avec plaisir
        </p>
      </div>
    </div>
  );
};