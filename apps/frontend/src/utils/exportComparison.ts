import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import logger from '@/lib/logger';

/**
 * Comparison data structure
 */
export interface ComparisonData {
  category: string;
  period1: number;
  period2: number;
  difference: number;
  percentageChange: number;
}

/**
 * Export comparison data to PDF
 * @param data - Comparison data array
 * @param period1Label - Label for first period
 * @param period2Label - Label for second period
 * @param chartRef - Optional reference to chart element for screenshot
 */
export async function exportComparisonToPDF(
  data: ComparisonData[],
  period1Label: string,
  period2Label: string,
  chartRef?: HTMLDivElement
): Promise<void> {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Comparison Report', 14, 20);

    // Add periods
    doc.setFontSize(12);
    doc.text(`${period1Label} vs ${period2Label}`, 14, 28);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);

    let startY = 45;

    // Add chart if reference provided
    if (chartRef) {
      try {
        const canvas = await html2canvas(chartRef);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 14, startY, 180, 100);
        startY += 110;
      } catch (error) {
        logger.warn('Failed to capture chart:', error);
      }
    }

    // Prepare table data
    const tableData = data.map((item) => [
      item.category,
      item.period1.toFixed(2),
      item.period2.toFixed(2),
      item.difference.toFixed(2),
      `${item.percentageChange >= 0 ? '+' : ''}${item.percentageChange.toFixed(1)}%`,
    ]);

    // Add table
    (doc as any).autoTable({
      head: [[
        'Category',
        period1Label,
        period2Label,
        'Difference',
        'Change %',
      ]],
      body: tableData,
      startY,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Save the PDF
    doc.save(`comparison-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    logger.error('Failed to export comparison to PDF:', error);
    throw new Error('Failed to export comparison to PDF');
  }
}

/**
 * Export comparison data to Excel
 * @param data - Comparison data array
 * @param period1Label - Label for first period
 * @param period2Label - Label for second period
 */
export async function exportComparisonToExcel(
  data: ComparisonData[],
  period1Label: string,
  period2Label: string
): Promise<void> {
  try {
    // Prepare worksheet data
    const wsData = [
      ['Category', period1Label, period2Label, 'Difference', 'Change %'],
      ...data.map((item) => [
        item.category,
        item.period1,
        item.period2,
        item.difference,
        `${item.percentageChange.toFixed(1)}%`,
      ]),
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Comparison');

    // Save file
    XLSX.writeFile(wb, `comparison-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    logger.error('Failed to export comparison to Excel:', error);
    throw new Error('Failed to export comparison to Excel');
  }
}

/**
 * Export comparison data to CSV
 * @param data - Comparison data array
 * @param period1Label - Label for first period
 * @param period2Label - Label for second period
 */
export function exportComparisonToCSV(
  data: ComparisonData[],
  period1Label: string,
  period2Label: string
): void {
  try {
    const headers = ['Category', period1Label, period2Label, 'Difference', 'Change %'];
    const rows = [headers.join(',')];

    data.forEach((item) => {
      rows.push([
        item.category,
        item.period1.toFixed(2),
        item.period2.toFixed(2),
        item.difference.toFixed(2),
        `${item.percentageChange >= 0 ? '+' : ''}${item.percentageChange.toFixed(1)}%`,
      ].join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Failed to export comparison to CSV:', error);
    throw new Error('Failed to export comparison to CSV');
  }
}
