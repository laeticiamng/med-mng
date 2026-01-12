import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Download, Loader2, CheckCircle, 
  BookOpen, Music, Brain, Award, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface ExportOptions {
  includeProgress: boolean;
  includeQuizHistory: boolean;
  includeLyrics: boolean;
  includeNotes: boolean;
  includeStatistics: boolean;
  includeAchievements: boolean;
}

interface ExportableItem {
  id: string;
  code: string;
  title: string;
  specialty: string;
  progress: number;
  lastReviewed?: Date;
}

export const PDFExportService: React.FC = () => {
  const [options, setOptions] = useState<ExportOptions>({
    includeProgress: true,
    includeQuizHistory: true,
    includeLyrics: false,
    includeNotes: true,
    includeStatistics: true,
    includeAchievements: true
  });
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

  const sampleItems: ExportableItem[] = [
    { id: '1', code: 'IC-1', title: 'Relations médecin-malade', specialty: 'Communication', progress: 85 },
    { id: '2', code: 'IC-3', title: 'Le raisonnement clinique', specialty: 'Méthodologie', progress: 72 },
    { id: '3', code: 'IC-228', title: 'Douleur thoracique aiguë', specialty: 'Cardiologie', progress: 90 },
    { id: '4', code: 'IC-232', title: 'Insuffisance cardiaque', specialty: 'Cardiologie', progress: 65 },
    { id: '5', code: 'IC-80', title: 'Prescription d\'antibiotiques', specialty: 'Infectiologie', progress: 78 }
  ];

  const generatePDF = async () => {
    setExporting(true);
    setExportProgress(0);

    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // En-tête
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text('MED MNG - Rapport de Progression', 105, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, yPosition, { align: 'center' });
      yPosition += 20;

      setExportProgress(10);

      // Statistiques globales
      if (options.includeStatistics) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Statistiques Globales', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.text(`• Items révisés : ${sampleItems.length}`, 25, yPosition);
        yPosition += 7;
        doc.text(`• Progression moyenne : ${Math.round(sampleItems.reduce((a, b) => a + b.progress, 0) / sampleItems.length)}%`, 25, yPosition);
        yPosition += 7;
        doc.text(`• Temps total d'étude : 12h 45min`, 25, yPosition);
        yPosition += 15;

        setExportProgress(30);
      }

      // Progression par item
      if (options.includeProgress) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Progression par Item', 20, yPosition);
        yPosition += 10;

        const itemsToExport = selectedItems.length > 0 
          ? sampleItems.filter(i => selectedItems.includes(i.id))
          : sampleItems;

        doc.setFontSize(10);
        itemsToExport.forEach((item, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setTextColor(0, 0, 0);
          doc.text(`${item.code} - ${item.title}`, 25, yPosition);
          
          // Barre de progression
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(200, 200, 200);
          doc.roundedRect(25, yPosition + 2, 100, 4, 1, 1, 'F');
          
          doc.setFillColor(79, 70, 229);
          doc.roundedRect(25, yPosition + 2, item.progress, 4, 1, 1, 'F');
          
          doc.setTextColor(100, 100, 100);
          doc.text(`${item.progress}%`, 130, yPosition + 5);
          doc.text(item.specialty, 150, yPosition + 5);
          
          yPosition += 12;
          setExportProgress(30 + (index / itemsToExport.length) * 40);
        });

        yPosition += 10;
      }

      // Achievements
      if (options.includeAchievements) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Badges et Accomplissements', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        const achievements = [
          '🏆 Série de 7 jours consécutifs',
          '⭐ 100 items révisés',
          '🎯 10 quiz parfaits',
          '🔥 Streak de 30 jours'
        ];

        achievements.forEach(achievement => {
          doc.text(achievement, 25, yPosition);
          yPosition += 7;
        });

        setExportProgress(90);
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} sur ${pageCount} - MED MNG © ${new Date().getFullYear()}`,
          105,
          290,
          { align: 'center' }
        );
      }

      setExportProgress(100);

      // Téléchargement
      doc.save(`med-mng-rapport-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Export réussi',
        description: 'Votre rapport PDF a été téléchargé avec succès.',
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Une erreur est survenue lors de la génération du PDF.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(sampleItems.map(i => i.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Export PDF
          </CardTitle>
          <CardDescription>
            Générez un rapport PDF complet de votre progression
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Options d'export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Options d'export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'includeProgress', label: 'Progression par item', icon: BookOpen },
              { key: 'includeQuizHistory', label: 'Historique des quiz', icon: Brain },
              { key: 'includeLyrics', label: 'Paroles musicales', icon: Music },
              { key: 'includeNotes', label: 'Notes personnelles', icon: FileText },
              { key: 'includeStatistics', label: 'Statistiques globales', icon: FileText },
              { key: 'includeAchievements', label: 'Badges et succès', icon: Award }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={options[key as keyof ExportOptions]}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, [key]: checked }))
                  }
                />
                <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sélection des items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Items à inclure</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Tout
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Aucun
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sampleItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedItems.includes(item.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div>
                      <p className="font-medium text-sm">{item.code}</p>
                      <p className="text-xs text-muted-foreground">{item.title}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{item.progress}%</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {selectedItems.length === 0 
                ? 'Tous les items seront inclus' 
                : `${selectedItems.length} item(s) sélectionné(s)`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bouton d'export */}
      <Card>
        <CardContent className="p-6">
          {exporting ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Génération du PDF en cours...</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {exportProgress}% complété
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Prêt à exporter</span>
              </div>
              <Button size="lg" onClick={generatePDF} className="w-full max-w-md">
                <Download className="h-5 w-5 mr-2" />
                Générer et télécharger le PDF
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Le fichier sera téléchargé automatiquement une fois généré
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
