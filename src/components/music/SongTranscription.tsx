/**
 * 📝 SONG TRANSCRIPTION COMPONENT
 * Composant accessible pour afficher les paroles synchronisées
 * avec support lecteur d'écran et mode dyslexie
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Copy, 
  Download, 
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Type
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface LyricLine {
  text: string;
  startTime?: number; // en secondes
  endTime?: number;
  isChorus?: boolean;
  isVerse?: boolean;
  verseNumber?: number;
}

interface SongTranscriptionProps {
  lyrics: string | LyricLine[];
  title?: string;
  itemCode?: string;
  currentTime?: number; // temps actuel de lecture en secondes
  isPlaying?: boolean;
  onLineClick?: (line: LyricLine, index: number) => void;
  showTimestamps?: boolean;
  className?: string;
}

/**
 * Convertit une chaîne de paroles en tableau de LyricLine
 */
const parseLyrics = (lyrics: string): LyricLine[] => {
  const lines = lyrics.split('\n').filter(line => line.trim());
  return lines.map((text, index) => {
    const isChorus = text.toLowerCase().includes('[refrain]') || text.toLowerCase().includes('[chorus]');
    const verseMatch = text.match(/\[(?:couplet|verse)\s*(\d*)\]/i);
    
    return {
      text: text.replace(/\[(refrain|chorus|couplet|verse)\s*\d*\]/gi, '').trim(),
      isChorus,
      isVerse: !!verseMatch,
      verseNumber: verseMatch ? parseInt(verseMatch[1]) || index + 1 : undefined
    };
  }).filter(line => line.text.length > 0);
};

export const SongTranscription: React.FC<SongTranscriptionProps> = ({
  lyrics,
  title,
  itemCode,
  currentTime = 0,
  isPlaying = false,
  onLineClick,
  showTimestamps = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highlightMode, setHighlightMode] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normaliser les paroles en tableau
  const lyricLines: LyricLine[] = typeof lyrics === 'string' 
    ? parseLyrics(lyrics) 
    : lyrics;

  // Trouver la ligne active basée sur le temps actuel
  useEffect(() => {
    if (!isPlaying || !lyricLines.some(l => l.startTime !== undefined)) return;

    const activeIndex = lyricLines.findIndex((line, index) => {
      const nextLine = lyricLines[index + 1];
      const start = line.startTime ?? 0;
      const end = line.endTime ?? nextLine?.startTime ?? Infinity;
      return currentTime >= start && currentTime < end;
    });

    if (activeIndex !== -1 && activeIndex !== activeLineIndex) {
      setActiveLineIndex(activeIndex);
      
      // Auto-scroll vers la ligne active
      if (containerRef.current && highlightMode) {
        const lineElement = containerRef.current.querySelector(`[data-line-index="${activeIndex}"]`);
        lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, isPlaying, lyricLines, activeLineIndex, highlightMode]);

  const handleCopy = async () => {
    const text = lyricLines.map(l => l.text).join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('Paroles copiées dans le presse-papier');
  };

  const handleDownload = () => {
    const text = lyricLines.map(l => l.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || itemCode || 'paroles'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Paroles téléchargées');
  };

  const fontSizeClasses = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const cycleFontSize = () => {
    const sizes: ('normal' | 'large' | 'xlarge')[] = ['normal', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(fontSize);
    setFontSize(sizes[(currentIndex + 1) % sizes.length]);
  };

  if (lyricLines.length === 0) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Aucune transcription disponible pour cette chanson.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn("overflow-hidden", className)}
      role="region"
      aria-label={`Transcription des paroles${title ? `: ${title}` : ''}`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">
                Transcription des paroles
                {itemCode && (
                  <Badge variant="outline" className="ml-2">
                    {itemCode}
                  </Badge>
                )}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleFontSize}
                title="Changer la taille du texte"
                aria-label={`Taille du texte: ${fontSize}`}
              >
                <Type className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                title="Copier les paroles"
                aria-label="Copier les paroles dans le presse-papier"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Télécharger les paroles"
                aria-label="Télécharger les paroles en fichier texte"
              >
                <Download className="h-4 w-4" />
              </Button>

              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isExpanded ? 'Réduire' : 'Développer'}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Contrôles d'accessibilité */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Switch
                id="dyslexia-mode"
                checked={dyslexiaMode}
                onCheckedChange={setDyslexiaMode}
                aria-describedby="dyslexia-desc"
              />
              <Label htmlFor="dyslexia-mode" className="text-sm cursor-pointer">
                Police dyslexie
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="highlight-mode"
                checked={highlightMode}
                onCheckedChange={setHighlightMode}
                aria-describedby="highlight-desc"
              />
              <Label htmlFor="highlight-mode" className="text-sm cursor-pointer">
                Surlignage
              </Label>
            </div>
            
            <span className="text-xs text-muted-foreground ml-auto">
              {lyricLines.length} lignes
            </span>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div 
              ref={containerRef}
              className={cn(
                "max-h-80 overflow-y-auto space-y-1 p-4 rounded-lg bg-muted/30",
                dyslexiaMode && "font-['OpenDyslexic',sans-serif]",
                fontSizeClasses[fontSize]
              )}
              role="article"
              aria-label="Paroles"
              tabIndex={0}
            >
              <AnimatePresence mode="sync">
                {lyricLines.map((line, index) => {
                  const isActive = index === activeLineIndex && isPlaying;
                  
                  return (
                    <motion.p
                      key={index}
                      data-line-index={index}
                      initial={{ opacity: 0.8 }}
                      animate={{ 
                        opacity: isActive ? 1 : 0.8,
                        scale: isActive && highlightMode ? 1.02 : 1,
                        backgroundColor: isActive && highlightMode 
                          ? 'hsl(var(--primary) / 0.15)' 
                          : 'transparent'
                      }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onLineClick?.(line, index)}
                      className={cn(
                        "py-1.5 px-2 rounded transition-colors cursor-pointer hover:bg-muted/50",
                        line.isChorus && "font-semibold text-primary pl-4 border-l-2 border-primary",
                        line.isVerse && "text-muted-foreground italic",
                        isActive && highlightMode && "font-medium ring-1 ring-primary/30"
                      )}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`${line.isChorus ? 'Refrain: ' : ''}${line.text}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onLineClick?.(line, index);
                        }
                      }}
                    >
                      {showTimestamps && line.startTime !== undefined && (
                        <span className="text-xs text-muted-foreground mr-2 font-mono">
                          [{Math.floor(line.startTime / 60)}:{String(Math.floor(line.startTime % 60)).padStart(2, '0')}]
                        </span>
                      )}
                      {line.text}
                    </motion.p>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Message d'accessibilité pour lecteurs d'écran */}
            <div className="sr-only" aria-live="polite">
              {isPlaying && activeLineIndex >= 0 && (
                <span>Ligne actuelle : {lyricLines[activeLineIndex]?.text}</span>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SongTranscription;
