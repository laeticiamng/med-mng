import { EdnExtractionTest } from '@/components/test/EdnExtractionTest';

export default function TestExtraction() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🧪 Test d'Extraction UNESS</h1>
          <p className="text-muted-foreground mt-2">
            Interface de test pour la nouvelle fonction d'extraction complète des données UNESS LISA 2025
          </p>
        </div>
        
        <EdnExtractionTest />
      </div>
    </div>
  );
}