import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// TODO: These types should be defined in shared package or imported from frontend
// import type { SecurityNotification } from '@/hooks/useRealtimeNotifications';
// import type { NotificationFilters } from '@/components/security/SecurityNotificationsFilters';

export const exportNotificationsToPDF = async (
  notifications: any[], // SecurityNotification[]
  filters: any // NotificationFilters
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(67, 56, 202); // Primary color
  doc.text('Rapport de Sécurité', 14, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le ${format(new Date(), 'Pp', { locale: fr })}`, 14, 28);
  
  // Add filters summary
  let yPosition = 38;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Filtres appliqués:', 14, yPosition);
  
  yPosition += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  const filterSummary: string[] = [];
  if (filters.severity !== 'all') filterSummary.push(`Sévérité: ${filters.severity}`);
  if (filters.type !== 'all') filterSummary.push(`Type: ${getTypeLabel(filters.type)}`);
  if (filters.searchTerm) filterSummary.push(`Recherche: "${filters.searchTerm}"`);
  if (filters.userEmail) filterSummary.push(`Utilisateur: ${filters.userEmail}`);
  if (filters.dateFrom) filterSummary.push(`Du: ${format(filters.dateFrom, 'P', { locale: fr })}`);
  if (filters.dateTo) filterSummary.push(`Au: ${format(filters.dateTo, 'P', { locale: fr })}`);
  
  if (filterSummary.length === 0) {
    doc.text('Aucun filtre appliqué', 14, yPosition);
    yPosition += 6;
  } else {
    filterSummary.forEach((filter) => {
      doc.text(`• ${filter}`, 14, yPosition);
      yPosition += 5;
    });
  }
  
  yPosition += 5;
  
  // Add summary statistics
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Statistiques:', 14, yPosition);
  
  yPosition += 6;
  doc.setFontSize(9);
  
  const criticalCount = notifications.filter(n => n.severity === 'critical').length;
  const warningCount = notifications.filter(n => n.severity === 'warning').length;
  const infoCount = notifications.filter(n => n.severity === 'info').length;

  // Count by type
  const massDeletionCount = notifications.filter(n => n.type === 'mass_deletion').length;
  const unauthorizedCount = notifications.filter(n => n.type === 'unauthorized_access').length;
  const suspiciousCount = notifications.filter(n => n.type === 'suspicious_activity').length;
  const systemCount = notifications.filter(n => n.type === 'system_alert').length;
  
  doc.text(`Total de notifications: ${notifications.length}`, 14, yPosition);
  yPosition += 5;
  doc.setTextColor(220, 38, 38); // Red for critical
  doc.text(`• Critiques: ${criticalCount}`, 20, yPosition);
  yPosition += 5;
  doc.setTextColor(234, 88, 12); // Orange for warning
  doc.text(`• Warnings: ${warningCount}`, 20, yPosition);
  yPosition += 5;
  doc.setTextColor(59, 130, 246); // Blue for info
  doc.text(`• Info: ${infoCount}`, 20, yPosition);
  
  yPosition += 10;
  
  // Reset color
  doc.setTextColor(0, 0, 0);

  // Add note about charts
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('📊 Graphiques interactifs disponibles dans le dashboard en ligne', 14, yPosition);
  yPosition += 8;
  
  // Create table data
  const tableData = notifications.map((notification) => [
    format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
    getSeverityLabel(notification.severity),
    getTypeLabel(notification.type),
    notification.title,
    notification.message.substring(0, 100) + (notification.message.length > 100 ? '...' : ''),
  ]);
  
  // Add table
  autoTable(doc, {
    startY: yPosition,
    head: [['Date', 'Sévérité', 'Type', 'Titre', 'Message']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [67, 56, 202], // Primary color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Date
      1: { cellWidth: 20 }, // Severity
      2: { cellWidth: 35 }, // Type
      3: { cellWidth: 40 }, // Title
      4: { cellWidth: 65 }, // Message
    },
    didDrawCell: (data) => {
      // Color code severity column
      if (data.column.index === 1 && data.cell.section === 'body') {
        const severity = notifications[data.row.index].severity;
        let color: [number, number, number];
        
        if (severity === 'critical') {
          color = [220, 38, 38]; // Red
        } else if (severity === 'warning') {
          color = [234, 88, 12]; // Orange
        } else {
          color = [59, 130, 246]; // Blue
        }
        
        doc.setTextColor(...color);
        doc.text(
          data.cell.text[0],
          data.cell.x + 2,
          data.cell.y + data.cell.height / 2 + 2
        );
        doc.setTextColor(0, 0, 0);
      }
    },
  });
  
  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    
    // Add confidential notice
    doc.text(
      'Document confidentiel - Rapport de sécurité',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // If there are detailed notifications, add a detailed section
  if (notifications.length > 0 && notifications.length <= 50) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(67, 56, 202);
    doc.text('Détails des Notifications', 14, 20);
    
    let detailY = 30;
    
    notifications.slice(0, 50).forEach((notification, index) => {
      // Check if we need a new page
      if (detailY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        detailY = 20;
      }
      
      // Notification header
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${notification.title}`, 14, detailY);
      detailY += 6;
      
      // Details
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      const details = [
        `Date: ${format(new Date(notification.created_at), 'Pp', { locale: fr })}`,
        `Sévérité: ${getSeverityLabel(notification.severity)}`,
        `Type: ${getTypeLabel(notification.type)}`,
        `Message: ${notification.message}`,
      ];
      
      details.forEach((detail) => {
        const lines = doc.splitTextToSize(detail, doc.internal.pageSize.width - 28);
        lines.forEach((line: string) => {
          doc.text(line, 18, detailY);
          detailY += 4;
        });
      });
      
      if (notification.details) {
        doc.text('Détails techniques:', 18, detailY);
        detailY += 4;
        const detailsStr = JSON.stringify(notification.details, null, 2);
        const detailLines = doc.splitTextToSize(detailsStr, doc.internal.pageSize.width - 32);
        detailLines.slice(0, 10).forEach((line: string) => { // Limit to 10 lines
          doc.setFontSize(7);
          doc.text(line, 22, detailY);
          detailY += 3;
        });
      }
      
      detailY += 8; // Space between notifications
    });
  }
  
  // Save the PDF
  const fileName = `rapport-securite-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
};

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'CRITIQUE';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
    default:
      return severity;
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'mass_deletion':
      return 'Suppression massive';
    case 'unauthorized_access':
      return 'Accès non autorisé';
    case 'suspicious_activity':
      return 'Activité suspecte';
    case 'system_alert':
      return 'Alerte système';
    default:
      return type;
  }
}
