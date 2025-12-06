
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface MusicLibraryEmptyProps {
  searchTerm: string;
}

export const MusicLibraryEmpty = ({ searchTerm }: MusicLibraryEmptyProps) => {
  return (
    <div className="text-center py-16">
      <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">
        <TranslatedText text={searchTerm ? 'Aucun résultat' : 'Bibliothèque vide'} />
      </h3>
      <p className="text-muted-foreground mb-6">
        <TranslatedText text={searchTerm 
          ? 'Aucune musique ne correspond à votre recherche' 
          : 'Générez vos premières musiques depuis les items EDN pour les voir apparaître ici'} />
      </p>
      {!searchTerm && (
        <Link to="/edn">
          <Button className="bg-warning hover:bg-warning/90 text-warning-foreground">
            <TranslatedText text="Explorer les items EDN" />
          </Button>
        </Link>
      )}
    </div>
  );
};
