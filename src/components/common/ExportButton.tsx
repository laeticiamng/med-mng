import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Sheet, FileJson } from 'lucide-react';
import { ExportService, ExportFormat } from '@/services/exportService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Props for ExportButton component
 */
interface ExportButtonProps {
  /**
   * Data to export
   */
  data: Record<string, any>[];

  /**
   * File name (without extension)
   */
  fileName: string;

  /**
   * Supported export formats
   */
  formats?: ExportFormat[];

  /**
   * Custom column headers
   */
  headers?: Record<string, string>;

  /**
   * Columns to export (if not all)
   */
  columns?: string[];

  /**
   * Include timestamp in filename
   */
  includeTimestamp?: boolean;

  /**
   * Title for PDF export
   */
  title?: string;

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Button variant
   */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';

  /**
   * Show label
   */
  showLabel?: boolean;

  /**
   * Custom class names
   */
  className?: string;

  /**
   * Callback when export completes
   */
  onExportComplete?: () => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

/**
 * ExportButton Component
 *
 * Provides multi-format export functionality for data:
 * - CSV (comma-separated values)
 * - Excel (XLSX)
 * - PDF (tabular format)
 * - JSON (raw data)
 *
 * @example
 * <ExportButton
 *   data={items}
 *   fileName="my-items"
 *   formats={['csv', 'excel', 'pdf']}
 *   title="My Items Report"
 *   showLabel
 * />
 *
 * @example
 * <ExportButton
 *   data={userData}
 *   fileName="user-data"
 *   columns={['id', 'name', 'email']}
 *   headers={{
 *     id: 'ID',
 *     name: 'User Name',
 *     email: 'Email Address'
 *   }}
 * />
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  formats = ['csv', 'excel', 'pdf'],
  headers,
  columns,
  includeTimestamp = true,
  title,
  size = 'sm',
  variant = 'outline',
  showLabel = true,
  className,
  onExportComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle export
   */
  const handleExport = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      const error = new Error('No data available to export');
      toast.error('No data to export', {
        description: 'Please ensure there is data available.',
      });
      onError?.(error);
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        fileName,
        format,
        headers,
        columns,
        includeTimestamp,
        title,
      };

      switch (format) {
        case 'csv':
          ExportService.exportToCSV(data, options);
          toast.success('CSV exported successfully', {
            description: `${data.length} rows exported.`,
          });
          break;

        case 'excel':
          ExportService.exportToExcel(data, options);
          toast.success('Excel file downloaded', {
            description: `${data.length} rows exported.`,
          });
          break;

        case 'pdf':
          ExportService.exportToPDF(data, options);
          toast.success('PDF generated successfully', {
            description: `${data.length} rows exported.`,
          });
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      onExportComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Export failed:', err);
      toast.error('Export failed', {
        description: err.message,
      });
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle JSON export
   */
  const handleJSONExport = async () => {
    if (!data || data.length === 0) {
      const error = new Error('No data available to export');
      toast.error('No data to export');
      onError?.(error);
      return;
    }

    setIsLoading(true);

    try {
      ExportService.exportToJSON(data, {
        fileName,
        includeTimestamp,
      });
      toast.success('JSON exported successfully', {
        description: `${data.length} records exported.`,
      });
      onExportComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Export failed:', err);
      toast.error('Export failed', {
        description: err.message,
      });
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading || !data || data.length === 0}
          className={cn('gap-2', className)}
        >
          <Download className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          {showLabel && (
            <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
              {isLoading ? 'Exporting...' : 'Export'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            <span>CSV (.csv)</span>
          </DropdownMenuItem>
        )}

        {formats.includes('excel') && (
          <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isLoading}>
            <Sheet className="h-4 w-4 mr-2" />
            <span>Excel (.xlsx)</span>
          </DropdownMenuItem>
        )}

        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            <span>PDF (.pdf)</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleJSONExport} disabled={isLoading}>
          <FileJson className="h-4 w-4 mr-2" />
          <span>JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
