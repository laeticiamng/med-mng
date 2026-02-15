import html2canvas from 'html2canvas';
import { exportToXlsx } from './excelExport';
interface ComparisonData {
  category: string;
  period1: number;
  period2: number;
  difference: number;
  percentageChange: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  timing: 'Timing',
  platform: 'Plateforme',
  volume: 'Volume',
  quality: 'Qualité',
};

// Export PDF avec graphiques
export const exportComparisonToPDF = async (
  data: ComparisonData[],
  period1Label: string,
  period2Label: string,
  chartElement?: HTMLElement
) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text('Rapport de Comparaison de Performance', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(108, 117, 125);
  doc.text(`Période 1: ${period1Label}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Période 2: ${period2Label}`, pageWidth / 2, 36, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 42, { align: 'center' });
  
  let yPosition = 50;
  
  // Si un graphique est fourni, l'ajouter
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Erreur lors de la capture du graphique:', error);
    }
  }
  
  // Vérifier si on a besoin d'une nouvelle page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Tableau récapitulatif
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text('Tableau Récapitulatif', 20, yPosition);
  yPosition += 10;
  
  const tableData = data.map((item) => [
    CATEGORY_LABELS[item.category] || item.category,
    `${item.period1}/100`,
    `${item.period2}/100`,
    `${item.difference > 0 ? '+' : ''}${item.difference}`,
    `${item.percentageChange > 0 ? '+' : ''}${item.percentageChange.toFixed(1)}%`,
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Catégorie', period1Label, period2Label, 'Différence', 'Évolution']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        // Colorer la colonne "Différence"
        if (data.column.index === 3) {
          const text = data.cell.text[0];
          const value = parseFloat(text);
          if (value > 0) {
            data.cell.styles.textColor = [34, 197, 94]; // Vert
          } else if (value < 0) {
            data.cell.styles.textColor = [239, 68, 68]; // Rouge
          }
        }
        // Colorer la colonne "Évolution"
        if (data.column.index === 4) {
          const text = data.cell.text[0];
          const value = parseFloat(text.replace('%', ''));
          if (value > 0) {
            data.cell.styles.textColor = [34, 197, 94]; // Vert
          } else if (value < 0) {
            data.cell.styles.textColor = [239, 68, 68]; // Rouge
          }
        }
      }
    },
  });
  
  // Statistiques globales
  const avgPeriod1 = Math.round(
    data.reduce((sum, item) => sum + item.period1, 0) / data.length
  );
  const avgPeriod2 = Math.round(
    data.reduce((sum, item) => sum + item.period2, 0) / data.length
  );
  const avgDifference = avgPeriod2 - avgPeriod1;
  const avgPercentageChange = avgPeriod1 > 0 ? (avgDifference / avgPeriod1) * 100 : 0;
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Statistiques Globales', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(33, 37, 41);
  
  doc.text(`Score moyen ${period1Label}: ${avgPeriod1}/100`, 30, yPosition);
  yPosition += 7;
  doc.text(`Score moyen ${period2Label}: ${avgPeriod2}/100`, 30, yPosition);
  yPosition += 7;
  doc.text(
    `Évolution moyenne: ${avgDifference > 0 ? '+' : ''}${avgDifference} pts (${
      avgPercentageChange > 0 ? '+' : ''
    }${avgPercentageChange.toFixed(1)}%)`,
    30,
    yPosition
  );
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Sauvegarder
  const fileName = `comparaison-${period1Label.replace(/\s+/g, '-')}-vs-${period2Label.replace(
    /\s+/g,
    '-'
  )}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Export Excel détaillé
export const exportComparisonToExcel = async (
  data: ComparisonData[],
  period1Label: string,
  period2Label: string
) => {
  // Feuille 1: Données de comparaison
  const comparisonSheet = data.map((item) => ({
    Catégorie: CATEGORY_LABELS[item.category] || item.category,
    [period1Label]: item.period1,
    [period2Label]: item.period2,
    Différence: item.difference,
    'Évolution (%)': parseFloat(item.percentageChange.toFixed(1)),
  }));
  
  // Feuille 2: Statistiques globales
  const avgPeriod1 = Math.round(
    data.reduce((sum, item) => sum + item.period1, 0) / data.length
  );
  const avgPeriod2 = Math.round(
    data.reduce((sum, item) => sum + item.period2, 0) / data.length
  );
  const avgDifference = avgPeriod2 - avgPeriod1;
  const avgPercentageChange = avgPeriod1 > 0 ? (avgDifference / avgPeriod1) * 100 : 0;
  
  const improvements = data.filter((d) => d.difference > 0).length;
  const deteriorations = data.filter((d) => d.difference < 0).length;
  const unchanged = data.filter((d) => d.difference === 0).length;
  
  const statsSheet = [
    { Métrique: 'Score moyen période 1', Valeur: avgPeriod1 },
    { Métrique: 'Score moyen période 2', Valeur: avgPeriod2 },
    { Métrique: 'Différence moyenne', Valeur: avgDifference },
    { Métrique: 'Évolution moyenne (%)', Valeur: parseFloat(avgPercentageChange.toFixed(1)) },
    { Métrique: '', Valeur: '' },
    { Métrique: 'Nombre d\'améliorations', Valeur: improvements },
    { Métrique: 'Nombre de détériorations', Valeur: deteriorations },
    { Métrique: 'Nombre inchangé', Valeur: unchanged },
    { Métrique: 'Total catégories', Valeur: data.length },
  ];
  
  // Feuille 3: Détails par catégorie
  const sortedByChange = [...data].sort((a, b) => b.difference - a.difference);
  const detailsSheet = sortedByChange.map((item, index) => ({
    Rang: index + 1,
    Catégorie: CATEGORY_LABELS[item.category] || item.category,
    [period1Label]: item.period1,
    [period2Label]: item.period2,
    Différence: item.difference,
    'Évolution (%)': parseFloat(item.percentageChange.toFixed(1)),
    Tendance: item.difference > 0 ? 'Amélioration' : item.difference < 0 ? 'Détérioration' : 'Stable',
  }));
  
  // Sauvegarder avec notre utilitaire natif
  const fileName = `comparaison-${period1Label.replace(/\s+/g, '-')}-vs-${period2Label.replace(
    /\s+/g,
    '-'
  )}-${new Date().toISOString().split('T')[0]}`;
  
  await exportToXlsx([
    { name: 'Comparaison', data: comparisonSheet, columnWidths: [15, 15, 15, 12, 15] },
    { name: 'Statistiques', data: statsSheet, columnWidths: [30, 15] },
    { name: 'Détails', data: detailsSheet, columnWidths: [8, 15, 15, 15, 12, 15, 20] },
  ], fileName);
};

// Export CSV simple
export const exportComparisonToCSV = (
  data: ComparisonData[],
  period1Label: string,
  period2Label: string
) => {
  const headers = ['Catégorie', period1Label, period2Label, 'Différence', 'Évolution (%)'];
  
  const rows = data.map((item) => [
    CATEGORY_LABELS[item.category] || item.category,
    item.period1,
    item.period2,
    item.difference,
    item.percentageChange.toFixed(1),
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `comparaison-${period1Label.replace(/\s+/g, '-')}-vs-${period2Label.replace(
    /\s+/g,
    '-'
  )}-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
