import jsPDF from 'jspdf';
import { toast } from 'sonner';

export interface EnhancedExportOptions {
  title: string;
  itemCode: string;
  rang?: 'A' | 'B';
  competences?: Array<{
    intitule: string;
    rang: string;
    rubrique?: string;
  }>;
  parolesMusicales?: {
    rangA?: string;
    rangB?: string;
  };
  quizStats?: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
  };
  sceneImmersive?: string;
  createdAt?: string;
}

/**
 * Export EDN complete content as enhanced PDF
 */
export const exportEnhancedPDF = async (options: EnhancedExportOptions): Promise<void> => {
  const { 
    title, 
    itemCode, 
    rang,
    competences = [], 
    parolesMusicales, 
    quizStats,
    sceneImmersive 
  } = options;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    
    let y = 0;

    // ===== PAGE DE COUVERTURE =====
    // Header gradient
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Item ${itemCode}`, margin, 25);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(title, margin, 38);
    
    // Rang badge
    if (rang) {
      pdf.setFillColor(rang === 'A' ? 34 : 59, rang === 'A' ? 197 : 130, rang === 'A' ? 94 : 246);
      pdf.roundedRect(pageWidth - margin - 30, 15, 25, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`Rang ${rang}`, pageWidth - margin - 25, 25);
    }
    
    y = 65;
    
    // ===== STATISTIQUES =====
    if (quizStats) {
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 Statistiques de révision', margin, y);
      y += 10;
      
      pdf.setFillColor(240, 248, 255);
      pdf.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
      
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const statWidth = contentWidth / 3;
      pdf.text(`Tentatives: ${quizStats.totalAttempts}`, margin + 10, y + 10);
      pdf.text(`Score moyen: ${quizStats.averageScore}%`, margin + statWidth + 10, y + 10);
      pdf.text(`Meilleur: ${quizStats.bestScore}%`, margin + statWidth * 2 + 10, y + 10);
      
      y += 35;
    }
    
    // ===== COMPÉTENCES =====
    if (competences.length > 0) {
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎯 Compétences à maîtriser', margin, y);
      y += 8;
      
      // Group by rang
      const rangA = competences.filter(c => c.rang === 'A');
      const rangB = competences.filter(c => c.rang === 'B');
      
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (rangA.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 197, 94);
        pdf.text(`Rang A (${rangA.length})`, margin, y + 5);
        y += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        
        for (const comp of rangA.slice(0, 10)) {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = margin;
          }
          const lines = pdf.splitTextToSize(`• ${comp.intitule}`, contentWidth - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 5 + 2;
        }
        
        if (rangA.length > 10) {
          pdf.text(`... et ${rangA.length - 10} autres compétences`, margin + 5, y);
          y += 8;
        }
      }
      
      if (rangB.length > 0) {
        y += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text(`Rang B (${rangB.length})`, margin, y);
        y += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        
        for (const comp of rangB.slice(0, 10)) {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = margin;
          }
          const lines = pdf.splitTextToSize(`• ${comp.intitule}`, contentWidth - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 5 + 2;
        }
        
        if (rangB.length > 10) {
          pdf.text(`... et ${rangB.length - 10} autres compétences`, margin + 5, y);
          y += 8;
        }
      }
      
      y += 10;
    }
    
    // ===== SCÈNE IMMERSIVE =====
    if (sceneImmersive) {
      if (y > pageHeight - 60) {
        pdf.addPage();
        y = margin;
      }
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎬 Scène Immersive', margin, y);
      y += 8;
      
      pdf.setFillColor(250, 245, 255);
      pdf.setDrawColor(168, 85, 247);
      pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, 'FD');
      
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      const sceneLines = pdf.splitTextToSize(sceneImmersive.substring(0, 500), contentWidth - 10);
      pdf.text(sceneLines.slice(0, 6), margin + 5, y + 8);
      
      y += 50;
    }
    
    // ===== PAROLES MUSICALES =====
    if (parolesMusicales?.rangA || parolesMusicales?.rangB) {
      if (y > pageHeight - 80) {
        pdf.addPage();
        y = margin;
      }
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎵 Paroles Musicales', margin, y);
      y += 10;
      
      if (parolesMusicales.rangA) {
        pdf.setFillColor(255, 250, 240);
        pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
        
        pdf.setTextColor(217, 119, 6);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Chanson Rang A', margin + 5, y + 8);
        
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const lyricsA = pdf.splitTextToSize(parolesMusicales.rangA.substring(0, 300), contentWidth - 10);
        pdf.text(lyricsA.slice(0, 4), margin + 5, y + 16);
        
        y += 40;
      }
      
      if (parolesMusicales.rangB) {
        pdf.setFillColor(240, 253, 244);
        pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
        
        pdf.setTextColor(22, 163, 74);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Chanson Rang B', margin + 5, y + 8);
        
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const lyricsB = pdf.splitTextToSize(parolesMusicales.rangB.substring(0, 300), contentWidth - 10);
        pdf.text(lyricsB.slice(0, 4), margin + 5, y + 16);
      }
    }
    
    // ===== FOOTER SUR TOUTES LES PAGES =====
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `MED-MNG EDN Complete | ${itemCode} | Généré le ${new Date().toLocaleDateString('fr-FR')} | Page ${i}/${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
    
    pdf.save(`EDN-${itemCode}-Complete-${Date.now()}.pdf`);
    toast.success('PDF complet téléchargé avec succès !');
  } catch (error) {
    console.error('Enhanced PDF export error:', error);
    toast.error("Erreur lors de l'export PDF");
    throw error;
  }
};
