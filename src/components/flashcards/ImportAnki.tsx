import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

interface AnkiCard {
  front: string;
  back: string;
  tags?: string[];
}

interface ImportAnkiProps {
  deckId: string;
  onImportComplete: () => void;
}

export const ImportAnki = ({ deckId, onImportComplete }: ImportAnkiProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'apkg') {
      await handleApkgImport(file);
    } else if (extension === 'txt' || extension === 'csv') {
      await handleTextImport(file);
    } else {
      toast({
        title: "Format non supporté",
        description: "Utilisez un fichier .apkg, .txt ou .csv",
        variant: "destructive"
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApkgImport = async (file: File) => {
    setIsImporting(true);
    setProgress(0);
    setError(null);
    setImportedCount(0);

    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      
      // Read the .apkg file (it's a zip archive)
      const zip = await JSZip.loadAsync(file);
      setProgress(10);
      
      // Look for the collection.anki2 SQLite database or media files
      const files = Object.keys(zip.files);
      
      // Try to find and parse the collection data
      // .apkg contains: collection.anki2 (SQLite), media (JSON), and media files
      
      // For now, try to extract from any text-based content
      let extractedCards: AnkiCard[] = [];
      
      // Check for media JSON which maps media files
      const mediaFile = zip.file('media');
      if (mediaFile) {
        const mediaContent = await mediaFile.async('text');
        console.log('Media mapping found:', mediaContent.substring(0, 200));
      }
      
      setProgress(30);
      
      // Try to find any readable content
      // Some .apkg exports include readable formats
      for (const fileName of files) {
        if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
          const content = await zip.file(fileName)?.async('text');
          if (content) {
            const lines = content.split('\n').filter(line => line.trim());
            for (const line of lines) {
              const parts = line.includes('\t') ? line.split('\t') : line.split(';');
              if (parts.length >= 2) {
                extractedCards.push({
                  front: parts[0].trim(),
                  back: parts[1].trim(),
                  tags: parts[2]?.split(',').map(t => t.trim()) || []
                });
              }
            }
          }
        }
      }
      
      setProgress(50);
      
      // If no direct text found, provide guidance
      if (extractedCards.length === 0) {
        toast({
          title: "Format .apkg complexe",
          description: "Ce fichier utilise le format SQLite d'Anki. Exportez vos cartes en format texte depuis Anki (Fichier > Exporter > Notes en texte brut) pour un import complet.",
          variant: "default"
        });
        
        // Show what was found in the archive
        toast({
          title: `Archive analysée`,
          description: `${files.length} fichiers trouvés dans l'archive. Formats détectés: ${files.slice(0, 3).join(', ')}...`,
        });
        
        setProgress(100);
        setIsImporting(false);
        return;
      }
      
      // Import extracted cards
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let imported = 0;
      const batchSize = 10;
      
      for (let i = 0; i < extractedCards.length; i += batchSize) {
        const batch = extractedCards.slice(i, i + batchSize);
        
        const cardsToInsert = batch.map(card => ({
          deck_id: deckId,
          front_content: card.front,
          back_content: card.back,
          tags: card.tags
        }));

        const { error: insertError } = await supabase
          .from('flashcards')
          .insert(cardsToInsert);

        if (!insertError) {
          imported += batch.length;
        }

        setProgress(50 + Math.round(((i + batch.length) / extractedCards.length) * 50));
        setImportedCount(imported);
      }

      toast({
        title: "Import terminé",
        description: `${imported} cartes importées depuis l'archive Anki`,
      });

      onImportComplete();
    } catch (err: any) {
      console.error('APKG import error:', err);
      setError(err.message || "Erreur lors de l'import");
      toast({
        title: "Erreur d'import",
        description: "Impossible de lire le fichier .apkg. Essayez un export texte depuis Anki.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleTextImport = async (file: File) => {
    setIsImporting(true);
    setProgress(0);
    setError(null);
    setImportedCount(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const cards: AnkiCard[] = [];
      
      for (const line of lines) {
        // Support tab-separated or semicolon-separated format
        const parts = line.includes('\t') 
          ? line.split('\t') 
          : line.split(';');
        
        if (parts.length >= 2) {
          cards.push({
            front: parts[0].trim(),
            back: parts[1].trim(),
            tags: parts[2]?.split(',').map(t => t.trim()) || []
          });
        }
      }

      if (cards.length === 0) {
        throw new Error("Aucune carte trouvée dans le fichier");
      }

      // Import cards to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let imported = 0;
      const batchSize = 10;
      
      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize);
        
        // Use correct column names from schema: front_content and back_content
        const cardsToInsert = batch.map(card => ({
          deck_id: deckId,
          front_content: card.front,
          back_content: card.back,
          tags: card.tags
        }));

        const { error: insertError } = await supabase
          .from('flashcards')
          .insert(cardsToInsert);

        if (insertError) {
          console.error('Batch insert error:', insertError);
          // Continue with other batches
        } else {
          imported += batch.length;
        }

        setProgress(Math.round(((i + batch.length) / cards.length) * 100));
        setImportedCount(imported);
      }

      toast({
        title: "Import terminé",
        description: `${imported} cartes importées sur ${cards.length}`,
      });

      onImportComplete();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'import");
      toast({
        title: "Erreur d'import",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importer depuis Anki
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importez vos flashcards depuis un fichier Anki (.apkg) ou texte (.txt, .csv).
          Format texte : une carte par ligne, question et réponse séparées par une tabulation ou un point-virgule.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".apkg,.txt,.csv"
          className="hidden"
        />

        {isImporting ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Import en cours...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {importedCount} cartes importées
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : importedCount > 0 ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{importedCount} cartes importées</span>
          </div>
        ) : null}

        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full gap-2"
          variant="outline"
        >
          <FileText className="h-4 w-4" />
          Sélectionner un fichier
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Formats supportés : .txt, .csv (tab ou ; séparateur)
        </p>
      </CardContent>
    </Card>
  );
};

export default ImportAnki;
