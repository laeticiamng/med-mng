import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { ROUTE_PATHS } from '@/config/routes';

interface MusicLibraryHeaderProps {
  musicCount: number;
}

export const MusicLibraryHeader = ({ musicCount }: MusicLibraryHeaderProps) => {
  return (
    <div className="mb-8">
      <Link 
        to={ROUTE_PATHS.ednLegacy} 
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <TranslatedText text="Retour aux items EDN" />
      </Link>
      
      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-warning/20">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <TranslatedText text="Ma Bibliothèque Musicale" />
        </h1>
        <p className="text-lg text-muted-foreground">
          <TranslatedText text={`${musicCount} musique${musicCount > 1 ? 's' : ''} sauvegardée${musicCount > 1 ? 's' : ''}`} />
        </p>
      </div>
    </div>
  );
};
