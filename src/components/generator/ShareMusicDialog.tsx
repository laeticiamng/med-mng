/**
 * Dialog pour partager une musique générée
 * Génère un lien de partage et permet partage social
 */

import { TranslatedText } from '@/components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, Copy, Facebook, Link2, Linkedin, Mail, Share2, Twitter } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ShareMusicDialogProps {
  trackTitle: string;
  trackId: string;
  _audioUrl?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ShareMusicDialog: React.FC<ShareMusicDialogProps> = ({
  trackTitle,
  trackId,
  _audioUrl,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Support both controlled and uncontrolled modes
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (externalOnOpenChange || (() => {})) : setInternalOpen;

  // Générer l'URL de partage
  const shareUrl = `${window.location.origin}/shared-music/${trackId}`;
  const shareText = `🎵 Écoutez "${trackTitle}" - Créé avec MED MNG`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  }, [shareUrl]);

  const shareToTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }, [shareText, shareUrl]);

  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }, [shareText, shareUrl]);

  const shareToLinkedin = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }, [shareUrl]);

  const shareByEmail = useCallback(() => {
    const subject = encodeURIComponent(`Écoutez: ${trackTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [trackTitle, shareText, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trackTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Erreur partage:', err);
        }
      }
    }
  }, [trackTitle, shareText, shareUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            <TranslatedText text="Partager" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <TranslatedText text="Partager cette musique" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Titre du track */}
          <p className="text-sm text-muted-foreground">
            "{trackTitle}"
          </p>
          
          {/* Lien de partage */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={shareUrl}
                readOnly
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={handleCopy} size="icon" variant="outline">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Boutons de partage social */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={shareToTwitter}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Twitter className="h-5 w-5" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={shareToFacebook}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Facebook className="h-5 w-5" />
              <span className="text-xs">Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={shareToLinkedin}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Linkedin className="h-5 w-5" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={shareByEmail}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
          
          {/* Partage natif (mobile) */}
          {'share' in navigator && (
            <Button onClick={handleNativeShare} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              <TranslatedText text="Partager..." />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
