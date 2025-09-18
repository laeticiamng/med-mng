import React, { useEffect, useState } from 'react';
import { Search, Download, SkipBack, SkipForward, Volume2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSynchronizedLyrics } from '@/hooks/useSynchronizedLyrics';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { KaraokeView } from '@/components/lyrics/KaraokeView';

interface KaraokePlayerProps {
  songId: string;
  currentTime: number; // En secondes
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay?: () => void;
  className?: string;
}

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  songId,
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  className = '',
}) => {
  const {
    lyricsData,
    alignmentLog,
    loading,
    aligning,
    currentLineIndex,
    updateCurrentLine,
    goToLine,
    searchInLyrics,
    exportLyrics,
    alignFromSource,
  } = useSynchronizedLyrics(songId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ lineIndex: number; time: number }[]>([]);
  const [exportFormat, setExportFormat] = useState<'lrc' | 'srt' | 'txt' | 'json' | 'md'>('lrc');
  const { toast } = useToast();

  const segments = lyricsData?.lyrics_data ?? [];

  useEffect(() => {
    updateCurrentLine(currentTime);
  }, [currentTime, updateCurrentLine]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = searchInLyrics(searchQuery);
    setSearchResults(results);

    if (results.length > 0) {
      onSeek(results[0].time);
      toast({
        title: '🔍 Recherche',
        description: `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`,
      });
    } else {
      toast({
        title: '🔍 Recherche',
        description: 'Aucun résultat trouvé',
        variant: 'destructive',
      });
    }
  };

  const goToNextLine = () => {
    if (!segments.length) return;
    const nextIndex = Math.min(currentLineIndex + 1, segments.length - 1);
    const time = goToLine(nextIndex);
    onSeek(time);
  };

  const goToPreviousLine = () => {
    if (!segments.length) return;
    const prevIndex = Math.max(currentLineIndex - 1, 0);
    const time = goToLine(prevIndex);
    onSeek(time);
  };

  const handleExport = () => {
    const content = exportLyrics(exportFormat);
    if (!content) {
      toast({
        title: 'Erreur',
        description: 'Aucune parole à exporter',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '📥 Export réussi',
      description: `Paroles exportées au format ${exportFormat.toUpperCase()}`,
    });
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6 rounded-lg ${className}`}>
        <div className="animate-pulse text-center">
          <TranslatedText text="Chargement des paroles synchronisées..." />
        </div>
      </div>
    );
  }

  if (!segments.length) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-lg text-center space-y-4 ${className}`}>
        <Volume2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">
          <TranslatedText text="Paroles non disponibles" />
        </h3>
        <p className="text-gray-400">
          <TranslatedText text="Les paroles synchronisées ne sont pas encore disponibles pour cette chanson" />
        </p>
        <Button onClick={() => alignFromSource(songId)} disabled={aligning} variant="secondary">
          {aligning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <TranslatedText text="Alignement en cours" />
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              <TranslatedText text="Aligner automatiquement" />
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white rounded-lg overflow-hidden ${className}`}>
      <div className="p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            <TranslatedText text="Paroles Synchronisées" />
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousLine}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextLine}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les paroles..."
              className="bg-white/10 border-white/20 text-white placeholder-white/60"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="secondary" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={exportFormat} onValueChange={(value: typeof exportFormat) => setExportFormat(value)}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lrc">LRC</SelectItem>
                <SelectItem value="srt">SRT</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="md">Markdown</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={handleExport} disabled={aligning}>
              <Download className="h-4 w-4 mr-2" />
              <TranslatedText text="Export" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => alignFromSource(songId)} disabled={aligning}>
              {aligning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <KaraokeView
          segments={segments}
          activeIndex={currentLineIndex}
          onSeek={onSeek}
          highlightedIndexes={searchResults.map((result) => result.lineIndex)}
          height={320}
          contentId={songId}
        />
      </div>

      <div className="p-4 bg-black/20 backdrop-blur-sm text-center text-sm text-white/70">
        <span>
          <TranslatedText text={`${segments.length} lignes • Source: ${lyricsData?.source ?? 'aligned'}`} />
        </span>
        {searchResults.length > 0 && (
          <span className="ml-4 text-yellow-300">
            • {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
          </span>
        )}
        {alignmentLog?.confidence ? (
          <span className="ml-4 text-purple-200">
            • Alignement {Math.round((alignmentLog.confidence ?? 0) * 100)}% confiance
          </span>
        ) : null}
      </div>
    </div>
  );
};
