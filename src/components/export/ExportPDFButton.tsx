import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExportPDFButtonProps {
  title: string;
  content: string | (() => string);
  filename?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const ExportPDFButton = ({
  title,
  content,
  filename = 'export',
  variant = 'outline',
  size = 'default',
  className,
  children
}: ExportPDFButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const contentStr = typeof content === 'function' ? content() : content;
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, 30);
      
      // Add content with word wrapping
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(contentStr, 170);
      let y = 45;
      
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`MED-MNG | Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Download
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export réussi",
        description: "Le PDF a été téléchargé",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children || 'Exporter PDF'}
    </Button>
  );
};

// Specialized export for chat conversations
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ExportChatPDFProps {
  messages: ChatMessage[];
  sessionTitle?: string;
}

export const ExportChatPDF = ({ messages, sessionTitle }: ExportChatPDFProps) => {
  const formatContent = () => {
    return messages.map((msg, idx) => {
      const role = msg.role === 'user' ? '🧑 Vous' : '🤖 Assistant';
      const time = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '';
      return `${role} ${time}\n${msg.content}\n\n---\n`;
    }).join('\n');
  };

  return (
    <ExportPDFButton
      title={sessionTitle || 'Conversation IA'}
      content={formatContent}
      filename={`conversation_${sessionTitle?.replace(/\s+/g, '_') || 'ia'}`}
      variant="ghost"
      size="sm"
    >
      <FileText className="h-4 w-4 mr-2" />
      Exporter la conversation
    </ExportPDFButton>
  );
};

// Specialized export for statistics
interface StatItem {
  label: string;
  value: string | number;
}

interface ExportStatsPDFProps {
  title: string;
  stats: StatItem[];
  additionalContent?: string;
}

export const ExportStatsPDF = ({ title, stats, additionalContent }: ExportStatsPDFProps) => {
  const formatContent = () => {
    let content = stats.map(stat => `${stat.label}: ${stat.value}`).join('\n');
    if (additionalContent) {
      content += `\n\n${additionalContent}`;
    }
    return content;
  };

  return (
    <ExportPDFButton
      title={title}
      content={formatContent}
      filename={`stats_${title.replace(/\s+/g, '_').toLowerCase()}`}
      variant="outline"
    >
      <Download className="h-4 w-4 mr-2" />
      Télécharger le rapport
    </ExportPDFButton>
  );
};
