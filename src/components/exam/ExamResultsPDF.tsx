import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Download, FileText, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  duration: number; // in seconds
  examType: string;
  specialty?: string;
  difficulty?: string;
  completedAt: Date;
  weakTopics?: Array<{ itemCode: string; title: string; errorRate: number }>;
}

interface ExamResultsPDFProps {
  result: ExamResult;
  userName?: string;
}

export const ExamResultsPDF = ({ result, userName }: ExamResultsPDFProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Header with gradient effect (simulated with colored rectangles)
      pdf.setFillColor(59, 130, 246); // Primary blue
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MED-MNG', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Résultats d\'examen', margin, 35);

      // Date and user info
      pdf.setFontSize(10);
      pdf.text(result.completedAt.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), pageWidth - margin - 50, 25);
      
      if (userName) {
        pdf.text(userName, pageWidth - margin - 50, 35);
      }

      yPos = 60;

      // Score Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé de l\'examen', margin, yPos);
      yPos += 15;

      // Score box
      const scoreBoxWidth = 60;
      const scoreBoxHeight = 40;
      const scoreBoxX = margin;
      
      // Background for score
      const scoreColor = result.score >= 70 ? [34, 197, 94] : result.score >= 50 ? [234, 179, 8] : [239, 68, 68];
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.roundedRect(scoreBoxX, yPos, scoreBoxWidth, scoreBoxHeight, 5, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${result.score}%`, scoreBoxX + scoreBoxWidth / 2, yPos + 25, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('Score final', scoreBoxX + scoreBoxWidth / 2, yPos + 35, { align: 'center' });

      // Stats alongside score
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      const statsX = scoreBoxX + scoreBoxWidth + 20;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`✓ Bonnes réponses: ${result.correctAnswers}/${result.totalQuestions}`, statsX, yPos + 10);
      pdf.text(`⏱ Durée: ${Math.floor(result.duration / 60)} min ${result.duration % 60} sec`, statsX, yPos + 20);
      pdf.text(`📚 Type: ${result.examType}`, statsX, yPos + 30);
      
      if (result.specialty) {
        pdf.text(`🏥 Spécialité: ${result.specialty}`, statsX, yPos + 40);
        yPos += 10;
      }
      
      if (result.difficulty) {
        pdf.text(`📊 Difficulté: ${result.difficulty}`, statsX, yPos + 40);
      }

      yPos += 60;

      // Performance analysis
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analyse de performance', margin, yPos);
      yPos += 10;

      // Performance bar chart (simplified)
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 20, 3, 3, 'F');
      
      const barWidth = ((pageWidth - 2 * margin) * result.score) / 100;
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.roundedRect(margin, yPos, barWidth, 20, 3, 3, 'F');
      
      pdf.setTextColor(result.score > 50 ? 255 : 0, result.score > 50 ? 255 : 0, result.score > 50 ? 255 : 0);
      pdf.setFontSize(10);
      pdf.text(`${result.score}%`, margin + barWidth / 2, yPos + 13, { align: 'center' });

      yPos += 35;

      // Weak topics if available
      if (result.weakTopics && result.weakTopics.length > 0) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Points à travailler', margin, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        result.weakTopics.forEach((topic, index) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = margin;
          }
          
          pdf.setFillColor(254, 226, 226);
          pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F');
          
          pdf.setTextColor(153, 27, 27);
          pdf.text(`${topic.itemCode} - ${topic.title}`, margin + 5, yPos + 8);
          pdf.text(`${Math.round(topic.errorRate * 100)}% erreurs`, pageWidth - margin - 30, yPos + 8);
          
          yPos += 16;
        });
      }

      yPos += 15;

      // Grade interpretation
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Interprétation', margin, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      let interpretation = '';
      if (result.score >= 90) {
        interpretation = 'Excellent ! Vous maîtrisez parfaitement ce sujet. Continuez ainsi !';
      } else if (result.score >= 70) {
        interpretation = 'Très bien ! Vous avez une bonne compréhension. Quelques révisions ciblées suffisent.';
      } else if (result.score >= 50) {
        interpretation = 'Correct. Des efforts supplémentaires sont nécessaires pour consolider vos connaissances.';
      } else {
        interpretation = 'Des lacunes importantes ont été identifiées. Reprenez les items avec un score faible.';
      }

      const splitText = pdf.splitTextToSize(interpretation, pageWidth - 2 * margin);
      pdf.text(splitText, margin, yPos);

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `MED-MNG - Généré le ${new Date().toLocaleDateString('fr-FR')} | Page ${i}/${totalPages}`,
          pageWidth / 2,
          290,
          { align: 'center' }
        );
      }

      // Save
      const fileName = `examen-${result.examType}-${result.completedAt.toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "✅ PDF généré",
        description: "Vos résultats ont été téléchargés avec succès",
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

  const shareResults = async () => {
    const shareText = `🎓 MED-MNG - Résultats d'examen\n\n📊 Score: ${result.score}%\n✅ Bonnes réponses: ${result.correctAnswers}/${result.totalQuestions}\n📚 Type: ${result.examType}\n\n#MedMNG #EDN #MédecineEnMusique`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Résultats d\'examen MED-MNG',
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "📋 Copié",
          description: "Les résultats ont été copiés dans le presse-papiers",
        });
      }
    } catch (error) {
      console.debug('Share cancelled or not supported');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Export des résultats
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
          Télécharger PDF
        </Button>
        <Button 
          onClick={shareResults} 
          variant="outline"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </CardContent>
    </Card>
  );
};
