import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link, Check, Award, Trophy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  type: 'badge' | 'score' | 'streak' | 'achievement';
  title: string;
  description?: string;
  value?: number | string;
  imageUrl?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  type,
  title,
  description,
  value,
  imageUrl
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getShareText = () => {
    const baseUrl = window.location.origin;
    
    switch (type) {
      case 'badge':
        return `🏆 J'ai débloqué le badge "${title}" sur MED-MNG ! ${description || ''}\n\n${baseUrl}`;
      case 'score':
        return `📊 J'ai obtenu ${value}% au quiz "${title}" sur MED-MNG !\n\n${baseUrl}`;
      case 'streak':
        return `🔥 ${value} jours de série sur MED-MNG ! Je révise mes items EDN chaque jour.\n\n${baseUrl}`;
      case 'achievement':
        return `⭐ Nouvelle réussite : ${title} sur MED-MNG !\n${description || ''}\n\n${baseUrl}`;
      default:
        return `${title} - MED-MNG\n${baseUrl}`;
    }
  };

  const shareText = getShareText();
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(window.location.origin);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MED-MNG - ${title}`,
          text: shareText,
          url: window.location.origin,
        });
        toast({
          title: "Partagé !",
          description: "Contenu partagé avec succès",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copié !",
        description: "Le texte a été copié dans le presse-papier",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'badge':
        return <Award className="h-5 w-5 text-warning" />;
      case 'score':
        return <Trophy className="h-5 w-5 text-success" />;
      case 'streak':
        return <span className="text-lg">🔥</span>;
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            Partager votre réussite
          </DialogTitle>
        </DialogHeader>
        
        {/* Preview */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold">{title}</span>
            {value && (
              <span className="ml-auto text-lg font-bold text-primary">
                {type === 'score' ? `${value}%` : value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          {navigator.share && (
            <Button 
              onClick={handleNativeShare} 
              className="col-span-2 bg-gradient-to-r from-primary to-accent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.open(shareLinks.twitter, '_blank')}
            className="gap-2 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open(shareLinks.facebook, '_blank')}
            className="gap-2 hover:bg-[#4267B2]/10 hover:text-[#4267B2] hover:border-[#4267B2]"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open(shareLinks.linkedin, '_blank')}
            className="gap-2 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
            className="gap-2 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                Copié !
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Copier
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
