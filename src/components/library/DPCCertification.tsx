import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import {
  Award, CheckCircle2, Clock, Download, FileText,
  GraduationCap, Lock, Star, Trophy, Shield
} from 'lucide-react';

interface DPCModule {
  id: string;
  title: string;
  specialty: string;
  hours: number;
  completedHours: number;
  status: 'locked' | 'in_progress' | 'completed' | 'certified';
  completedAt?: Date;
  certificationId?: string;
  objectives: string[];
}

// Static modules — will be replaced by Supabase table when DPC backend is ready
const DPC_MODULES: DPCModule[] = [
  {
    id: 'dpc-1',
    title: 'Prise en charge de l\'insuffisance cardiaque',
    specialty: 'Cardiologie',
    hours: 8,
    completedHours: 8,
    status: 'certified',
    completedAt: new Date('2026-02-15'),
    certificationId: 'DPC-2026-CARD-00142',
    objectives: ['Diagnostic IC', 'Traitement pharmacologique', 'Suivi du patient'],
  },
  {
    id: 'dpc-2',
    title: 'Antibiothérapie raisonnée',
    specialty: 'Pharmacologie',
    hours: 6,
    completedHours: 6,
    status: 'completed',
    completedAt: new Date('2026-02-28'),
    objectives: ['Spectre antibiotique', 'Résistances bactériennes', 'Protocoles de désescalade'],
  },
  {
    id: 'dpc-3',
    title: 'Urgences neurologiques',
    specialty: 'Neurologie',
    hours: 10,
    completedHours: 7,
    status: 'in_progress',
    objectives: ['AVC ischémique', 'Crises comitiales', 'Coma et troubles de conscience'],
  },
  {
    id: 'dpc-4',
    title: 'Chirurgie ambulatoire : bonnes pratiques',
    specialty: 'Chirurgie',
    hours: 5,
    completedHours: 0,
    status: 'locked',
    objectives: ['Critères d\'éligibilité', 'Gestion de la douleur', 'Suivi post-opératoire'],
  },
  {
    id: 'dpc-5',
    title: 'Vaccination et immunologie pratique',
    specialty: 'Immunologie',
    hours: 4,
    completedHours: 4,
    status: 'completed',
    completedAt: new Date('2026-01-20'),
    objectives: ['Calendrier vaccinal', 'Immunodéficiences', 'Réactions allergiques'],
  },
  {
    id: 'dpc-6',
    title: 'Pédiatrie : pathologies courantes en ville',
    specialty: 'Pédiatrie',
    hours: 7,
    completedHours: 3,
    status: 'in_progress',
    objectives: ['Bronchiolite', 'Gastro-entérite', 'Otites et angines'],
  },
];

const getStatusConfig = (status: DPCModule['status']) => {
  switch (status) {
    case 'certified': return { icon: Award, color: 'text-primary', bg: 'bg-primary/10', label: 'Certifié', badgeVariant: 'default' as const };
    case 'completed': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Terminé', badgeVariant: 'secondary' as const };
    case 'in_progress': return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'En cours', badgeVariant: 'outline' as const };
    case 'locked': return { icon: Lock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Verrouillé', badgeVariant: 'outline' as const };
  }
};

function generatePDF(module: DPCModule) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ATTESTATION DPC', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Développement Professionnel Continu', pageWidth / 2, 35, { align: 'center' });

  // Body
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  let y = 70;

  doc.text('Certifie que le participant a suivi avec succès :', 20, y);
  y += 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(module.title, pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 40 });
  y += 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const details = [
    `Spécialité : ${module.specialty}`,
    `Durée : ${module.hours} heures`,
    `Date de certification : ${module.completedAt?.toLocaleDateString('fr-FR') || '—'}`,
    `Identifiant : ${module.certificationId || 'N/A'}`,
  ];

  details.forEach(line => {
    doc.text(line, 20, y);
    y += 10;
  });

  y += 10;
  doc.text('Objectifs pédagogiques validés :', 20, y);
  y += 8;
  module.objectives.forEach((obj, i) => {
    doc.text(`  ${i + 1}. ${obj}`, 25, y);
    y += 8;
  });

  // Footer
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Ce document est généré par la plateforme Med&Mng.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y + 8, { align: 'center' });

  // Decorative border
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(2);
  doc.rect(10, 55, pageWidth - 20, y - 35);

  doc.save(`attestation-dpc-${module.id}.pdf`);
}

