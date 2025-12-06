
import { TranslatedText } from '@/components/TranslatedText';

export const MusicLibraryLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warning/10 via-warning/5 to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-warning mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          <TranslatedText text="Chargement de votre bibliothèque musicale..." />
        </p>
      </div>
    </div>
  );
};
