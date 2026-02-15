import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SRSStats {
  dueToday: number;
  newItems: number;
  learningItems: number;
  masteredItems: number;
  totalReviews: number;
  averageRetention: number;
  streak: number;
  totalStudyTime: number; // in minutes
  reviewHistory?: Array<{
    date: string;
    reviewed: number;
    correct: number;
  }>;
}

interface SRSStatsExportProps {
  stats: SRSStats;
  userName?: string;
}

export const SRSStatsExport = ({ stats, userName }: SRSStatsExportProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Header
      pdf.setFillColor(139, 92, 246); // Purple gradient
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MED-MNG', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Statistiques de révision SRS', margin, 35);

      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }), pageWidth - margin - 40, 25);
      
      if (userName) {
        pdf.text(userName, pageWidth - margin - 40, 35);
      }

      yPos = 60;

      // Overview Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vue d\'ensemble', margin, yPos);
      yPos += 15;

      // Stats grid
      const gridItems = [
        { label: 'À réviser', value: stats.dueToday.toString(), color: [239, 68, 68] },
        { label: 'Nouveaux', value: stats.newItems.toString(), color: [59, 130, 246] },
        { label: 'En cours', value: stats.learningItems.toString(), color: [234, 179, 8] },
        { label: 'Maîtrisés', value: stats.masteredItems.toString(), color: [34, 197, 94] },
      ];

      const boxWidth = (pageWidth - 2 * margin - 30) / 4;
      const boxHeight = 35;

      gridItems.forEach((item, index) => {
        const x = margin + index * (boxWidth + 10);
        
        pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
        pdf.roundedRect(x, yPos, boxWidth, boxHeight, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, x + boxWidth / 2, yPos + 18, { align: 'center' });
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label, x + boxWidth / 2, yPos + 28, { align: 'center' });
      });

      yPos += boxHeight + 20;

      // Performance metrics
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Métriques de performance', margin, yPos);
      yPos += 12;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const metrics = [
        { icon: '📊', label: 'Rétention moyenne', value: `${stats.averageRetention}%` },
        { icon: '🔥', label: 'Streak actuel', value: `${stats.streak} jours` },
        { icon: '⏱', label: 'Temps d\'étude total', value: `${Math.floor(stats.totalStudyTime / 60)}h ${stats.totalStudyTime % 60}min` },
        { icon: '📚', label: 'Révisions totales', value: stats.totalReviews.toString() },
      ];

      metrics.forEach((metric, index) => {
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F');
        
        pdf.setTextColor(60, 60, 60);
        pdf.text(`${metric.icon} ${metric.label}`, margin + 5, yPos + 8);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(metric.value, pageWidth - margin - 5, yPos + 8, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        
        yPos += 16;
      });

      yPos += 10;

      // Retention gauge
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Taux de rétention', margin, yPos);
      yPos += 10;

      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 3, 3, 'F');
      
      const retentionColor = stats.averageRetention >= 80 ? [34, 197, 94] : 
                            stats.averageRetention >= 60 ? [234, 179, 8] : [239, 68, 68];
      const retentionWidth = ((pageWidth - 2 * margin) * stats.averageRetention) / 100;
      
      pdf.setFillColor(retentionColor[0], retentionColor[1], retentionColor[2]);
      pdf.roundedRect(margin, yPos, retentionWidth, 15, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      if (retentionWidth > 30) {
        pdf.text(`${stats.averageRetention}%`, margin + retentionWidth / 2, yPos + 10, { align: 'center' });
      }

      yPos += 30;

      // Study recommendations
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommandations', margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const recommendations = [];
      
      if (stats.dueToday > 20) {
        recommendations.push('⚠️ Vous avez beaucoup d\'items en retard. Priorisez vos révisions quotidiennes.');
      }
      if (stats.averageRetention < 70) {
        recommendations.push('📉 Votre rétention est en dessous de 70%. Réduisez les nouveaux items.');
      }
      if (stats.streak >= 7) {
        recommendations.push('🎉 Excellent streak ! Continuez ainsi pour maximiser votre rétention.');
      }
      if (stats.masteredItems > stats.learningItems * 2) {
        recommendations.push('⭐ Beaucoup d\'items maîtrisés. Vous pouvez ajouter de nouveaux contenus.');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('✅ Vos statistiques sont bonnes. Maintenez votre rythme de révision.');
      }

      recommendations.forEach((rec, index) => {
        const splitText = pdf.splitTextToSize(rec, pageWidth - 2 * margin - 10);
        pdf.text(splitText, margin + 5, yPos + 5);
        yPos += splitText.length * 6 + 8;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `MED-MNG - Statistiques SRS | Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      );

      // Save
      const fileName = `srs-stats-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "✅ PDF généré",
        description: "Vos statistiques ont été exportées",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ['Métrique', 'Valeur'],
      ['À réviser aujourd\'hui', stats.dueToday.toString()],
      ['Nouveaux items', stats.newItems.toString()],
      ['En apprentissage', stats.learningItems.toString()],
      ['Maîtrisés', stats.masteredItems.toString()],
      ['Révisions totales', stats.totalReviews.toString()],
      ['Rétention moyenne (%)', stats.averageRetention.toString()],
      ['Streak (jours)', stats.streak.toString()],
      ['Temps d\'étude (min)', stats.totalStudyTime.toString()],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `srs-stats-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "✅ CSV exporté",
      description: "Le fichier a été téléchargé",
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Exporter les statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button 
          onClick={generatePDF} 
          disabled={isGenerating}
          className="flex-1 gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PDF
        </Button>
        <Button 
          onClick={exportCSV} 
          variant="outline"
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          CSV
        </Button>
      </CardContent>
    </Card>
  );
};
