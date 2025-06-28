
import { TranslatedText } from '@/components/TranslatedText';

export const MusicLibraryLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          <TranslatedText text="Chargement de votre bibliothèque musicale..." />
        </p>
      </div>
    </div>
  );
};
