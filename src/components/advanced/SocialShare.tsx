import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, Copy, Link, MessageCircle, Mail,
  Facebook, Twitter, Linkedin, QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  hashtags?: string[];
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  title,
  description,
  url = window.location.href,
  image,
  hashtags = [],
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Contenu partagé",
          description: "Le contenu a été partagé avec succès",
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback - show share options
      setIsOpen(!isOpen);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const shareOnPlatform = (platform: string) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedUrl = encodeURIComponent(url);
    const hashtagsStr = hashtags.map(tag => `%23${tag}`).join('%20');

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}%20${encodedDescription}&url=${encodedUrl}&hashtags=${hashtags.join(',')}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedDescription}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const generateQRCode = async () => {
    setShowQR(true);
    // Dans un vrai projet, vous utiliseriez une bibliothèque QR code
    toast({
      title: "QR Code généré",
      description: "Le QR Code a été généré pour ce contenu",
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal de partage */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Partager
      </Button>

      {/* Options de partage étendues */}
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 z-50 w-72 shadow-lg">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Partager ce contenu</h4>
            
            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier le lien
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateQRCode}
                className="flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </div>

            {/* Plateformes sociales */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Partager sur :</p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="justify-start bg-success/10 hover:bg-success/20 text-success"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('email')}
                  className="justify-start bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('twitter')}
                  className="justify-start bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('linkedin')}
                  className="justify-start bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('facebook')}
                  className="justify-start bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareOnPlatform('telegram')}
                  className="justify-start bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
              </div>
            </div>

            {/* Hashtags suggérés */}
            {hashtags.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Hashtags :</p>
                <div className="flex flex-wrap gap-1">
                  {hashtags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80"
                      onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full mt-4"
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal (simulé) */}
      {showQR && (
        <Card className="absolute top-full left-0 mt-2 z-50 w-64 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="w-32 h-32 bg-muted mx-auto mb-3 rounded flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Scannez ce QR code pour accéder au contenu
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(false)}
              className="w-full"
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Composant pour statistiques de partage
export const ShareStats: React.FC<{
  shares: Record<string, number>;
  className?: string;
}> = ({ shares, className = '' }) => {
  const total = Object.values(shares).reduce((a, b) => a + b, 0);

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4" />
        <span className="font-medium">{total} partages</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
        {Object.entries(shares).map(([platform, count]) => (
          <div key={platform} className="flex justify-between">
            <span className="capitalize">{platform}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook pour tracker les partages
export const useShareTracking = () => {
  const [shares, setShares] = useState<Record<string, number>>({});

  const trackShare = async (platform: string) => {
    setShares(prev => ({
      ...prev,
      [platform]: (prev[platform] || 0) + 1
    }));

    // Sauvegarder dans Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('share_stats').insert({
        user_id: user.id,
        platform
      });
    }
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await (supabase as any)
        .from('share_stats')
        .select('platform')
        .eq('user_id', user.id);
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((d: any) => {
          counts[d.platform] = (counts[d.platform] || 0) + 1;
        });
        setShares(counts);
      }
    }
  };

  const resetStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('share_stats').delete().eq('user_id', user.id);
    }
    setShares({});
  };

  const getTotalShares = () => Object.values(shares).reduce((a, b) => a + b, 0);

  const getMostSharedPlatform = (): string | null => {
    if (Object.keys(shares).length === 0) return null;
    return Object.entries(shares).sort((a, b) => b[1] - a[1])[0][0];
  };

  return {
    shares,
    trackShare,
    loadStats,
    resetStats,
    getTotalShares,
    getMostSharedPlatform
  };
};

// Composant bouton de partage compact
export const CompactShareButton: React.FC<{
  url: string;
  title: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp';
  onShare?: () => void;
}> = ({ url, title, platform, onShare }) => {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
  };

  const icons = {
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    whatsapp: MessageCircle
  };

  const Icon = icons[platform];

  const handleClick = () => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    onShare?.();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <Icon className="w-4 h-4" />
    </Button>
  );
};

// Composant pour partage rapide en ligne
export const InlineShare: React.FC<{
  url: string;
  title: string;
  platforms?: Array<'twitter' | 'facebook' | 'linkedin' | 'whatsapp'>;
}> = ({
  url,
  title,
  platforms = ['twitter', 'facebook', 'linkedin', 'whatsapp']
}) => {
  const { trackShare } = useShareTracking();

  return (
    <div className="flex items-center gap-1">
      {platforms.map(platform => (
        <CompactShareButton
          key={platform}
          url={url}
          title={title}
          platform={platform}
          onShare={() => trackShare(platform)}
        />
      ))}
    </div>
  );
};