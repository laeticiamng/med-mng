import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExportOptions {
  includeStats: boolean;
  includeStreak: boolean;
  includeBadges: boolean;
  includeActivityLog: boolean;
  includeMasteryGrid: boolean;
  period: '7days' | '30days' | '90days' | 'all';
}

interface ProgressExportProps {
  userId: string;
  stats?: {
    totalPoints: number;
    currentStreak: number;
    level: number;
    badges: { name: string; icon: string; unlockedAt?: string }[];
  };
}

export function ProgressExport({ userId, stats }: ProgressExportProps) {
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeStats: true,
    includeStreak: true,
    includeBadges: true,
    includeActivityLog: true,
    includeMasteryGrid: false,
    period: '30days',
  });
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (userId) {
      logActivity({ activity_type: 'study', metadata: { action: 'view_progress_export' } });
    }
  }, [userId, logActivity]);

  const generatePDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text('Rapport de Progression EDN', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      })}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Stats summary
      if (options.includeStats && stats) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Statistiques Générales', 20, yPos);
        yPos += 10;

        autoTable(doc, {
          startY: yPos,
          head: [['Métrique', 'Valeur']],
          body: [
            ['Points Totaux', stats.totalPoints.toLocaleString()],
            ['Niveau', `Niveau ${stats.level}`],
            ['Streak Actuel', `${stats.currentStreak} jours`],
            ['Badges Débloqués', `${stats.badges.length}`],
          ],
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Badges
      if (options.includeBadges && stats && stats.badges.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Badges Débloqués', 20, yPos);
        yPos += 10;

        autoTable(doc, {
          startY: yPos,
          head: [['Badge', 'Date d\'obtention']],
          body: stats.badges.map(b => [
            `${b.icon} ${b.name}`,
            b.unlockedAt ? new Date(b.unlockedAt).toLocaleDateString('fr-FR') : '-',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Activity log
      if (options.includeActivityLog) {
        const periodDays = options.period === '7days' ? 7 : 
                          options.period === '30days' ? 30 : 
                          options.period === '90days' ? 90 : 365;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const { data: activities } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', userId)
          .gte('activity_date', startDate.toISOString().split('T')[0])
          .order('activity_date', { ascending: false })
          .limit(100);

        if (activities && activities.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text('Historique d\'Activité', 20, yPos);
          yPos += 10;

          const activitySummary = activities.reduce((acc, a) => {
            acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          autoTable(doc, {
            startY: yPos,
            head: [['Type d\'Activité', 'Nombre']],
            body: Object.entries(activitySummary).map(([type, count]) => [
              type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              count.toString(),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
          });
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} sur ${pageCount} - MED-MNG EDN Preparation`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      doc.save(`progression-edn-${new Date().toISOString().split('T')[0]}.pdf`);
      logActivity({ activity_type: 'study', metadata: { action: 'export_progress_pdf' } });
      toast({ title: 'Export réussi', description: 'Votre rapport PDF a été téléchargé.' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Erreur', description: 'Impossible de générer le PDF.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const shareProgress = async () => {
    if (!stats) return;

    const shareText = `🏆 Ma progression EDN\n\n` +
      `📊 ${stats.totalPoints.toLocaleString()} points\n` +
      `⭐ Niveau ${stats.level}\n` +
      `🔥 ${stats.currentStreak} jours consécutifs\n` +
      `🎖️ ${stats.badges.length} badges\n\n` +
      `#EDN #Médecine #Révisions`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ma progression EDN', text: shareText });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: 'Copié !', description: 'Texte copié dans le presse-papier.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exporter ma Progression
        </CardTitle>
        <CardDescription>
          Téléchargez un rapport PDF ou partagez vos stats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Période</Label>
          <Select value={options.period} onValueChange={(v: any) => setOptions({ ...options, period: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
              <SelectItem value="all">Tout l'historique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Inclure dans le rapport</Label>
          {[
            { key: 'includeStats', label: 'Statistiques générales' },
            { key: 'includeStreak', label: 'Streak et progression' },
            { key: 'includeBadges', label: 'Badges débloqués' },
            { key: 'includeActivityLog', label: 'Historique d\'activité' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={options[key as keyof ExportOptions] as boolean}
                onCheckedChange={(checked) => setOptions({ ...options, [key]: checked })}
              />
              <label htmlFor={key} className="text-sm cursor-pointer">{label}</label>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={generatePDF} disabled={exporting} className="flex-1 gap-2">
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Télécharger PDF
              </>
            )}
          </Button>
          <Button onClick={shareProgress} variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
