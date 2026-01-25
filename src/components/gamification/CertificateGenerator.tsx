import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Award,
    Calendar,
    CheckCircle,
    Download,
    GraduationCap,
    Loader2,
    Medal,
    Share2,
    Sparkles,
    Star,
    Trophy
} from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  type: 'completion' | 'achievement' | 'mastery' | 'specialty';
  earnedAt: string;
  itemCode?: string;
  specialty?: string;
  score?: number;
  rank?: 'A' | 'B' | 'AB';
  verified: boolean;
  shareUrl?: string;
}

interface CertificateGeneratorProps {
  userId?: string;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ userId }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [userName, setUserName] = useState('Étudiant');
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    loadCertificates();
    loadUserName();
  }, [userId]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Charger les badges de l'utilisateur comme certificats
      const { _data: userBadges, _error } = await supabase
        .from('user_badges')
        .select('*, badge:badge_id(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (_error) throw _error;

      // Mapper les badges vers des certificats
      const mappedCertificates: Certificate[] = (userBadges || []).map((ub: any) => ({
        id: ub.id,
        title: ub.badge?.name || 'Certificat',
        description: ub.badge?.description || 'Accomplissement débloqué',
        type: getCertificateType(ub.badge?.category),
        earnedAt: ub.earned_at,
        specialty: ub.badge?.category,
        verified: true
      }));

      setCertificates(mappedCertificates);
    } catch (error) {
      console.error('Erreur chargement certificats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateType = (category?: string): Certificate['type'] => {
    switch (category) {
      case 'mastery': return 'mastery';
      case 'learning': return 'completion';
      case 'special': return 'achievement';
      default: return 'specialty';
    }
  };

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    } catch (error) {
      console.error('Erreur chargement nom:', error);
    }
  };

  const getCertificateIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'mastery': return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'completion': return <CheckCircle className="h-8 w-8 text-success" />;
      case 'achievement': return <Star className="h-8 w-8 text-primary" />;
      case 'specialty': return <GraduationCap className="h-8 w-8 text-accent" />;
      default: return <Award className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getCertificateColor = (type: Certificate['type']) => {
    switch (type) {
      case 'mastery': return 'from-yellow-500/20 via-amber-500/10 to-yellow-500/20';
      case 'completion': return 'from-green-500/20 via-emerald-500/10 to-green-500/20';
      case 'achievement': return 'from-blue-500/20 via-indigo-500/10 to-blue-500/20';
      case 'specialty': return 'from-purple-500/20 via-violet-500/10 to-purple-500/20';
      default: return 'from-gray-500/20 via-slate-500/10 to-gray-500/20';
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    if (!certificateRef.current) return;
    
    setGenerating(true);
    setSelectedCertificate(certificate);

    // Attendre que le certificat soit rendu
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificat-${certificate.id}.pdf`);

      toast({
        title: 'Certificat téléchargé !',
        description: 'Le PDF a été enregistré dans vos téléchargements.'
      });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le certificat.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const shareCertificate = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/certificate/${certificate.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate.title,
          text: `J'ai obtenu le certificat "${certificate.title}" sur MED-MNG !`,
          url: shareUrl
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erreur partage:', error);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Lien copié !',
        description: 'Le lien du certificat a été copié dans le presse-papier.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Mes Certificats
          </h2>
          <p className="text-muted-foreground">
            Téléchargez et partagez vos accomplissements
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Medal className="h-4 w-4" />
          {certificates.length} certificats
        </Badge>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun certificat pour le moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complétez des items et débloquez des achievements pour obtenir des certificats !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden bg-gradient-to-r ${getCertificateColor(certificate.type)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCertificateIcon(certificate.type)}
                      <div>
                        <CardTitle className="text-lg">{certificate.title}</CardTitle>
                        <CardDescription>{certificate.description}</CardDescription>
                      </div>
                    </div>
                    {certificate.verified && (
                      <Badge variant="outline" className="gap-1 bg-background/50">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Details */}
                  <div className="flex flex-wrap gap-2">
                    {certificate.score && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Score: {certificate.score}%
                      </Badge>
                    )}
                    {certificate.specialty && (
                      <Badge variant="secondary">
                        {certificate.specialty}
                      </Badge>
                    )}
                    {certificate.itemCode && (
                      <Badge variant="secondary">
                        {certificate.itemCode}
                      </Badge>
                    )}
                    {certificate.rank && (
                      <Badge variant="outline">
                        Rang {certificate.rank}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Obtenu le {formatDate(certificate.earnedAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadCertificate(certificate)}
                      disabled={generating}
                    >
                      {generating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => shareCertificate(certificate)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate Template (Hidden for PDF generation) */}
      <div className="fixed left-[-9999px] top-0">
        <div
          ref={certificateRef}
          className="w-[1100px] h-[800px] bg-white p-12 relative overflow-hidden"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {selectedCertificate && (
            <>
              {/* Decorative Border */}
              <div className="absolute inset-4 border-4 border-primary/30 rounded-lg" />
              <div className="absolute inset-6 border-2 border-primary/20 rounded-lg" />

              {/* Corner Decorations */}
              <Sparkles className="absolute top-8 left-8 h-12 w-12 text-primary/30" />
              <Sparkles className="absolute top-8 right-8 h-12 w-12 text-primary/30" />
              <Sparkles className="absolute bottom-8 left-8 h-12 w-12 text-primary/30" />
              <Sparkles className="absolute bottom-8 right-8 h-12 w-12 text-primary/30" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                <div className="mb-6">
                  <Trophy className="h-20 w-20 text-primary mx-auto" />
                </div>

                <h1 className="text-4xl font-bold text-primary mb-4">
                  CERTIFICAT
                </h1>
                
                <p className="text-lg text-gray-600 mb-6">
                  Ce certificat est décerné à
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mb-6 px-8 py-3 border-b-2 border-t-2 border-primary/30">
                  {userName}
                </h2>

                <p className="text-lg text-gray-600 mb-4">
                  pour avoir obtenu
                </p>

                <h3 className="text-2xl font-semibold text-primary mb-4">
                  {selectedCertificate.title}
                </h3>

                <p className="text-gray-600 mb-8 max-w-lg">
                  {selectedCertificate.description}
                </p>

                {selectedCertificate.score && (
                  <div className="mb-8">
                    <Badge className="text-lg px-4 py-2">
                      Score: {selectedCertificate.score}%
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-4 text-gray-500">
                  <span>Délivré le {formatDate(selectedCertificate.earnedAt)}</span>
                  <span>•</span>
                  <span>MED-MNG Platform</span>
                </div>

                {selectedCertificate.verified && (
                  <div className="absolute bottom-16 right-16 flex items-center gap-2 text-success">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">Vérifié</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
