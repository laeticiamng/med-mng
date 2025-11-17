/**
 * Export accessibility metrics to CSV format
 * @param metrics - Metrics data to export
 */
export function exportMetricsToCSV(metrics: any): void {
  try {
    const csvData = convertMetricsToCSV(metrics);
    downloadFile(csvData, 'accessibility-metrics.csv', 'text/csv');
  } catch (error) {
    console.error('Failed to export metrics to CSV:', error);
    throw new Error('Failed to export metrics to CSV');
  }
}

/**
 * Export accessibility metrics to JSON format
 * @param metrics - Metrics data to export
 */
export function exportMetricsToJSON(metrics: any): void {
  try {
    const jsonData = JSON.stringify(metrics, null, 2);
    downloadFile(jsonData, 'accessibility-metrics.json', 'application/json');
  } catch (error) {
    console.error('Failed to export metrics to JSON:', error);
    throw new Error('Failed to export metrics to JSON');
  }
}

/**
 * Export summary to CSV format
 * @param metrics - Metrics data to summarize and export
 */
export function exportSummaryToCSV(metrics: any): void {
  try {
    const summary = generateSummary(metrics);
    const csvData = convertSummaryToCSV(summary);
    downloadFile(csvData, 'accessibility-summary.csv', 'text/csv');
  } catch (error) {
    console.error('Failed to export summary to CSV:', error);
    throw new Error('Failed to export summary to CSV');
  }
}

/**
 * Generate monthly report
 * @param metrics - Metrics data for the month
 */
export function exportMonthlyReport(metrics: any): void {
  try {
    const report = generateMonthlyReport(metrics);
    const csvData = convertReportToCSV(report);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csvData, `accessibility-report-${date}.csv`, 'text/csv');
  } catch (error) {
    console.error('Failed to export monthly report:', error);
    throw new Error('Failed to export monthly report');
  }
}

// Helper functions
function convertMetricsToCSV(metrics: any): string {
  const headers = ['Metric', 'Value', 'Status', 'Date'];
  const rows = [headers.join(',')];

  if (metrics && typeof metrics === 'object') {
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        rows.push(`${key},${JSON.stringify(value)},Active,${new Date().toISOString()}`);
      } else {
        rows.push(`${key},${value},Active,${new Date().toISOString()}`);
      }
    });
  }

  return rows.join('\n');
}

function convertSummaryToCSV(summary: any): string {
  const headers = ['Category', 'Count', 'Percentage'];
  const rows = [headers.join(',')];

  Object.entries(summary).forEach(([key, value]) => {
    rows.push(`${key},${value},N/A`);
  });

  return rows.join('\n');
}

function convertReportToCSV(report: any): string {
  const headers = ['Date', 'Total Issues', 'Critical', 'High', 'Medium', 'Low'];
  const rows = [headers.join(',')];

  if (Array.isArray(report)) {
    report.forEach((item) => {
      rows.push(`${item.date || 'N/A'},${item.total || 0},${item.critical || 0},${item.high || 0},${item.medium || 0},${item.low || 0}`);
    });
  }

  return rows.join('\n');
}

function generateSummary(metrics: any): any {
  return {
    totalMetrics: Object.keys(metrics).length,
    timestamp: new Date().toISOString(),
    ...metrics,
  };
}

function generateMonthlyReport(metrics: any): any[] {
  return [{
    date: new Date().toISOString().split('T')[0],
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    ...metrics,
  }];
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
