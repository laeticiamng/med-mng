
import { Button } from '@/components/ui/button';
import { Music, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { ROUTE_PATHS } from '@/config/routes';

interface MusicGenerationCTAProps {
  remainingFree: number;
}

export const MusicGenerationCTA = ({ remainingFree }: MusicGenerationCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-warning/10 to-warning/20 rounded-xl p-6 border border-warning/20">
      <div className="text-center">
        <Music className="h-16 w-16 text-warning mx-auto mb-4" />
        <h4 className="text-xl font-bold text-foreground mb-2">
          <TranslatedText text="Prêt à commencer ?" />
        </h4>
        <p className="text-muted-foreground mb-6">
          <TranslatedText text={remainingFree > 0 ? `${remainingFree} générations gratuites disponibles` : "Créez votre première chanson médicale"} />
        </p>
        <Button 
          onClick={() => navigate(remainingFree > 0 ? ROUTE_PATHS.ednComplete : ROUTE_PATHS.medMngPricing)}
          className="bg-warning text-warning-foreground hover:bg-warning/90 w-full"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          <TranslatedText text={remainingFree > 0 ? "Essayer gratuitement" : "Voir les tarifs"} />
        </Button>
      </div>
    </div>
  );
};
