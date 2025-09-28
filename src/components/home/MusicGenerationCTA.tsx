
import { Button } from '@/components/ui/button';
import { Music, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';

interface MusicGenerationCTAProps {
  remainingFree: number;
}

export const MusicGenerationCTA = ({ remainingFree }: MusicGenerationCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6">
      <div className="text-center">
        <Music className="h-16 w-16 text-amber-600 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          <TranslatedText text="Prêt à commencer ?" />
        </h4>
        <p className="text-gray-600 mb-6">
          <TranslatedText text={remainingFree > 0 ? `${remainingFree} générations gratuites disponibles` : "Créez votre première chanson médicale"} />
        </p>
        <Button 
          onClick={() => navigate(remainingFree > 0 ? '/edn' : '/med-mng/pricing')}
          className="bg-amber-600 hover:bg-amber-700 text-white w-full"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          <TranslatedText text={remainingFree > 0 ? "Essayer gratuitement" : "Voir les tarifs"} />
        </Button>
      </div>
    </div>
  );
};
