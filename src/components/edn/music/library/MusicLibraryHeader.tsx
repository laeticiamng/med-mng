
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface MusicLibraryHeaderProps {
  musicCount: number;
}

export const MusicLibraryHeader = ({ musicCount }: MusicLibraryHeaderProps) => {
  return (
    <div className="mb-8">
      <Link 
        to="/edn" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <TranslatedText text="Retour aux items EDN" />
      </Link>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <TranslatedText text="Ma Bibliothèque Musicale" />
        </h1>
        <p className="text-lg text-gray-600">
          <TranslatedText text={`${musicCount} musique${musicCount > 1 ? 's' : ''} sauvegardée${musicCount > 1 ? 's' : ''}`} />
        </p>
      </div>
    </div>
  );
};
