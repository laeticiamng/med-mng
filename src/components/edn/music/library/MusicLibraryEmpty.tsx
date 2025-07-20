
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
      <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        <TranslatedText text={searchTerm ? 'Aucun résultat' : 'Bibliothèque vide'} />
      </h3>
      <p className="text-gray-600 mb-6">
        <TranslatedText text={searchTerm 
          ? 'Aucune musique ne correspond à votre recherche' 
          : 'Générez vos premières musiques depuis les items EDN pour les voir apparaître ici'} />
      </p>
      {!searchTerm && (
        <Link to="/edn">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <TranslatedText text="Explorer les items EDN" />
          </Button>
        </Link>
      )}
    </div>
  );
};
