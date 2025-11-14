import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * File name (without extension)
   */
  fileName: string;

  /**
   * Table title for PDF
   */
  title?: string;

  /**
   * Custom headers (if different from data keys)
   */
  headers?: Record<string, string>;

  /**
   * Columns to include (if not all)
   */
  columns?: string[];

  /**
   * Column widths for PDF
   */
  columnWidths?: number[];

  /**
   * Include timestamp
   */
  includeTimestamp?: boolean;
}

/**
 * Export Service
 *
 * Handles exporting data in multiple formats:
 * - CSV (Papa Parse)
 * - Excel (XLSX)
 * - PDF (jsPDF)
 *
 * @example
 * const service = new ExportService();
 *
 * // Export as CSV
 * service.exportToCSV(data, {
 *   fileName: 'my-data',
 *   columns: ['id', 'name', 'email']
 * });
 *
 * // Export as Excel
 * service.exportToExcel(data, {
 *   fileName: 'my-data',
 *   headers: { id: 'ID', name: 'Name' }
 * });
 *
 * // Export as PDF table
 * service.exportToPDF(data, {
 *   fileName: 'my-data',
 *   title: 'My Data Report',
 *   columns: ['name', 'email', 'status']
 * });
 */
export class ExportService {
  /**
   * Export data to CSV format
   */
  public static exportToCSV<T extends Record<string, any>>(
    data: T[],
    options: Omit<ExportOptions, 'format'> & { format?: 'csv' }
  ): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    try {
      // Filter columns if specified
      let exportData = data;
      if (options.columns) {
        exportData = data.map((row) => {
          const filtered: Record<string, any> = {};
          options.columns!.forEach((col) => {
            filtered[col] = row[col];
          });
          return filtered as T;
        });
      }

      // Create CSV using Papa Parse
      const csv = Papa.unparse(exportData);

      // Create blob and download
      this.downloadFile(csv, `${options.fileName}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export data to Excel format
   */
  public static exportToExcel<T extends Record<string, any>>(
    data: T[],
    options: Omit<ExportOptions, 'format'> & { format?: 'excel' }
  ): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    try {
      // Filter columns if specified
      let exportData: any[] = data;
      if (options.columns) {
        exportData = data.map((row) => {
          const filtered: Record<string, any> = {};
          options.columns!.forEach((col) => {
            filtered[col] = row[col];
          });
          return filtered;
        });
      }

      // Apply headers if provided
      if (options.headers) {
        exportData = exportData.map((row) => {
          const renamed: Record<string, any> = {};
          Object.entries(row).forEach(([key, value]) => {
            const headerKey = options.headers?.[key] || key;
            renamed[headerKey] = value;
          });
          return renamed;
        });
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map((key) => ({
        wch: Math.max(key.length, 12),
      }));
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate file name with timestamp if requested
      const fileName = options.includeTimestamp
        ? `${options.fileName}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `${options.fileName}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export data to PDF format
   */
  public static exportToPDF<T extends Record<string, any>>(
    data: T[],
    options: Omit<ExportOptions, 'format'> & { format?: 'pdf' }
  ): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    try {
      // Filter columns if specified
      let exportData: any[] = data;
      const columns = options.columns || Object.keys(data[0]);

      if (options.columns) {
        exportData = data.map((row) => {
          const filtered: Record<string, any> = {};
          options.columns!.forEach((col) => {
            filtered[col] = row[col];
          });
          return filtered;
        });
      }

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title if provided
      if (options.title) {
        doc.setFontSize(16);
        doc.text(options.title, 14, 22);
      }

      // Add timestamp
      if (options.includeTimestamp) {
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          14,
          options.title ? 32 : 22
        );
      }

      // Prepare table headers
      const headers = columns.map((col) => options.headers?.[col] || col);

      // Prepare table data
      const body = exportData.map((row) =>
        columns.map((col) => {
          const value = row[col];
          // Format dates
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }
          // Format booleans
          if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
          }
          // Format arrays/objects
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return String(value);
        })
      );

      // Add table
      autoTable(doc, {
        head: [headers],
        body,
        startY: options.title ? 38 : 28,
        margin: 14,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          textColor: [80, 80, 80],
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: options.columnWidths
          ? Object.fromEntries(
              Object.entries(options.columnWidths).map(([idx, width]) => [
                parseInt(idx),
                { cellWidth: width },
              ])
            )
          : undefined,
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.pages.length - 1;
          const pageNumber = data.pageNumber;

          doc.setFontSize(9);
          doc.setTextColor(128);
          doc.text(
            `Page ${pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        },
      });

      // Generate file name with timestamp if requested
      const fileName = options.includeTimestamp
        ? `${options.fileName}_${new Date().toISOString().split('T')[0]}.pdf`
        : `${options.fileName}.pdf`;

      doc.save(fileName);
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export data in specified format
   */
  public static export<T extends Record<string, any>>(
    data: T[],
    options: Omit<ExportOptions, 'format'> & { format: ExportFormat }
  ): void {
    switch (options.format) {
      case 'csv':
        this.exportToCSV(data, options);
        break;
      case 'excel':
        this.exportToExcel(data, options);
        break;
      case 'pdf':
        this.exportToPDF(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Download file helper
   */
  private static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Export JSON data
   */
  public static exportToJSON<T extends Record<string, any>>(
    data: T[],
    options: Omit<ExportOptions, 'format'>
  ): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    try {
      const jsonData = {
        exportedAt: new Date().toISOString(),
        count: data.length,
        data,
      };

      const json = JSON.stringify(jsonData, null, 2);
      this.downloadFile(json, `${options.fileName}.json`, 'application/json;charset=utf-8;');
    } catch (error) {
      throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Export data to a specific format
 * Convenience function for quick exports
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  options: Omit<ExportOptions, 'format'> & { format: ExportFormat }
): void {
  ExportService.export(data, options);
}
