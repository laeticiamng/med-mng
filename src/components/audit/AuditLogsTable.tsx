import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const actionColors = {
  view: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  create: 'bg-green-500/10 text-green-700 dark:text-green-300',
  update: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  delete: 'bg-red-500/10 text-red-700 dark:text-red-300',
  access: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
};

export function AuditLogsTable() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useAuditLogs({ 
    days: 90,
    limit: 500,
    ...(actionFilter !== 'all' && { action: actionFilter }),
    ...(resourceTypeFilter !== 'all' && { resourceType: resourceTypeFilter }),
  });

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(search) ||
      log.resource_id?.toLowerCase().includes(search) ||
      log.resource_type?.toLowerCase().includes(search) ||
      log.ip_address?.toLowerCase().includes(search)
    );
  });

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Action',
      'Utilisateur',
      'Type de ressource',
      'ID Ressource',
      'IP',
      'User Agent'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.user_email || 'Anonyme',
        log.resource_type,
        log.resource_id,
        log.ip_address || '',
        `"${log.user_agent || ''}"` // Quotes for user agent to handle commas
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs d'audit détaillés</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur, IP, ressource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="view">Consultation</SelectItem>
              <SelectItem value="create">Création</SelectItem>
              <SelectItem value="update">Modification</SelectItem>
              <SelectItem value="delete">Suppression</SelectItem>
              <SelectItem value="access">Accès</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type de ressource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ressources</SelectItem>
              <SelectItem value="sitemap">Sitemap</SelectItem>
              <SelectItem value="share">Partage</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredLogs.length} résultat{filteredLogs.length > 1 ? 's' : ''}
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Ressource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun log trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action as keyof typeof actionColors]}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {log.user_email || 'Anonyme'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{log.resource_type}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {log.resource_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{log.ip_address || '-'}</code>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-primary hover:underline">
                            Voir détails
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-muted rounded max-w-[300px] overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
