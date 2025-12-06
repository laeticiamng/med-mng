import React, { useEffect, useRef, useState } from 'react';
import { Search, Download, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSynchronizedLyrics, type LyricsLine } from '@/hooks/useSynchronizedLyrics';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

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
  className = ""
}) => {
  const { 
    lyricsData, 
    loading, 
    currentLineIndex, 
    updateCurrentLine, 
    goToLine, 
    searchInLyrics, 
    exportLyrics 
  } = useSynchronizedLyrics(songId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ lineIndex: number; time: number }[]>([]);
  const [exportFormat, setExportFormat] = useState<'lrc' | 'srt' | 'txt'>('lrc');
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mettre à jour la ligne courante selon le temps
  useEffect(() => {
    updateCurrentLine(currentTime);
  }, [currentTime, updateCurrentLine]);

  // Auto-scroll vers la ligne active
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = container.querySelector(`[data-line-index="${currentLineIndex}"]`) as HTMLElement;
      
      if (activeLine) {
        const containerHeight = container.clientHeight;
        const lineTop = activeLine.offsetTop;
        const lineHeight = activeLine.clientHeight;
        
        // Centrer la ligne active dans le conteneur
        const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLineIndex]);

  // Rechercher dans les paroles
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
        title: "🔍 Recherche",
        description: `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`,
      });
    } else {
      toast({
        title: "🔍 Recherche",
        description: "Aucun résultat trouvé",
        variant: "destructive",
      });
    }
  };

  // Aller à la ligne suivante/précédente
  const goToNextLine = () => {
    if (!lyricsData?.lyrics_data) return;
    const nextIndex = Math.min(currentLineIndex + 1, lyricsData.lyrics_data.length - 1);
    const time = goToLine(nextIndex);
    onSeek(time);
  };

  const goToPreviousLine = () => {
    if (!lyricsData?.lyrics_data) return;
    const prevIndex = Math.max(currentLineIndex - 1, 0);
    const time = goToLine(prevIndex);
    onSeek(time);
  };

  // Exporter les paroles
  const handleExport = () => {
    const content = exportLyrics(exportFormat);
    if (!content) {
      toast({
        title: "Erreur",
        description: "Aucune parole à exporter",
        variant: "destructive",
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
      title: "📥 Export réussi",
      description: `Paroles exportées au format ${exportFormat.toUpperCase()}`,
    });
  };

  // Formatage du temps pour l'affichage
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-accent via-primary to-primary/80 text-primary-foreground p-6 rounded-lg ${className}`}>
        <div className="animate-pulse text-center">
          <TranslatedText text="Chargement des paroles synchronisées..." />
        </div>
      </div>
    );
  }

  if (!lyricsData?.lyrics_data || lyricsData.lyrics_data.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-muted to-muted/80 text-foreground p-8 rounded-lg text-center ${className}`}>
        <Volume2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          <TranslatedText text="Paroles non disponibles" />
        </h3>
        <p className="text-muted-foreground">
          <TranslatedText text="Les paroles synchronisées ne sont pas encore disponibles pour cette chanson" />
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-accent via-primary to-primary/80 text-primary-foreground rounded-lg overflow-hidden ${className}`}>
      {/* Header avec contrôles */}
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

        {/* Recherche */}
        <div className="flex items-center space-x-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les paroles..."
            className="bg-background/10 border-border/20 text-foreground placeholder-muted-foreground"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="secondary" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Export */}
        <div className="flex items-center space-x-2">
          <Select value={exportFormat} onValueChange={(value: 'lrc' | 'srt' | 'txt') => setExportFormat(value)}>
            <SelectTrigger className="w-24 bg-background/10 border-border/20 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lrc">LRC</SelectItem>
              <SelectItem value="srt">SRT</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            <TranslatedText text="Export" />
          </Button>
        </div>
      </div>

      {/* Paroles avec défilement */}
      <div 
        ref={lyricsContainerRef}
        className="h-80 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {lyricsData.lyrics_data.map((line, index) => {
          const isActive = index === currentLineIndex;
          const isInSearchResults = searchResults.some(result => result.lineIndex === index);
          
          return (
            <div
              key={index}
              data-line-index={index}
              className={`
                transition-all duration-300 cursor-pointer py-2 px-3 rounded
                ${isActive 
                  ? 'bg-white/20 text-white text-xl font-bold transform scale-105' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
                ${isInSearchResults ? 'bg-yellow-500/20 border border-yellow-400/50' : ''}
              `}
              onClick={() => onSeek(line.time)}
            >
              <div className="flex items-center justify-between">
                <span className={`${isActive ? 'text-shadow-lg' : ''}`}>
                  {line.text}
                </span>
                <span className="text-xs text-white/50 ml-4">
                  {formatTime(line.time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer avec infos */}
      <div className="p-4 bg-black/20 backdrop-blur-sm text-center">
        <p className="text-sm text-white/60">
          <TranslatedText text={`${lyricsData.lyrics_data.length} lignes • Source: ${lyricsData.source}`} />
          {searchResults.length > 0 && (
            <span className="ml-4 text-yellow-400">
              • {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} de recherche
            </span>
          )}
        </p>
      </div>
    </div>
  );
};