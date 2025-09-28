import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Save, Download, Upload, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { useSynchronizedLyrics, type LyricsLine } from '@/hooks/useSynchronizedLyrics';

interface LyricsEditorProps {
  songId: string;
  audioUrl?: string;
  onSave?: (lyrics: LyricsLine[]) => void;
  className?: string;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  songId,
  audioUrl,
  onSave,
  className = ''
}) => {
  const {
    lyricsData,
    loading,
    saveSynchronizedLyrics,
    updateCurrentLine,
    currentLineIndex,
    exportLyrics
  } = useSynchronizedLyrics(songId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [rawLyrics, setRawLyrics] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  // Synchroniser les paroles avec l'état local
  useEffect(() => {
    if (lyricsData?.lyrics_data) {
      setRawLyrics(lyricsData.lyrics_data.map(line => 
        `[${formatTime(line.time)}] ${line.text}`
      ).join('\n'));
    }
  }, [lyricsData]);

  // Gestion audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateCurrentLine(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [updateCurrentLine]);

  // Contrôles audio
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = value[0] / 100;
    audio.volume = vol;
    setVolume(value[0]);
  };

  // Formatage du temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  };

  // Parsing des paroles
  const parseLyrics = (text: string): LyricsLine[] => {
    const lines = text.split('\n');
    const parsed: LyricsLine[] = [];

    lines.forEach(line => {
      const match = line.match(/^\[(\d{1,2}):(\d{2}\.?\d*)\]\s*(.*)$/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        const text = match[3].trim();
        if (text) {
          parsed.push({ time, text });
        }
      }
    });

    return parsed.sort((a, b) => a.time - b.time);
  };

  // Sauvegarde
  const handleSave = async () => {
    const parsed = parseLyrics(rawLyrics);
    const success = await saveSynchronizedLyrics(songId, parsed, 'manual');
    if (success && onSave) {
      onSave(parsed);
    }
  };

  // Export
  const handleExport = (format: 'lrc' | 'srt' | 'txt') => {
    const content = exportLyrics(format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics_${songId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Ajouter un timestamp à la position actuelle
  const addTimestamp = () => {
    const time = formatTime(currentTime);
    const newLine = `[${time}] `;
    setRawLyrics(prev => prev + (prev ? '\n' : '') + newLine);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Audio player (caché) */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}

      {/* Contrôles audio */}
      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <TranslatedText text="Lecture audio" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                disabled={!audioUrl}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full"
                />
              </div>
              
              <span className="text-sm text-gray-500 min-w-[100px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-32"
              />
              <span className="text-sm text-gray-500 min-w-[40px]">{volume}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Éditeur de paroles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TranslatedText text="Éditeur de paroles synchronisées" />
              {lyricsData && (
                <Badge variant="secondary">
                  {lyricsData.source === 'manual' ? 'Manuel' : 
                   lyricsData.source === 'ai_generated' ? 'IA' : 'Suno'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTimestamp}
                >
                  <TranslatedText text="+ Timestamp" />
                </Button>
              )}
              
              <Select onValueChange={handleExport}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lrc">LRC</SelectItem>
                  <SelectItem value="srt">SRT</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <TranslatedText text="Format: [MM:SS.XX] Texte de la ligne" />
            <br />
            <TranslatedText text="Exemple: [01:23.45] Première ligne des paroles" />
          </div>
          
          <Textarea
            value={rawLyrics}
            onChange={(e) => setRawLyrics(e.target.value)}
            placeholder="[00:15.30] Première ligne des paroles&#10;[00:18.45] Deuxième ligne des paroles"
            className="min-h-[300px] font-mono text-sm"
          />
          
          {currentLineIndex >= 0 && lyricsData?.lyrics_data && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <div className="text-sm text-yellow-800">
                <strong>Ligne actuelle:</strong> {lyricsData.lyrics_data[currentLineIndex]?.text}
              </div>
              <div className="text-xs text-yellow-600">
                Temps: {formatTime(lyricsData.lyrics_data[currentLineIndex]?.time || 0)}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setRawLyrics('')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <TranslatedText text="Effacer" />
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              <TranslatedText text={loading ? "Sauvegarde..." : "Sauvegarder"} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};