
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
    <div className="mb-8">
      <Link 
        to="/edn" 
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <TranslatedText text="Retour aux items EDN" />
      </Link>
      
      <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="outline" className="mb-2 text-accent-foreground border-accent">
              {item.item_code}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <TranslatedText text={item.title} />
            </h1>
            {item.subtitle && (
              <p className="text-lg text-muted-foreground">
                <TranslatedText text={item.subtitle} />
              </p>
            )}
          </div>
          <Link
            to={`/edn/${item.slug}/immersive`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            <Play className="h-4 w-4" />
            <TranslatedText text="Mode Immersif" />
          </Link>
        </div>
        
        <div className="mt-4">
          <Link to="/edn/music-library">
            <Button variant="outline" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <TranslatedText text="Ma Bibliothèque Musicale" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
