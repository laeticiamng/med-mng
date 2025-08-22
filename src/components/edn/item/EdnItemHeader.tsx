
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface EdnItemHeaderProps {
  item: {
    item_code: string;
    title: string;
    subtitle?: string;
    slug: string;
  };
}

export const EdnItemHeader = ({ item }: EdnItemHeaderProps) => {
  return (
    <div className="mb-8 relative">
      {/* Background avec effets Suno */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 rounded-3xl"></div>
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        <Link 
          to="/edn" 
          className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <TranslatedText text="Retour aux items EDN" />
        </Link>
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <Badge 
              variant="outline" 
              className="mb-3 text-purple-300 border-purple-400/50 bg-purple-500/20 backdrop-blur-sm px-3 py-1"
            >
              {item.item_code}
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
              <TranslatedText text={item.title} />
            </h1>
            {item.subtitle && (
              <p className="text-xl text-gray-300 leading-relaxed">
                <TranslatedText text={item.subtitle} />
              </p>
            )}
          </div>
          
          <Link
            to={`/edn/${item.slug}/immersive`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/30 backdrop-blur-sm border border-white/20"
          >
            <Play className="h-5 w-5" />
            <TranslatedText text="Mode Immersif" />
          </Link>
        </div>
        
        <div className="mt-6">
          <Link to="/library">
            <Button 
              variant="outline" 
              className="flex items-center gap-3 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl"
            >
              <Music className="h-5 w-5" />
              <TranslatedText text="Ma Bibliothèque Musicale" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
