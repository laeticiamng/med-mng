import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { exportComparisonToPDF, exportComparisonToExcel, exportComparisonToCSV } from '@/utils/exportComparison';
import { toast } from 'sonner';

interface ComparisonData {
  category: string;
  period1: number;
  period2: number;
  difference: number;
  percentageChange: number;
}

interface ComparisonExportProps {
  data: ComparisonData[];
  period1Label: string;
  period2Label: string;
  chartRef?: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export const ComparisonExport: React.FC<ComparisonExportProps> = ({
  data,
  period1Label,
  period2Label,
  chartRef,
  disabled = false,
}) => {
  const handleExportPDF = async () => {
    try {
      toast.loading('Génération du PDF en cours...');
      await exportComparisonToPDF(
        data,
        period1Label,
        period2Label,
        chartRef?.current || undefined
      );
      toast.dismiss();
      toast.success('Rapport PDF téléchargé avec succès');
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors de la génération du PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      exportComparisonToExcel(data, period1Label, period2Label);
      toast.success('Rapport Excel téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du fichier Excel');
      console.error('Excel export error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportComparisonToCSV(data, period1Label, period2Label);
      toast.success('Rapport CSV téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du CSV');
      console.error('CSV export error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Rapport PDF Complet
          <span className="ml-auto text-xs text-muted-foreground">+ graphiques</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportExcel}>
          <Table className="h-4 w-4 mr-2" />
          Export Excel Détaillé
          <span className="ml-auto text-xs text-muted-foreground">3 feuilles</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV Simple
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
