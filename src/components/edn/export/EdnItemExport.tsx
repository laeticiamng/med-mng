import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TableauSection {
  titre?: string;
  title?: string;
  concepts?: Array<{
    nom?: string;
    name?: string;
    definition?: string;
    description?: string;
  }>;
}

interface TableauRangData {
  sections?: TableauSection[];
  [key: string]: unknown;
}

interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
}

interface EdnItemExportProps {
  itemCode: string;
  itemTitle: string;
  tableauRangA?: TableauRangData;
  tableauRangB?: TableauRangData;
  parolesRangA?: string[];
  parolesRangB?: string[];
}

interface ExportOptions {
  includeRangA: boolean;
  includeRangB: boolean;
  includeOicCompetences: boolean;
  includeParoles: boolean;
}

export function EdnItemExport({ 
  itemCode, 
  itemTitle,
  tableauRangA,
  tableauRangB,
  parolesRangA,
  parolesRangB
}: EdnItemExportProps) {
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeRangA: true,
    includeRangB: true,
    includeOicCompetences: true,
    includeParoles: false,
  });
  const { toast } = useToast();

  const generatePDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header avec gradient
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(itemCode, 20, 18);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(itemTitle.substring(0, 60), 20, 28);
      
      doc.setFontSize(8);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 50, 28);
      
      yPos = 45;

      // Charger les compétences OIC si demandé
      let oicCompetencesA: OicCompetence[] = [];
      let oicCompetencesB: OicCompetence[] = [];
      
      if (options.includeOicCompetences) {
        const { data: compA } = await supabase
          .from('backup_oic_competences')
          .select('*')
          .eq('item_parent', itemCode)
          .eq('rang', 'A')
          .limit(100);
        
        const { data: compB } = await supabase
          .from('backup_oic_competences')
          .select('*')
          .eq('item_parent', itemCode)
          .eq('rang', 'B')
          .limit(100);
        
        oicCompetencesA = compA || [];
        oicCompetencesB = compB || [];
      }

      // Section Rang A
      if (options.includeRangA) {
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('📘 Rang A - Compétences Fondamentales', 20, yPos);
        yPos += 10;

        if (oicCompetencesA.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['ID', 'Intitulé', 'Description']],
            body: oicCompetencesA.map(c => [
              c.objectif_id || '-',
              (c.intitule || '').substring(0, 40),
              (c.description || '').substring(0, 80)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 50 },
              2: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 20 }
          });
          yPos = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos + 15;
        } else if (tableauRangA?.sections) {
          // Fallback: utiliser les sections du tableau
          tableauRangA.sections.forEach((section, idx) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.setTextColor(0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${idx + 1}. ${section.titre || section.title || 'Section'}`, 20, yPos);
            yPos += 6;
            
            if (section.concepts) {
              section.concepts.forEach((concept) => {
                if (yPos > 270) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const text = `• ${concept.nom || concept.name || String(concept)}: ${concept.definition || concept.description || ''}`;
                const lines = doc.splitTextToSize(text, pageWidth - 45);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5 + 2;
              });
            }
            yPos += 5;
          });
        } else {
          doc.setTextColor(128);
          doc.setFontSize(10);
          doc.text('Aucune compétence Rang A disponible', 20, yPos);
          yPos += 10;
        }
      }

      // Section Rang B
      if (options.includeRangB) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setTextColor(168, 85, 247);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('📗 Rang B - Compétences Avancées', 20, yPos);
        yPos += 10;

        if (oicCompetencesB.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['ID', 'Intitulé', 'Description']],
            body: oicCompetencesB.map(c => [
              c.objectif_id || '-',
              (c.intitule || '').substring(0, 40),
              (c.description || '').substring(0, 80)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [168, 85, 247], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 50 },
              2: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 20 }
          });
          yPos = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos + 15;
        } else if (tableauRangB?.sections) {
          tableauRangB.sections.forEach((section, idx) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.setTextColor(0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${idx + 1}. ${section.titre || section.title || 'Section'}`, 20, yPos);
            yPos += 6;
            
            if (section.concepts) {
              section.concepts.forEach((concept) => {
                if (yPos > 270) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const text = `• ${concept.nom || concept.name || String(concept)}: ${concept.definition || concept.description || ''}`;
                const lines = doc.splitTextToSize(text, pageWidth - 45);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5 + 2;
              });
            }
            yPos += 5;
          });
        } else {
          doc.setTextColor(128);
          doc.setFontSize(10);
          doc.text('Aucune compétence Rang B disponible', 20, yPos);
          yPos += 10;
        }
      }

      // Paroles musicales
      if (options.includeParoles && (parolesRangA?.length || parolesRangB?.length)) {
        doc.addPage();
        yPos = 20;
        
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('🎵 Paroles Musicales', 20, yPos);
        yPos += 15;

        if (parolesRangA?.length) {
          doc.setTextColor(0);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Rang A:', 20, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          parolesRangA.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            const lines = doc.splitTextToSize(line, pageWidth - 40);
            doc.text(lines, 20, yPos);
            yPos += lines.length * 5 + 2;
          });
          yPos += 10;
        }

        if (parolesRangB?.length) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Rang B:', 20, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          parolesRangB.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            const lines = doc.splitTextToSize(line, pageWidth - 40);
            doc.text(lines, 20, yPos);
            yPos += lines.length * 5 + 2;
          });
        }
      }

      // Footer sur chaque page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i}/${pageCount} | MED-MNG - ${itemCode}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Statistiques finales
      const totalCompetences = oicCompetencesA.length + oicCompetencesB.length;
      
      doc.save(`${itemCode}-complet-${Date.now()}.pdf`);
      
      toast({ 
        title: '✅ Export réussi', 
        description: `PDF téléchargé avec ${totalCompetences} compétences OIC`
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({
        title: 'Erreur d\'export', 
        description: `Impossible de générer le PDF: ${errorMessage}`, 
        variant: 'destructive' 
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export PDF Complet
        </CardTitle>
        <CardDescription className="text-xs">
          Téléchargez toutes les compétences OIC en PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'includeRangA', label: 'Rang A' },
            { key: 'includeRangB', label: 'Rang B' },
            { key: 'includeOicCompetences', label: 'Compétences OIC' },
            { key: 'includeParoles', label: 'Paroles musicales' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={options[key as keyof ExportOptions]}
                onCheckedChange={(checked) => setOptions({ ...options, [key]: !!checked })}
              />
              <label htmlFor={key} className="text-xs cursor-pointer">{label}</label>
            </div>
          ))}
        </div>

        <Button 
          onClick={generatePDF} 
          disabled={exporting} 
          className="w-full gap-2"
          size="sm"
        >
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
      </CardContent>
    </Card>
  );
}
