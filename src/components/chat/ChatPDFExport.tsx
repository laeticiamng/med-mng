// Chat conversation PDF export component
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  courseCitations?: string[];
}

interface ChatPDFExportProps {
  messages: Message[];
  conversationTitle?: string;
}

export const ChatPDFExport: React.FC<ChatPDFExportProps> = ({ 
  messages, 
  conversationTitle = 'Conversation IA' 
}) => {
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (messages.length < 2) {
      toast({
        title: 'Conversation vide',
        description: 'Ajoutez des messages avant d\'exporter',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text('MED MNG - Chat IA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(conversationTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Messages
      for (const message of messages) {
        if (message.content === '...' || message.content.length < 2) continue;

        // Check for page break
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }

        // Role label
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        
        if (message.role === 'user') {
          doc.setTextColor(79, 70, 229);
          doc.text('👤 Vous', margin, yPosition);
        } else {
          doc.setTextColor(22, 163, 74);
          doc.text('🤖 Assistant IA', margin, yPosition);
        }
        yPosition += 6;

        // Timestamp
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(message.timestamp.toLocaleTimeString('fr-FR'), margin, yPosition);
        yPosition += 6;

        // Message content
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(message.content, maxWidth);
        
        for (const line of lines) {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }

        // Citations if present
        if (message.courseCitations && message.courseCitations.length > 0) {
          yPosition += 3;
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'italic');
          doc.text('Sources:', margin, yPosition);
          yPosition += 4;

          for (const citation of message.courseCitations) {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
            const citationLines = doc.splitTextToSize(`• ${citation}`, maxWidth - 10);
            for (const line of citationLines) {
              doc.text(line, margin + 5, yPosition);
              yPosition += 4;
            }
          }
        }

        yPosition += 8;

        // Separator between messages
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }

      // Footer on all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} / ${pageCount} - MED MNG © ${new Date().getFullYear()}`,
          pageWidth / 2,
          290,
          { align: 'center' }
        );
      }

      // Download
      const filename = `medmng-chat-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast({
        title: '✅ Export réussi',
        description: 'Le PDF a été téléchargé',
      });

      setOpen(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible de générer le PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="hidden md:flex" title="Exporter en PDF">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Exporter la conversation
          </DialogTitle>
          <DialogDescription>
            Téléchargez cette conversation en PDF pour la consulter hors-ligne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Aperçu</span>
              <span className="text-sm text-muted-foreground">
                {messages.filter(m => m.content !== '...' && m.content.length >= 2).length} messages
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Titre: {conversationTitle}</p>
              <p>• Date: {new Date().toLocaleDateString('fr-FR')}</p>
              <p>• Format: PDF avec mise en page optimisée</p>
            </div>
          </div>

          <Button 
            className="w-full gap-2" 
            onClick={generatePDF}
            disabled={exporting || messages.length < 2}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Télécharger le PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
