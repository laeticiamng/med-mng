
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

interface MusicGenerationHeaderProps {
  remainingFree: number;
  maxFreeGenerations: number;
}

export const MusicGenerationHeader = ({ remainingFree, maxFreeGenerations }: MusicGenerationHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        <TranslatedText text="Génération Musicale IA" />
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
        <TranslatedText text="Transformez vos contenus EDN en chansons personnalisées avec l'intelligence artificielle. Apprenez en musique et créez votre bibliothèque médicale unique." />
      </p>

      {/* Free Trial Badge */}
      {remainingFree > 0 && (
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-green-100 text-green-800">
          <Gift className="h-4 w-4 mr-2" />
          <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
        </Badge>
      )}
    </div>
  );
};
