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
  /** Durée estimée de la chanson (déjà formatée, ex. « ≈ 3 min 51 »). */
  dureeAffichee?: string;
  /** Vrai si les paroles dépassent la limite du service et seront réellement coupées. */
  tronque?: boolean;
  lignesRetirees?: number;
  /** Emplacement pour un bouton d'export, affiché discrètement à côté de « Copier ». */
  exportSlot?: React.ReactNode;
}

export const LyricsPreview: React.FC<LyricsPreviewProps> = ({
  lyrics,
  title,
  rang,
  className = '',
  dureeAffichee,
  tronque = false,
  lignesRetirees,
  exportSlot,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const lyricsText = Array.isArray(lyrics) ? lyrics.join('\n') : lyrics;
  const lineCount = lyricsText.split('\n').filter((l) => l.trim()).length;
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
          {dureeAffichee && (
            <Badge
              variant="secondary"
              className="text-xs"
              aria-label={`Durée estimée ${dureeAffichee}`}
            >
              🎵 {dureeAffichee}
            </Badge>
          )}
          {tronque && (
            <Badge
              variant="outline"
              className="text-xs border-warning text-warning"
              role="alert"
            >
              {lignesRetirees
                ? `${lignesRetirees} dernière${lignesRetirees > 1 ? 's' : ''} ligne${lignesRetirees > 1 ? 's' : ''} ne seront pas chantées`
                : 'Paroles raccourcies'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {exportSlot}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
            aria-label={copied ? 'Paroles copiées' : 'Copier les paroles'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={`text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 ${
          isExpanded
            ? 'max-h-[300px] overflow-y-auto'
            : 'max-h-[100px] overflow-hidden'
        }`}
        role="textbox"
        aria-readonly="true"
        aria-multiline="true"
        aria-label="Contenu des paroles"
        tabIndex={0}
      >
        {isExpanded ? lyricsText : previewLines}
        {!isExpanded && hasMore && (
          <span className="text-primary" aria-hidden="true">
            ...
          </span>
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
