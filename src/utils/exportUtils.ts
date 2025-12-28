import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export interface ExportOptions {
  title: string;
  content: string;
  itemCode: string;
  type: 'roman' | 'bd' | 'competences';
}

/**
 * Export content as PDF
 */
export const exportToPDF = async (options: ExportOptions): Promise<void> => {
  const { title, content, itemCode, type } = options;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    
    // Header
    pdf.setFillColor(59, 130, 246); // primary blue
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${itemCode} - ${title}`, margin, 18);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Type: ${type.toUpperCase()} | Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 26);
    
    // Content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    
    const lines = pdf.splitTextToSize(content, contentWidth);
    let y = 45;
    
    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 6;
    }
    
    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`MED-MNG | Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    pdf.save(`${itemCode}-${type}-${Date.now()}.pdf`);
    toast.success('PDF téléchargé avec succès !');
  } catch (error) {
    console.error('PDF export error:', error);
    toast.error('Erreur lors de l\'export PDF');
    throw error;
  }
};

/**
 * Share content using Web Share API or fallback to clipboard
 */
export const shareContent = async (options: ExportOptions): Promise<void> => {
  const { title, content, itemCode, type } = options;
  
  const shareText = `${itemCode} - ${title}\n\n${content.substring(0, 500)}...\n\nGénéré avec MED-MNG`;
  const shareUrl = window.location.href;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: `${itemCode} - ${title}`,
        text: shareText,
        url: shareUrl,
      });
      toast.success('Partagé avec succès !');
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.success('Lien copié dans le presse-papier !');
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share error:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        toast.success('Lien copié dans le presse-papier !');
      } catch {
        toast.error('Erreur lors du partage');
      }
    }
  }
};

/**
 * Export element as image
 */
export const exportAsImage = async (elementId: string, filename: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Élément non trouvé');
      return;
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success('Image téléchargée !');
  } catch (error) {
    console.error('Image export error:', error);
    toast.error('Erreur lors de l\'export image');
  }
};
