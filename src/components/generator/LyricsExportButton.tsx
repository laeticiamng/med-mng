/**
 * Bouton d'export des paroles
 * ✅ NOUVEAU: Export en texte, copie dans le presse-papier
 */

import React, { useState, useCallback } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { TranslatedText } from '@/components/TranslatedText';

interface LyricsExportButtonProps {
  lyrics: string | string[];
  title?: string;
  rang?: string;
  style?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

export const LyricsExportButton: React.FC<LyricsExportButtonProps> = ({
  lyrics,
  title = 'Paroles',
  rang,
  style,
  size = 'sm',
  variant = 'ghost'
}) => {
  const [copied, setCopied] = useState(false);

  // Formater les paroles en texte
  const formatLyrics = useCallback((): string => {
    const lyricsText = Array.isArray(lyrics) ? lyrics.join('\n\n') : lyrics;
    
    let header = `📝 ${title}`;
    if (rang) header += ` - Rang ${rang}`;
    if (style) header += ` - ${style}`;
    header += '\n' + '─'.repeat(40) + '\n\n';
    
    return header + lyricsText;
  }, [lyrics, title, rang, style]);

  // Copier dans le presse-papier
  const handleCopy = useCallback(async () => {
    try {
      const text = formatLyrics();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Paroles copiées !');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  }, [formatLyrics]);

  // Télécharger en fichier texte
  const handleDownloadTxt = useCallback(() => {
    const text = formatLyrics();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_paroles.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Fichier téléchargé !');
  }, [formatLyrics, title]);

  // Version courte : juste le bouton copier
  if (size === 'icon') {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleCopy}
        className="h-8 w-8"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          <TranslatedText text="Exporter" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          <TranslatedText text="Copier les paroles" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadTxt}>
          <Download className="h-4 w-4 mr-2" />
          <TranslatedText text="Télécharger (.txt)" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
