import { Button } from '@/components/ui/button';
import { Music, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { ROUTE_PATHS } from '@/config/routes';

interface MusicGenerationActionsProps {
  remainingFree: number;
}

export const MusicGenerationActions = ({ remainingFree }: MusicGenerationActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        onClick={() => navigate(ROUTE_PATHS.ednComplete)}
        size="lg"
        className="bg-warning text-warning-foreground hover:bg-warning/90 px-8 py-3 text-lg"
      >
        <Music className="h-6 w-6 mr-2" />
        <TranslatedText text={remainingFree > 0 ? "Générer gratuitement" : "Générer ma Musique"} />
      </Button>
      <Button 
        onClick={() => navigate(ROUTE_PATHS.ednMusicLibrary)}
        variant="outline"
        size="lg"
        className="border-warning text-warning hover:bg-warning/10 px-8 py-3 text-lg"
      >
        <Library className="h-6 w-6 mr-2" />
        <TranslatedText text="Ma Bibliothèque" />
      </Button>
      
      {remainingFree === 0 && (
        <Button 
          onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
        >
          <TranslatedText text="Voir les Tarifs" />
        </Button>
      )}
    </div>
  );
};
