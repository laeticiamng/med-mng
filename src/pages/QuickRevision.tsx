import { QuickRevisionMode } from '@/components/revision/QuickRevisionMode';
import { AutoSEO } from '@/components/seo/AutoSEO';
import { Zap } from 'lucide-react';

export default function QuickRevision() {
  return (
    <>
      <AutoSEO
        title="Révision rapide — MED-MNG"
        description="Révisez un item EDN en 2 minutes : écoutez la chanson, répondez au quiz, progressez."
        keywords="révision rapide, EDN, QCM, médecine"
        canonical="/revision-rapide"
      />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Révision rapide
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            1 item · 1 chanson · 3 QCM · 2 minutes
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Le moyen le plus rapide de réviser la médecine. Un item EDN aléatoire, une chanson pour mémoriser, un quiz pour valider.
          </p>
        </div>
        <QuickRevisionMode />
      </div>
    </>
  );
}
