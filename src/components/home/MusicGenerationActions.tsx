
import { Button } from '@/components/ui/button';
import { Music, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';

interface MusicGenerationActionsProps {
  remainingFree: number;
}

export const MusicGenerationActions = ({ remainingFree }: MusicGenerationActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        onClick={() => navigate('/edn')}
        size="lg"
        className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
      >
        <Music className="h-6 w-6 mr-2" />
        <TranslatedText text={remainingFree > 0 ? "Générer gratuitement" : "Générer ma Musique"} />
      </Button>
      <Button 
        onClick={() => navigate('/edn/music-library')}
        variant="outline"
        size="lg"
        className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg"
      >
        <Library className="h-6 w-6 mr-2" />
        <TranslatedText text="Ma Bibliothèque" />
      </Button>
      
      {remainingFree === 0 && (
        <Button 
          onClick={() => navigate('/med-mng/pricing')}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          <TranslatedText text="Voir les Tarifs" />
        </Button>
      )}
    </div>
  );
};
