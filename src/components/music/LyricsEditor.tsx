import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RotateCcw, FileText, Music } from 'lucide-react';
import { SynchronizedLyricsPlayer } from './SynchronizedLyricsPlayer';
import { useSynchronizedLyrics } from '@/hooks/music/useSynchronizedLyrics';
import { useToast } from '@/hooks/use-toast';

interface LyricsEditorProps {
  audioUrl: string;
  title: string;
  audioId?: string;
  taskId?: string;
  initialLyrics?: string;
  onSave?: (lyrics: string) => void;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  audioUrl,
  title,
  audioId,
  taskId,
  initialLyrics = '',
  onSave
}) => {
  const [rawLyrics, setRawLyrics] = useState(initialLyrics);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const {
    lyrics,
    waveform,
    isLoading,
    error,
    reloadLyrics,
    exportLyrics,
    hasTimestamps
  } = useSynchronizedLyrics({
    audioId,
    taskId,
    rawLyrics,
    enableAutoSync: true
  });

  const handleSave = () => {
    onSave?.(rawLyrics);
    setEditMode(false);
    
    toast({
      title: "Paroles sauvegardées",
      description: "Les paroles ont été mises à jour avec succès",
    });
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lrc,.srt,.txt';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawLyrics(content);
        
        toast({
          title: "Fichier importé",
          description: `${file.name} importé avec succès`,
        });
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleExport = (format: 'srt' | 'lrc' | 'txt') => {
    const content = exportLyrics(format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export réussi",
      description: `Paroles exportées au format ${format.toUpperCase()}`,
    });
  };

  const handleAutoSync = () => {
    reloadLyrics();
    
    toast({
      title: "Synchronisation en cours",
      description: "Tentative de récupération des paroles synchronisées...",
    });
  };

  if (editMode) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-amber-800">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Édition des Paroles - {title}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImportFile} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                Annuler
              </Button>
              <Button onClick={handleSave} size="sm">
                Sauvegarder
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">Format des paroles</h4>
            <div className="text-sm text-amber-700 space-y-2">
              <p><strong>Format LRC (recommandé):</strong></p>
              <code className="block bg-amber-100 p-2 rounded text-xs">
                [00:12.50]Première ligne de paroles<br/>
                [00:18.30]Deuxième ligne de paroles<br/>
                [00:24.80]Troisième ligne...
              </code>
              <p className="mt-2"><strong>Format simple:</strong> Une ligne par phrase (synchronisation automatique)</p>
            </div>
          </div>

          <Textarea
            value={rawLyrics}
            onChange={(e) => setRawLyrics(e.target.value)}
            placeholder="Saisissez les paroles ici..."
            className="min-h-80 bg-white/80 border-amber-200"
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-amber-600">
              {rawLyrics.split('\n').filter(line => line.trim()).length} lignes
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player principal */}
      <SynchronizedLyricsPlayer
        audioUrl={audioUrl}
        lyrics={lyrics}
        title={title}
        waveform={waveform}
      />

      {/* Contrôles d'édition */}
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5" />
              Gestion des Paroles
            </div>
            <div className="flex items-center gap-2">
              {hasTimestamps && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Synchronisées
                </Badge>
              )}
              {error && (
                <Badge variant="destructive">
                  Erreur
                </Badge>
              )}
              {isLoading && (
                <Badge variant="secondary">
                  Chargement...
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actions d'édition */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Édition</h4>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Éditer les paroles
                </Button>
                
                <Button
                  onClick={handleImportFile}
                  variant="outline"
                  className="justify-start"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer fichier LRC/SRT
                </Button>
                
                <Button
                  onClick={handleAutoSync}
                  variant="outline"
                  className="justify-start"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resynchroniser
                </Button>
              </div>
            </div>

            {/* Actions d'export */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Export</h4>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleExport('lrc')}
                  variant="outline"
                  className="justify-start"
                  disabled={lyrics.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export LRC
                </Button>
                
                <Button
                  onClick={() => handleExport('srt')}
                  variant="outline"
                  className="justify-start"
                  disabled={lyrics.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export SRT
                </Button>
                
                <Button
                  onClick={() => handleExport('txt')}
                  variant="outline"
                  className="justify-start"
                  disabled={lyrics.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Texte
                </Button>
              </div>
            </div>
          </div>

          {/* Informations */}
          {lyrics.length > 0 && (
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Lignes:</span>
                  <div className="text-gray-800">{lyrics.length}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Durée:</span>
                  <div className="text-gray-800">
                    {lyrics.length > 0 ? `${Math.round(lyrics[lyrics.length - 1].time)}s` : '-'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Format:</span>
                  <div className="text-gray-800">
                    {hasTimestamps ? 'Synchronisé' : 'Auto-sync'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Statut:</span>
                  <div className="text-gray-800">
                    {isLoading ? 'Chargement...' : error ? 'Erreur' : 'Prêt'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};