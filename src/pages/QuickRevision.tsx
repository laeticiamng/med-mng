import { QuickRevisionMode } from '@/components/revision/QuickRevisionMode';
import { Helmet } from 'react-helmet-async';
import { Zap } from 'lucide-react';

export default function QuickRevision() {
  return (
    <>
      <Helmet>
        <title>Révision rapide — MED MNG</title>
        <meta name="description" content="Révisez un item EDN tiré au hasard avec un court quiz." />
        <link rel="canonical" href="/revision-rapide" />
      </Helmet>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Révision rapide
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            1 item · 3 QCM
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Un item EDN tiré au hasard et un court quiz pour vérifier vos connaissances.
          </p>
        </div>
        <QuickRevisionMode />
      </div>
    </>
  );
}
