import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export interface AnkiCard {
  front: string;
  back: string;
  tags: string[];
}

export interface AnkiImportResult {
  success: boolean;
  cardsImported: number;
  errors: string[];
  deckName: string;
}

/**
 * Hook for importing Anki .apkg files
 * Uses JSZip to extract the archive and parse card data
 */
export const useAnkiImport = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Parse an Anki .apkg file and extract cards
   * .apkg files are ZIP archives containing:
   * - media (folder with images/audio)
   * - collection.anki2 (SQLite database)
   * - or collection.anki21 for newer versions
   */
  const parseApkgFile = useCallback(async (file: File): Promise<AnkiCard[]> => {
    const cards: AnkiCard[] = [];
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Look for text-based exports (CSV or simple text)
      const textFiles = Object.keys(zip.files).filter(
        name => name.endsWith('.txt') || name.endsWith('.csv')
      );
      
      for (const fileName of textFiles) {
        const content = await zip.files[fileName].async('string');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          // Tab-separated format (Anki default export)
          const parts = line.split('\t');
          if (parts.length >= 2) {
            cards.push({
              front: parts[0].trim(),
              back: parts[1].trim(),
              tags: parts.slice(2).map(t => t.trim()).filter(Boolean)
            });
          }
        }
      }
      
      // If no text files, try to parse media folder for hints
      if (cards.length === 0) {
        // Check for decks.json (Anki JSON export)
        const jsonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
        if (jsonFile) {
          const jsonContent = await zip.files[jsonFile].async('string');
          try {
            const data = JSON.parse(jsonContent);
            if (Array.isArray(data.notes)) {
              data.notes.forEach((note: any) => {
                if (note.fields && note.fields.length >= 2) {
                  cards.push({
                    front: note.fields[0] || '',
                    back: note.fields[1] || '',
                    tags: note.tags || []
                  });
                }
              });
            }
          } catch {
            // JSON parse failed, continue
          }
        }
      }
      
      return cards;
    } catch (error) {
      console.error('Error parsing APKG file:', error);
      throw new Error('Format de fichier non supporté');
    }
  }, []);

  /**
   * Import cards from an Anki .apkg file
   */
  const importFromFile = useCallback(async (
    file: File,
    onCardImport?: (card: AnkiCard, index: number, total: number) => Promise<void>
  ): Promise<AnkiImportResult> => {
    setLoading(true);
    setProgress(0);
    
    const errors: string[] = [];
    let cardsImported = 0;
    
    try {
      // Validate file
      if (!file.name.endsWith('.apkg') && !file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
        throw new Error('Format non supporté. Utilisez .apkg, .txt ou .csv');
      }

      let cards: AnkiCard[];
      
      if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        // Direct text/csv import
        const content = await file.text();
        const lines = content.split('\n').filter(line => line.trim());
        cards = lines.map(line => {
          const parts = line.split('\t');
          return {
            front: parts[0]?.trim() || '',
            back: parts[1]?.trim() || '',
            tags: parts.slice(2).map(t => t.trim()).filter(Boolean)
          };
        }).filter(c => c.front && c.back);
      } else {
        // APKG archive import
        cards = await parseApkgFile(file);
      }

      if (cards.length === 0) {
        throw new Error('Aucune carte trouvée dans le fichier');
      }

      // Import cards one by one
      for (let i = 0; i < cards.length; i++) {
        try {
          if (onCardImport) {
            await onCardImport(cards[i], i, cards.length);
          }
          cardsImported++;
          setProgress(Math.round(((i + 1) / cards.length) * 100));
        } catch (err) {
          errors.push(`Carte ${i + 1}: ${err instanceof Error ? err.message : 'Erreur'}`);
        }
      }

      toast({
        title: "Import réussi",
        description: `${cardsImported} cartes importées depuis ${file.name}`,
      });

      return {
        success: true,
        cardsImported,
        errors,
        deckName: file.name.replace(/\.(apkg|txt|csv)$/, '')
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "Erreur d'import",
        description: message,
        variant: "destructive"
      });
      
      return {
        success: false,
        cardsImported,
        errors: [message, ...errors],
        deckName: file.name.replace(/\.(apkg|txt|csv)$/, '')
      };
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [parseApkgFile, toast]);

  /**
   * Validate file before import
   */
  const validateFile = useCallback((file: File): { valid: boolean; message: string } => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validExtensions = ['.apkg', '.txt', '.csv'];
    
    if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return { valid: false, message: 'Format non supporté. Utilisez .apkg, .txt ou .csv' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: 'Fichier trop volumineux (max 50MB)' };
    }
    
    return { valid: true, message: 'Fichier valide' };
  }, []);

  return {
    loading,
    progress,
    importFromFile,
    validateFile,
    parseApkgFile
  };
};

export default useAnkiImport;
