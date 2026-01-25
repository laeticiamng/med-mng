import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Flashcard, FlashcardDeck } from '@/hooks/useFlashcards';
import { Check, Download, FileText, Upload } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface FlashcardImportExportProps {
  _decks: FlashcardDeck[];
  currentDeck?: FlashcardDeck | null;
  cards: Flashcard[];
  onImport: (cards: Array<{ front: string; back: string; tags?: string[] }>) => Promise<void>;
}

export const FlashcardImportExport: React.FC<FlashcardImportExportProps> = ({
  _decks,
  currentDeck,
  cards,
  onImport
}) => {
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv' | 'anki'>('json');
  const [importing, setImporting] = useState(false);
  const [previewCards, setPreviewCards] = useState<Array<{ front: string; back: string }>>([]);

  /**
   * Export deck to JSON format
   */
  const exportToJSON = useCallback(() => {
    if (!currentDeck || cards.length === 0) {
      toast({
        title: "Rien à exporter",
        description: "Sélectionnez un deck avec des cartes",
        variant: "destructive"
      });
      return;
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      deck: {
        name: currentDeck.name,
        description: currentDeck.description,
        category: currentDeck.category,
      },
      cards: cards.map(c => ({
        front: c.front,
        back: c.back,
        tags: c.tags,
        difficulty: c.difficulty,
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDeck.name.replace(/\s+/g, '_')}_flashcards.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${cards.length} cartes exportées`
    });
  }, [currentDeck, cards, toast]);

  /**
   * Export deck to CSV format (Anki compatible)
   */
  const exportToCSV = useCallback(() => {
    if (!currentDeck || cards.length === 0) {
      toast({
        title: "Rien à exporter",
        description: "Sélectionnez un deck avec des cartes",
        variant: "destructive"
      });
      return;
    }

    // CSV format: front;back;tags
    const csvContent = cards.map(c => {
      const front = c.front.replace(/"/g, '""').replace(/\n/g, '<br>');
      const back = c.back.replace(/"/g, '""').replace(/\n/g, '<br>');
      const tags = c.tags?.join(' ') || '';
      return `"${front}";"${back}";"${tags}"`;
    }).join('\n');

    const blob = new Blob([`"Front";"Back";"Tags"\n${csvContent}`], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDeck.name.replace(/\s+/g, '_')}_anki.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Anki réussi",
      description: `${cards.length} cartes exportées au format CSV`
    });
  }, [currentDeck, cards, toast]);

  /**
   * Parse import text based on format
   */
  const parseImport = useCallback((text: string, format: 'json' | 'csv' | 'anki') => {
    try {
      let parsedCards: Array<{ front: string; back: string; tags?: string[] }> = [];

      if (format === 'json') {
        const data = JSON.parse(text);
        if (data.cards && Array.isArray(data.cards)) {
          parsedCards = data.cards.map((c: any) => ({
            front: c.front || c.question || '',
            back: c.back || c.answer || '',
            tags: c.tags || []
          }));
        } else if (Array.isArray(data)) {
          parsedCards = data.map((c: any) => ({
            front: c.front || c.question || '',
            back: c.back || c.answer || '',
            tags: c.tags || []
          }));
        }
      } else if (format === 'csv' || format === 'anki') {
        // Parse CSV/TSV (semicolon or tab separated)
        const lines = text.trim().split('\n');
        const separator = text.includes('\t') ? '\t' : ';';
        
        // Skip header if it looks like one
        const startLine = lines[0].toLowerCase().includes('front') ? 1 : 0;
        
        for (let i = startLine; i < lines.length; i++) {
          const parts = lines[i].split(separator).map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 2 && parts[0] && parts[1]) {
            parsedCards.push({
              front: parts[0].replace(/<br>/g, '\n'),
              back: parts[1].replace(/<br>/g, '\n'),
              tags: parts[2] ? parts[2].split(' ').filter(Boolean) : []
            });
          }
        }
      }

      return parsedCards.filter(c => c.front && c.back);
    } catch (error) {
      console.error('Parse error:', error);
      return [];
    }
  }, []);

  /**
   * Preview import before confirming
   */
  const handlePreview = useCallback(() => {
    const parsed = parseImport(importText, importFormat);
    setPreviewCards(parsed);
    
    if (parsed.length === 0) {
      toast({
        title: "Aucune carte valide",
        description: "Vérifiez le format de votre fichier",
        variant: "destructive"
      });
    }
  }, [importText, importFormat, parseImport, toast]);

  /**
   * Confirm import
   */
  const handleConfirmImport = async () => {
    if (previewCards.length === 0) return;
    
    setImporting(true);
    try {
      await onImport(previewCards);
      toast({
        title: "Import réussi",
        description: `${previewCards.length} cartes importées`
      });
      setImportDialogOpen(false);
      setImportText('');
      setPreviewCards([]);
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Import / Export
        </CardTitle>
        <CardDescription>
          Importez ou exportez vos flashcards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={exportToJSON}
            disabled={!currentDeck || cards.length === 0}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={exportToCSV}
            disabled={!currentDeck || cards.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Anki
          </Button>
        </div>

        {/* Import dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Importer des cartes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importer des Flashcards</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Format selector */}
              <div className="flex gap-2">
                {(['json', 'csv', 'anki'] as const).map((format) => (
                  <Button
                    key={format}
                    variant={importFormat === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>

              {/* Format help */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                {importFormat === 'json' && (
                  <p>Format: {"{ cards: [{ front: '...', back: '...' }] }"}</p>
                )}
                {importFormat === 'csv' && (
                  <p>Format CSV: front;back;tags (une carte par ligne)</p>
                )}
                {importFormat === 'anki' && (
                  <p>Export Anki: front[TAB]back (fichier .txt exporté d'Anki)</p>
                )}
              </div>

              {/* Text input */}
              <Textarea
                placeholder="Collez votre contenu ici..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />

              {/* Preview button */}
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={!importText.trim()}
              >
                Prévisualiser
              </Button>

              {/* Preview results */}
              {previewCards.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="font-medium">{previewCards.length} cartes détectées</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {previewCards.slice(0, 5).map((card, idx) => (
                      <div key={idx} className="p-2 bg-muted/30 rounded text-sm">
                        <span className="font-medium">{card.front.slice(0, 50)}...</span>
                      </div>
                    ))}
                    {previewCards.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        + {previewCards.length - 5} autres cartes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm import */}
              <Button
                onClick={handleConfirmImport}
                disabled={previewCards.length === 0 || importing}
                className="w-full"
              >
                {importing ? 'Import en cours...' : `Importer ${previewCards.length} cartes`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        {currentDeck && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Deck actuel: <span className="font-medium text-foreground">{currentDeck.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{cards.length}</span> cartes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashcardImportExport;
