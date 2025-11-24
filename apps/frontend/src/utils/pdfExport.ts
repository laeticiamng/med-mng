import logger from '@/lib/logger';

/**
 * Security notification type
 */
export interface SecurityNotification {
  id: string;
  title: string;
  severity: string;
  description?: string;
  date?: string;
  status?: string;
  category?: string;
}

/**
 * Export security notifications to PDF
 * 📊 PERFORMANCE: Dynamic import - jsPDF loaded only when needed (~170 KB saved from initial bundle)
 * @param notifications - Array of security notifications to export
 */
export async function exportNotificationsToPDF(notifications: SecurityNotification[]): Promise<void> {
  try {
    // Lazy load PDF library (586 KB chunk)
    const [{ default: jsPDF }, _] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'), // Auto-extends jsPDF prototype
    ]);

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Security Notifications Report', 14, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    // Prepare table data
    const tableData = notifications.map((notification) => [
      notification.id || 'N/A',
      notification.title || 'N/A',
      notification.severity || 'N/A',
      notification.status || 'N/A',
      notification.date ? new Date(notification.date).toLocaleDateString() : 'N/A',
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['ID', 'Title', 'Severity', 'Status', 'Date']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
      },
    });

    // Add summary at the bottom
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Notifications: ${notifications.length}`, 14, finalY);

    // Count by severity
    const severityCounts: Record<string, number> = {};
    notifications.forEach((n) => {
      const severity = n.severity || 'Unknown';
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });

    let yOffset = finalY + 6;
    Object.entries(severityCounts).forEach(([severity, count]) => {
      doc.text(`${severity}: ${count}`, 14, yOffset);
      yOffset += 6;
    });

    // Save the PDF
    doc.save(`security-notifications-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    logger.error('Failed to export notifications to PDF:', error);
    throw new Error('Failed to export notifications to PDF');
  }
}
