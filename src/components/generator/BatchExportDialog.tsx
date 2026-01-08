import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, FileAudio, Archive, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  style?: string;
  rang?: string;
}

interface BatchExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
  onExportComplete?: () => void;
}

type ExportFormat = 'individual' | 'zip';

export const BatchExportDialog: React.FC<BatchExportDialogProps> = ({
  open,
  onOpenChange,
  tracks,
  onExportComplete,
}) => {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('individual');

  const toggleTrack = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(tracks.map(t => t.id)));
    }
  };

  const handleExport = async () => {
    if (selectedTracks.size === 0) {
      toast.error('Sélectionnez au moins une piste');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const tracksToExport = tracks.filter(t => selectedTracks.has(t.id));
      
      for (let i = 0; i < tracksToExport.length; i++) {
        const track = tracksToExport[i];
        
        // Télécharger chaque fichier
        const response = await fetch(track.audioUrl);
        const blob = await response.blob();
        
        // Créer le lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.title || `track-${track.id}`}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Mettre à jour la progression
        setExportProgress(Math.round(((i + 1) / tracksToExport.length) * 100));
        
        // Petit délai entre les téléchargements pour éviter de surcharger le navigateur
        if (i < tracksToExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(`${tracksToExport.length} piste(s) exportée(s)`);
      onExportComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export par lot
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les pistes à exporter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sélection tout */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedTracks.size === tracks.length}
                onCheckedChange={selectAll}
              />
              <span className="text-sm font-medium">Tout sélectionner</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedTracks.size}/{tracks.length} sélectionnées
            </span>
          </div>

          {/* Liste des tracks */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {tracks.map(track => (
              <label
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTracks.has(track.id) 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card border-border/30 hover:bg-card/80'
                }`}
              >
                <Checkbox
                  checked={selectedTracks.has(track.id)}
                  onCheckedChange={() => toggleTrack(track.id)}
                />
                <FileAudio className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title || 'Sans titre'}</p>
                  {track.style && (
                    <p className="text-xs text-muted-foreground">{track.style}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Progression d'export */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export en cours...
                </span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedTracks.size === 0 || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter ({selectedTracks.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
