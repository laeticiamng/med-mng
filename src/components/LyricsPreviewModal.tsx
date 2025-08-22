import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { previewLyricsForItem } from '@/utils/generateAllAdvancedLyrics';
import { useToast } from '@/hooks/use-toast';

interface LyricsPreviewModalProps {
  itemCode: string;
  itemTitle: string;
}

export const LyricsPreviewModal = ({ itemCode, itemTitle }: LyricsPreviewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB'>('AB');
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const generatedLyrics = await previewLyricsForItem(itemCode, selectedRang);
      setLyrics(generatedLyrics);
      
      toast({
        title: "✅ Prévisualisation générée",
        description: `Paroles musicales pour ${itemCode} Rang ${selectedRang}`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de générer la prévisualisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLyrics = (lyrics: string[]) => {
    return lyrics.map((line, index) => {
      // Identifier les sections spéciales
      if (line.startsWith('[') && line.endsWith(']')) {
        return (
          <div key={index} className="font-bold text-primary text-lg mt-4 mb-2">
            {line}
          </div>
        );
      }
      
      if (line === '[Pause]') {
        return <div key={index} className="h-2"></div>;
      }
      
      if (line === '---') {
        return <div key={index} className="border-t border-muted my-3"></div>;
      }
      
      return (
        <div key={index} className="text-foreground leading-relaxed py-1">
          {line}
        </div>
      );
    });
  };

  const getLyricsStats = () => {
    const totalChars = lyrics.join('\n').length;
    const totalLines = lyrics.filter(l => l && l !== '[Pause]' && l !== '---').length;
    const estimatedDuration = Math.ceil(totalLines * 3); // ~3 secondes par ligne
    
    return { totalChars, totalLines, estimatedDuration };
  };

  const stats = lyrics.length > 0 ? getLyricsStats() : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          👁️ Prévisualiser
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="max-w-4xl max-h-[80vh]"
        aria-describedby="lyrics-preview-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎵 Prévisualisation Paroles Musicales
            <span className="text-muted-foreground text-sm font-normal">
              {itemCode} - {itemTitle.length > 50 ? itemTitle.substring(0, 47) + '...' : itemTitle}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Description for accessibility */}
        <div id="lyrics-preview-description" className="sr-only">
          Prévisualisation des paroles musicales générées par IA pour l'item EDN sélectionné. Permet de choisir le rang et de générer des paroles personnalisées.
        </div>
        
        <div className="space-y-4">
          {/* Contrôles */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Rang:</label>
              <Select value={selectedRang} onValueChange={(value) => setSelectedRang(value as 'A' | 'B' | 'AB')}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Rang A</SelectItem>
                  <SelectItem value="B">Rang B</SelectItem>
                  <SelectItem value="AB">A + B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handlePreview} 
              disabled={isLoading}
              className="bg-primary text-primary-foreground"
            >
              {isLoading ? "🔄 Génération..." : "🎵 Générer"}
            </Button>
            
            {stats && (
              <div className="text-sm text-muted-foreground">
                {stats.totalChars}/5000 caractères • {stats.totalLines} lignes • ~{stats.estimatedDuration}s
              </div>
            )}
          </div>
          
          {/* Prévisualisation des paroles */}
          {lyrics.length > 0 && (
            <ScrollArea className="h-[400px] w-full border rounded-lg p-4 bg-muted/30">
              <div className="space-y-1">
                {formatLyrics(lyrics)}
              </div>
            </ScrollArea>
          )}
          
          {lyrics.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-4xl mb-2">🎤</div>
              <p>Sélectionnez un rang et cliquez sur "Générer" pour prévisualiser les paroles</p>
              <p className="text-sm mt-2">Contenu médical • Structure complète • Qualité professionnelle</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};