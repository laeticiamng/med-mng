
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComicPanelProps {
  panel: {
    id: number;
    title: string;
    text: string;
    imageUrl: string;
  };
}

export const ComicPanel = ({ panel }: ComicPanelProps) => {
  return (
    <Card className="relative overflow-hidden bg-white border-4 border-amber-400 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl group">
      {/* Effet de bande dessinée avec bordure stylée */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-white to-orange-100 opacity-20"></div>
      
      <div className="relative p-6 space-y-4">
        {/* En-tête de la vignette */}
        <div className="flex items-center justify-between mb-4">
          <Badge 
            variant="outline" 
            className="text-amber-800 border-amber-500 bg-amber-100 font-bold text-sm px-3 py-1 shadow-sm"
          >
            Vignette {panel.id}
          </Badge>
          <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {panel.title}
          </div>
        </div>
        
        {/* Image principale avec effet bande dessinée */}
        <div className="relative overflow-hidden rounded-xl border-3 border-amber-300 shadow-xl">
          <img 
            src={panel.imageUrl} 
            alt={panel.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="300" fill="#FEF3C7"/>
                  <rect x="50" y="50" width="300" height="200" fill="#FFF" stroke="#D97706" stroke-width="3"/>
                  <circle cx="150" cy="120" r="30" fill="#F59E0B"/>
                  <circle cx="250" cy="120" r="30" fill="#F59E0B"/>
                  <rect x="120" y="150" width="160" height="80" fill="#FFFBEB" stroke="#D97706" stroke-width="2"/>
                  <text x="200" y="190" font-family="Arial, sans-serif" font-size="16" fill="#92400E" text-anchor="middle" font-weight="bold">${panel.title}</text>
                  <text x="200" y="270" font-family="Arial, sans-serif" font-size="14" fill="#78350F" text-anchor="middle">Vignette ${panel.id}</text>
                </svg>
              `)}`
            }}
          />
          
          {/* Effet de dégradé pour donner un aspect comic */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Bulle de dialogue stylée */}
          <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg border-2 border-amber-400">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Texte narratif avec style bande dessinée */}
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200 shadow-inner">
          {/* Petite décoration en coin */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-400 rotate-45 border border-amber-500"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rotate-45 border border-amber-500"></div>
          
          <p className="text-amber-900 font-medium italic leading-relaxed text-sm">
            {panel.text}
          </p>
          
          {/* Signature artistique */}
          <div className="flex justify-end mt-2">
            <div className="text-xs text-amber-600 font-bold opacity-70">
              #{panel.id}
            </div>
          </div>
        </div>
      </div>
      
      {/* Effet d'ombre portée pour donner de la profondeur */}
      <div className="absolute -bottom-2 -right-2 w-full h-full bg-amber-200 rounded-lg -z-10 opacity-30"></div>
    </Card>
  );
};
