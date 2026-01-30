/**
 * Native Excel Export Utility
 * Generates XLSX files without external dependencies (fixes xlsx vulnerability)
 * Uses JSZip for the archive structure
 */

import JSZip from 'jszip';

interface SheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

interface ColumnStyle {
  width?: number;
}

// XML escape helper
const escapeXml = (str: string | number | boolean | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Convert column index to Excel letter (0 -> A, 1 -> B, 26 -> AA, etc.)
const getColumnLetter = (index: number): string => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

// Generate sheet XML
const generateSheetXml = (data: SheetData, columnStyles?: ColumnStyle[]): string => {
  const { headers, rows } = data;
  
  let sheetData = '';
  
  // Header row
  sheetData += '<row r="1">';
  headers.forEach((header, colIndex) => {
    const cellRef = `${getColumnLetter(colIndex)}1`;
    sheetData += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`;
  });
  sheetData += '</row>';
  
  // Data rows
  rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2;
    sheetData += `<row r="${rowNum}">`;
    row.forEach((cell, colIndex) => {
      const cellRef = `${getColumnLetter(colIndex)}${rowNum}`;
      if (typeof cell === 'number') {
        sheetData += `<c r="${cellRef}"><v>${cell}</v></c>`;
      } else {
        sheetData += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`;
      }
    });
    sheetData += '</row>';
  });
  
  // Column widths
  let cols = '';
  if (columnStyles && columnStyles.length > 0) {
    cols = '<cols>';
    columnStyles.forEach((style, index) => {
      const width = style.width || 15;
      cols += `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    });
    cols += '</cols>';
  }
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
${cols}
<sheetData>
${sheetData}
</sheetData>
</worksheet>`;
};

// Generate workbook XML
const generateWorkbookXml = (sheetNames: string[]): string => {
  const sheets = sheetNames
    .map((name, index) => `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join('');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${sheets}
</sheets>
</workbook>`;
};

// Generate workbook relationships XML
const generateWorkbookRelsXml = (sheetCount: number): string => {
  const rels = Array.from({ length: sheetCount }, (_, i) => 
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
  ).join('');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`;
};

// Generate content types XML
const generateContentTypesXml = (sheetCount: number): string => {
  const overrides = Array.from({ length: sheetCount }, (_, i) => 
    `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${overrides}
</Types>`;
};

// Generate main rels XML
const generateRelsXml = (): string => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
};

export interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
  columnWidths?: number[];
}

/**
 * Export data to XLSX file
 * @param sheets Array of sheets with name and data
 * @param filename Output filename (without extension)
 */
export const exportToXlsx = async (sheets: ExcelSheet[], filename: string): Promise<void> => {
  const zip = new JSZip();
  
  // Add content types
  zip.file('[Content_Types].xml', generateContentTypesXml(sheets.length));
  
  // Add main rels
  const relsFolder = zip.folder('_rels');
  relsFolder?.file('.rels', generateRelsXml());
  
  // Add xl folder
  const xlFolder = zip.folder('xl');
  
  // Add workbook
  xlFolder?.file('workbook.xml', generateWorkbookXml(sheets.map(s => s.name)));
  
  // Add workbook rels
  const xlRelsFolder = xlFolder?.folder('_rels');
  xlRelsFolder?.file('workbook.xml.rels', generateWorkbookRelsXml(sheets.length));
  
  // Add worksheets
  const worksheetsFolder = xlFolder?.folder('worksheets');
  
  sheets.forEach((sheet, index) => {
    const headers = sheet.data.length > 0 ? Object.keys(sheet.data[0]) : [];
    const rows = sheet.data.map(row => headers.map(h => row[h] as string | number | boolean | null | undefined));
    
    const columnStyles = sheet.columnWidths?.map(width => ({ width })) || 
      headers.map(() => ({ width: 15 }));
    
    const sheetData: SheetData = {
      sheetName: sheet.name,
      headers,
      rows,
    };
    
    worksheetsFolder?.file(`sheet${index + 1}.xml`, generateSheetXml(sheetData, columnStyles));
  });
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Simple helper to export a single sheet
 */
export const exportSingleSheetToXlsx = async (
  data: Record<string, unknown>[],
  sheetName: string,
  filename: string
): Promise<void> => {
  await exportToXlsx([{ name: sheetName, data }], filename);
};
