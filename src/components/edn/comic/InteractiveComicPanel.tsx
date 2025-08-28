import { useState } from 'react';
import { Play, Pause, Volume2, Maximize2, MessageSquare, Lightbulb } from 'lucide-react';

interface InteractiveComicPanelProps {
  panel: {
    id: number;
    title: string;
    text: string;
    imageUrl: string;
    competences?: string[];
  };
}

export const InteractiveComicPanel = ({ panel }: InteractiveComicPanelProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Ici on pourrait intégrer la synthèse vocale
    if (!isPlaying) {
      // Simuler la lecture audio du texte
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-2xl border-4 border-gray-200 overflow-hidden transform transition-all duration-500 hover:scale-102 hover:shadow-3xl hover:border-blue-500">
      
      {/* Numéro stylé BD */}
      <div className="absolute top-4 left-4 z-30 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
        {panel.id}
      </div>

      {/* Zone image interactive */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <img
          src={panel.imageUrl}
          alt={panel.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bg${panel.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F0F9FF"/>
                    <stop offset="100%" stop-color="#DBEAFE"/>
                  </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#bg${panel.id})"/>
                <rect x="50" y="50" width="300" height="200" fill="#FFF" stroke="#3B82F6" stroke-width="4" rx="15"/>
                <circle cx="150" cy="130" r="30" fill="#FED8D8"/>
                <circle cx="250" cy="130" r="30" fill="#60A5FA"/>
                <text x="200" y="250" font-family="Arial" font-size="18" fill="#1E40AF" text-anchor="middle" font-weight="bold">${panel.title}</text>
                <circle cx="150" cy="130" r="10" fill="#374151"/>
                <circle cx="250" cy="130" r="10" fill="#374151"/>
                <path d="M170 150 Q200 140 230 150" stroke="#059669" stroke-width="3" fill="none"/>
              </svg>
            `)}`;
          }}
        />
        
        {/* Contrôles overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-4">
            <button
              onClick={togglePlay}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-blue-600" />
              ) : (
                <Play className="h-6 w-6 text-blue-600" />
              )}
            </button>
            
            <button
              onClick={() => setShowDialog(!showDialog)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
            >
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
            >
              <Lightbulb className="h-6 w-6 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Indicateur de lecture */}
        {isPlaying && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-blue-500 h-1 rounded-full animate-pulse">
              <div className="bg-white h-full w-1/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Bulle de dialogue animée */}
      <div className="relative -mt-8 mx-6 z-20">
        <div className="bg-white rounded-2xl border-4 border-blue-400 p-4 shadow-xl relative">
          {/* Queue de bulle */}
          <div className="absolute -top-3 left-8 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-blue-400"></div>
          <div className="absolute -top-2 left-8 w-0 h-0 border-l-3 border-r-3 border-b-5 border-transparent border-b-white"></div>
          
          <h3 className="text-xl font-black text-blue-800 mb-2 text-center">
            {panel.title}
          </h3>
          
          {showDialog && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200 animate-fade-in">
              <p className="text-sm text-blue-800 font-medium italic">
                "Cette étape est cruciale pour comprendre {panel.title.toLowerCase()}..."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 pt-2">
        <p className="text-gray-700 leading-relaxed text-sm mb-4">
          {panel.text}
        </p>

        {/* Détails expandables */}
        {showDetails && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200 animate-slide-in-down">
            <h4 className="font-bold text-orange-800 mb-2">💡 Points clés à retenir :</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Application pratique en situation clinique</li>
              <li>• Importance de la communication patient</li>
              <li>• Respect des protocoles et de l'éthique</li>
            </ul>
          </div>
        )}
      </div>

      {/* Compétences avec animations */}
      {panel.competences && panel.competences.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-green-700">Compétences développées</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {panel.competences.map((comp, idx) => (
              <span
                key={idx}
                className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full font-semibold border-2 border-green-200 hover:scale-105 transition-transform duration-200 cursor-default"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                ✨ {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bordure magique animée */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-gradient-x"></div>
    </div>
  );
};