export const DPCCertification = () => {
  const { toast } = useToast();
  const [modules] = useState<DPCModule[]>(DPC_MODULES);

  const totalHours = modules.reduce((sum, m) => sum + m.hours, 0);
  const completedHours = modules.reduce((sum, m) => sum + m.completedHours, 0);
  const certifiedCount = modules.filter(m => m.status === 'certified').length;
  const completedCount = modules.filter(m => m.status === 'completed' || m.status === 'certified').length;

  const downloadCertificate = (module: DPCModule) => {
    try {
      generatePDF(module);
      toast({
        title: '📄 Certificat téléchargé',
        description: `Attestation DPC « ${module.title} » — ${module.certificationId || 'N/A'}`,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF. Réessayez.',
        variant: 'destructive',
      });
    }
  };

  const generateCertificate = (module: DPCModule) => {
    try {
      const certId = `DPC-${new Date().getFullYear()}-${module.specialty.substring(0, 4).toUpperCase()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      const updatedModule = { ...module, certificationId: certId, completedAt: new Date(), status: 'certified' as const };
      generatePDF(updatedModule);
      toast({
        title: '🏅 Certificat généré !',
        description: `Votre attestation DPC pour « ${module.title} » a été téléchargée.`,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le certificat.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Certification DPC
        </h2>
        <p className="text-muted-foreground">
          Suivi de votre Développement Professionnel Continu
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{certifiedCount}</p>
            <p className="text-xs text-muted-foreground">Certifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{completedCount}/{modules.length}</p>
            <p className="text-xs text-muted-foreground">Modules terminés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{completedHours}h</p>
            <p className="text-xs text-muted-foreground">/ {totalHours}h formation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto text-warning mb-1" />
            <p className="text-2xl font-bold">{Math.round((completedHours / totalHours) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Progression globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Global progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale DPC</span>
            <span className="text-sm text-muted-foreground">{completedHours}/{totalHours}h</span>
          </div>
          <Progress value={(completedHours / totalHours) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Module cards */}
      <div className="space-y-4">
        {modules.map(module => {
          const statusConfig = getStatusConfig(module.status);
          const StatusIcon = statusConfig.icon;
          const progress = (module.completedHours / module.hours) * 100;

          return (
            <Card key={module.id} className={`transition-shadow hover:shadow-md ${module.status === 'locked' ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${statusConfig.bg} shrink-0`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{module.specialty}</Badge>
                          <Badge variant={statusConfig.badgeVariant} className="text-xs">{statusConfig.label}</Badge>
                          <span className="text-xs text-muted-foreground">{module.hours}h de formation</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 ml-11">
                      {module.objectives.map((obj, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-normal">{obj}</Badge>
                      ))}
                    </div>

                    {module.status !== 'locked' && (
                      <div className="ml-11">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{module.completedHours}/{module.hours}h complétées</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48 shrink-0">
                    {module.status === 'certified' && (
                      <>
                        <Button size="sm" className="gap-2" onClick={() => downloadCertificate(module)}>
                          <Download className="h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Shield className="h-3 w-3" />
                            {module.certificationId}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {module.completedAt?.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </>
                    )}
                    {module.status === 'completed' && (
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => generateCertificate(module)}>
                        <FileText className="h-4 w-4" />
                        Générer le certificat
                      </Button>
                    )}
                    {module.status === 'in_progress' && (
                      <Button size="sm" variant="outline" className="gap-2" disabled>
                        <GraduationCap className="h-4 w-4" />
                        En cours…
                      </Button>
                    )}
                    {module.status === 'locked' && (
                      <Button size="sm" variant="ghost" disabled className="gap-2">
                        <Lock className="h-4 w-4" />
                        Prérequis manquants
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
