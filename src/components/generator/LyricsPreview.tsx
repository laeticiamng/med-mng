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

  return (
    <PremiumCard variant="glass" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-foreground">
            {title || 'Paroles'}
          </span>
          {rang && (
            <Badge variant="outline" className="text-xs">
              Rang {rang}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {lineCount} lignes
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div 
        className={`text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 ${
          isExpanded ? 'max-h-[300px] overflow-y-auto' : 'max-h-[100px] overflow-hidden'
        }`}
      >
        {isExpanded ? lyricsText : previewLines}
        {!isExpanded && hasMore && (
          <span className="text-primary">...</span>
        )}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 h-8"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Voir tout ({lineCount} lignes)
            </>
          )}
        </Button>
      )}
    </PremiumCard>
  );
};
