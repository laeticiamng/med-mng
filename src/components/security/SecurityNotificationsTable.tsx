import { useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SecurityNotification } from '@/hooks/useRealtimeNotifications';
import type { NotificationFilters } from './SecurityNotificationsFilters';
import { SecurityNotificationsFilters } from './SecurityNotificationsFilters';
import { exportNotificationsToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 20;

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive">Critique</Badge>;
    case 'warning':
      return <Badge className="bg-orange-500">Warning</Badge>;
    case 'info':
      return <Badge variant="secondary">Info</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

const getTypeBadge = (type: string) => {
  const typeLabels: Record<string, { label: string; variant: string }> = {
    mass_deletion: { label: '🗑️ Suppression massive', variant: 'destructive' },
    unauthorized_access: { label: '🚫 Accès non autorisé', variant: 'default' },
    suspicious_activity: { label: '⚠️ Activité suspecte', variant: 'secondary' },
    system_alert: { label: '🔔 Alerte système', variant: 'outline' },
  };

  const typeInfo = typeLabels[type] || { label: type, variant: 'outline' };
  return <Badge variant={typeInfo.variant as any}>{typeInfo.label}</Badge>;
};

export const SecurityNotificationsTable = () => {
  const { notifications } = useRealtimeNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({
    severity: 'all',
    type: 'all',
    searchTerm: '',
    dateFrom: undefined,
    dateTo: undefined,
    userEmail: '',
  });

  // Apply filters
  const filteredNotifications = notifications.filter((notification) => {
    // Severity filter
    if (filters.severity !== 'all' && notification.severity !== filters.severity) {
      return false;
    }

    // Type filter
    if (filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(search) &&
        !notification.message.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    // User email filter
    if (filters.userEmail) {
      const userSearch = filters.userEmail.toLowerCase();
      // Search in related_user_id or details
      const hasUserMatch =
        notification.related_user_id?.toLowerCase().includes(userSearch) ||
        (notification.details && 
          JSON.stringify(notification.details).toLowerCase().includes(userSearch));
      
      if (!hasUserMatch) {
        return false;
      }
    }

    // Date range filter
    const notificationDate = new Date(notification.created_at);
    if (filters.dateFrom && notificationDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (notificationDate > endOfDay) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleExportPDF = async () => {
    try {
      await exportNotificationsToPDF(filteredNotifications, filters);
      toast.success('Rapport PDF généré avec succès');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  // Reset page when filters change
  const handleFiltersChange = (newFilters: NotificationFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <SecurityNotificationsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExportPDF={handleExportPDF}
        resultsCount={filteredNotifications.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Historique des Notifications de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune notification trouvée avec ces filtres</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(notification.created_at), 'Pp', { locale: fr })}
                      </TableCell>
                      <TableCell>{getSeverityBadge(notification.severity)}</TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        {notification.details && (
                          <details className="cursor-pointer">
                            <summary className="text-sm text-primary hover:underline">
                              Voir détails
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(notification.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
