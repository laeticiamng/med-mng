import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LyricsPreviewProps {
  lyrics: string[] | string;
  title?: string;
  rang?: string;
  className?: string;
}

export const LyricsPreview: React.FC<LyricsPreviewProps> = ({
  lyrics,
  title,
  rang,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const lyricsText = Array.isArray(lyrics) ? lyrics.join('\n') : lyrics;
  const lineCount = lyricsText.split('\n').filter(l => l.trim()).length;
  const previewLines = lyricsText.split('\n').slice(0, 4).join('\n');
  const hasMore = lineCount > 4;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lyricsText);
      setCopied(true);
      toast.success('Paroles copiées');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur de copie');
    }
  };

  if (!lyricsText || lyricsText.trim() === '') {
    return null;
  }

  // Compteurs de caractères et mots
  const charCount = lyricsText.length;
  const wordCount = lyricsText.split(/\s+/).filter(w => w.trim()).length;
  
  // Avertissement si trop long pour Suno (max ~3000 chars)
  const isOverLimit = charCount > 3000;
  const isNearLimit = charCount > 2500 && charCount <= 3000;

  return (
    <PremiumCard 
      variant="glass" 
      className={`p-4 ${className}`}
      role="region"
      aria-label={`Aperçu des paroles${title ? ` - ${title}` : ''}`}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Music className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-medium text-sm text-foreground">
            {title || 'Paroles'}
          </span>
          {rang && (
            <Badge variant="outline" className="text-xs">
              Rang {rang}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs" aria-label={`${lineCount} lignes`}>
            {lineCount} lignes
          </Badge>
          <Badge 
            variant={isOverLimit ? "destructive" : isNearLimit ? "outline" : "secondary"} 
            className={`text-xs ${isNearLimit && !isOverLimit ? 'border-warning text-warning' : ''}`}
            aria-label={`${charCount} caractères, ${wordCount} mots`}
          >
            {charCount} car. / {wordCount} mots
          </Badge>
          {isOverLimit && (
            <Badge variant="destructive" className="text-xs" role="alert">
              ⚠️ Trop long (max 3000)
            </Badge>
          )}
          {isNearLimit && !isOverLimit && (
            <Badge variant="outline" className="text-xs border-warning text-warning">
              ⚠️ Proche limite
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
          aria-label={copied ? "Paroles copiées" : "Copier les paroles"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div 
        className={`text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 ${
          isExpanded ? 'max-h-[300px] overflow-y-auto' : 'max-h-[100px] overflow-hidden'
        }`}
        role="textbox"
        aria-readonly="true"
        aria-multiline="true"
        aria-label="Contenu des paroles"
        tabIndex={0}
      >
        {isExpanded ? lyricsText : previewLines}
        {!isExpanded && hasMore && (
          <span className="text-primary" aria-hidden="true">...</span>
        )}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 h-8"
          aria-expanded={isExpanded}
          aria-controls="lyrics-content"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" aria-hidden="true" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" aria-hidden="true" />
              Voir tout ({lineCount} lignes)
            </>
          )}
        </Button>
      )}
    </PremiumCard>
  );
};
