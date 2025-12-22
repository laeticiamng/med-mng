
import React from 'react';
import { Button } from '@/components/ui/button';
import { Music, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { ROUTE_PATHS } from '@/config/routes';

interface CreateSongHeaderProps {
  remainingCredits?: number;
}

export const CreateSongHeader: React.FC<CreateSongHeaderProps> = ({ remainingCredits }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-6 sm:mb-8">
      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.home)}
          className="flex items-center gap-2 bg-background/80 hover:bg-background shadow-sm"
        >
          <Home className="h-4 w-4" />
          <TranslatedText text="Accueil" />
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.medMngMusicLibrary)}
          className="flex items-center gap-2 bg-background/80 hover:bg-background shadow-sm"
        >
          <Music className="h-4 w-4" />
          <TranslatedText text="Ma Bibliothèque" />
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
          className="flex items-center gap-2 bg-background/80 hover:bg-background shadow-sm"
        >
          <TranslatedText text="Voir les Plans" />
        </Button>
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
        <TranslatedText text="Créer une chanson" />
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-2xl mx-auto">
        <TranslatedText text="Sélectionnez votre contenu EDN et générez votre musique personnalisée" />
      </p>
      <div className="inline-flex items-center gap-2 bg-background rounded-lg px-4 py-2 shadow-sm border">
        <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <span className="text-xs sm:text-sm font-medium">
          <TranslatedText text="Crédits restants" />: {remainingCredits || 0}
        </span>
      </div>
    </div>
  );
};
