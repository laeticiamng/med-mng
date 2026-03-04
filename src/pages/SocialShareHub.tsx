import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateScoreCardImage, useScoreCardDownload, type ScoreCardData } from '@/components/social/ScoreCardCanvas';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Award, Check, Copy, Download, Facebook, Gift, Link2, Linkedin, MessageCircle, Share2, Trophy, Twitter, Users } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const SocialShareHub: React.FC = () => {
  const [userId, setUserId] = useState<string>();
  const [userName, setUserName] = useState('Étudiant');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { progress } = useUserStore();
  const { download, generateImage } = useScoreCardDownload();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserName(data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Étudiant');
      }
    });
  }, []);

  const {
    referralCode,
    shareUrl,
    totalReferrals,
    totalXPEarned,
    referrals,
    trackShare,
  } = useReferralSystem(userId);

  const scoreData: ScoreCardData = {
    userName,
    score: Math.min(100, Math.round((progress.completedItems.length / Math.max(1, progress.completedItems.length + 10)) * 100)),
    totalQuestions: progress.completedItems.length,
    streak: progress.streak,
    level: progress.level,
    rank: progress.level >= 10 ? 'Expert' : progress.level >= 5 ? 'Confirmé' : 'Débutant',
  };

  // Generate preview on mount
  useEffect(() => {
    generateImage(scoreData).then(setPreviewImage);
  }, [scoreData.score, scoreData.streak, scoreData.level]);

  const handleDownload = useCallback(async () => {
    await download(scoreData);
    trackShare({ shareType: 'score_card', platform: 'download' });
    toast.success('Image téléchargée !');
  }, [scoreData, download, trackShare]);

  const shareToSocial = useCallback((platform: string) => {
    const text = `🩺 Mon score MED-MNG : ${scoreData.score}% | Niveau ${scoreData.level} | 🔥 ${scoreData.streak} jours de série ! Rejoins-moi avec mon code ${referralCode}`;
    const url = shareUrl || window.location.origin;
    const encoded = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encoded}%20${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    trackShare({ shareType: 'score_card', platform, contentData: { score: scoreData.score } });
  }, [scoreData, referralCode, shareUrl, trackShare]);

  const copyToClipboard = useCallback(async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text);
    if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    toast.success('Copié !');
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Share2 className="h-8 w-8 text-primary" />
          Partage & Parrainage
        </h1>
        <p className="text-muted-foreground">Partage tes résultats et invite tes amis pour gagner des XP bonus</p>
      </div>

      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="share" className="gap-2"><Trophy className="h-4 w-4" /> Mon score</TabsTrigger>
          <TabsTrigger value="referral" className="gap-2"><Users className="h-4 w-4" /> Parrainage</TabsTrigger>
        </TabsList>

        {/* === SHARE TAB === */}
        <TabsContent value="share" className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Ta carte de score personnalisée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewImage && (
                <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                  <img src={previewImage} alt="Score card" className="w-full" />
                </div>
              )}

              <Button onClick={handleDownload} className="w-full gap-2" size="lg">
                <Download className="h-5 w-5" />
                Télécharger l'image
              </Button>
            </CardContent>
          </Card>

          {/* Social Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Partager sur les réseaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => shareToSocial('twitter')}
                  className="gap-2 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
                  <Twitter className="h-5 w-5" /> Twitter
                </Button>
                <Button variant="outline" onClick={() => shareToSocial('facebook')}
                  className="gap-2 hover:bg-[#4267B2]/10 hover:text-[#4267B2] hover:border-[#4267B2]">
                  <Facebook className="h-5 w-5" /> Facebook
                </Button>
                <Button variant="outline" onClick={() => shareToSocial('linkedin')}
                  className="gap-2 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]">
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </Button>
                <Button variant="outline" onClick={() => shareToSocial('whatsapp')}
                  className="gap-2 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]">
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </Button>
              </div>

              {navigator.share && (
                <Button className="w-full mt-3" onClick={async () => {
                  const dataUrl = await generateImage(scoreData);
                  const blob = await (await fetch(dataUrl)).blob();
                  const file = new File([blob], 'score.png', { type: 'image/png' });
                  try {
                    await navigator.share({ title: 'Mon score MED-MNG', files: [file] });
                    trackShare({ shareType: 'score_card', platform: 'native' });
                  } catch {}
                }}>
                  <Share2 className="h-4 w-4 mr-2" /> Partager...
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === REFERRAL TAB === */}
        <TabsContent value="referral" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-3xl font-bold">{totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Filleuls</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Gift className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-3xl font-bold">{totalXPEarned}</p>
                <p className="text-sm text-muted-foreground">XP gagnés</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-3xl font-bold">500</p>
                <p className="text-sm text-muted-foreground">XP / filleul</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Ton code de parrainage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="text-center text-lg font-mono font-bold tracking-wider" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, 'code')}>
                  {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(shareUrl, 'link')}>
                  {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Comment ça marche ?</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Partage ton code ou lien avec un ami</li>
                  <li>Ton ami s'inscrit avec ton code</li>
                  <li>Tu gagnes <strong className="text-primary">500 XP</strong> et ton ami <strong className="text-primary">200 XP</strong></li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des parrainages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ref.status === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                        <span className="text-sm">{ref.referred_email || 'Utilisateur'}</span>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {ref.status === 'completed' ? `+${ref.xp_awarded_referrer} XP` : 'En attente'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialShareHub;
