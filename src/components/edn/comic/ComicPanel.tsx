import { useState } from 'react';
import { ZoomIn, Info } from 'lucide-react';

interface ComicPanelProps {
  panel: {
    id: number;
    title: string;
    text: string;
    imageUrl: string;
    competences?: string[];
  };
}

export const ComicPanel = ({ panel }: ComicPanelProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-xl border-4 border-gray-200 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Numéro de la vignette style BD */}
      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        {panel.id}
      </div>

      {/* Zone d'image avec overlay */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <img
          src={panel.imageUrl}
          alt={panel.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback vers une image SVG générée
            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F4F8FF"/>
                    <stop offset="100%" stop-color="#DBEAFE"/>
                  </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#bg)"/>
                <rect x="50" y="50" width="300" height="200" fill="#FFF" stroke="#3B82F6" stroke-width="3" rx="10"/>
                <circle cx="150" cy="120" r="25" fill="#FED8D8"/>
                <circle cx="250" cy="120" r="25" fill="#60A5FA"/>
                <text x="200" y="220" font-family="Arial" font-size="16" fill="#1E40AF" text-anchor="middle" font-weight="bold">${panel.title}</text>
                <circle cx="150" cy="120" r="8" fill="#374151"/>
                <circle cx="250" cy="120" r="8" fill="#374151"/>
              </svg>
            `)}`;
          }}
        />
        
        {/* Overlay avec zoom icon */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <ZoomIn className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Titre style bulle BD */}
      <div className="relative -mt-6 mx-4 z-10">
        <div className="bg-white rounded-xl border-3 border-blue-400 p-3 shadow-lg">
          <h3 className="text-lg font-black text-blue-800 text-center">
            {panel.title}
          </h3>
        </div>
      </div>

      {/* Contenu texte */}
      <div className="p-6 pt-4">
        <p className="text-gray-700 leading-relaxed text-sm">
          {panel.text}
        </p>
      </div>

      {/* Compétences associées */}
      {panel.competences && panel.competences.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Compétences :</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {panel.competences.map((comp, idx) => (
              <span
                key={idx}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium border border-green-200"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bordure décorative animée */}
      <div className={`absolute inset-0 border-4 border-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl transition-opacity duration-300 -z-10 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} style={{ padding: '2px' }}>
        <div className="w-full h-full bg-white rounded-xl"></div>
      </div>
    </div>
  );
};