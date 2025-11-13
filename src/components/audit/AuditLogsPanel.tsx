import React, { useState } from 'react';
import { useAuditLogs, type AuditLog } from '@/hooks/useAuditLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck, Eye, Edit, Trash2, UserPlus, Calendar, User, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogsPanelProps {
  resourceId?: string;
  resourceType?: string;
  className?: string;
}

const actionIcons = {
  view: Eye,
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  access: ShieldCheck,
};

const actionColors = {
  view: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  create: 'bg-green-500/10 text-green-700 dark:text-green-300',
  update: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  delete: 'bg-red-500/10 text-red-700 dark:text-red-300',
  access: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
};

const actionLabels = {
  view: 'Consultation',
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  access: 'Accès',
};

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({
  resourceId,
  resourceType,
  className,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchUser, setSearchUser] = useState('');
  const [days, setDays] = useState<number>(30);

  const { data: logs, isLoading } = useAuditLogs({
    resourceId,
    resourceType,
    action: filterAction !== 'all' ? filterAction : undefined,
    days,
  });

  const filteredLogs = logs?.filter((log) =>
    searchUser === '' ||
    log.user_email?.toLowerCase().includes(searchUser.toLowerCase())
  ) || [];

  const renderDetails = (log: AuditLog) => {
    if (!log.details) return null;

    return (
      <div className="mt-2 text-sm text-muted-foreground">
        {log.action === 'update' && log.details.old_permission && log.details.new_permission && (
          <span>
            Permission: <span className="font-medium">{log.details.old_permission}</span> → <span className="font-medium">{log.details.new_permission}</span>
          </span>
        )}
        {log.action === 'create' && log.details.permission && (
          <span>
            Permission: <span className="font-medium">{log.details.permission}</span>
          </span>
        )}
        {log.action === 'delete' && log.details.permission && (
          <span>
            Ancienne permission: <span className="font-medium">{log.details.permission}</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Journal d'audit
        </CardTitle>
        <CardDescription>
          Historique des actions effectuées sur les données partagées (rétention: 90 jours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Action" />
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

            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Logs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune activité enregistrée</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action as keyof typeof actionIcons] || FileText;
                  const colorClass = actionColors[log.action as keyof typeof actionColors] || 'bg-gray-500/10 text-gray-700';
                  const actionLabel = actionLabels[log.action as keyof typeof actionLabels] || log.action;

                  return (
                    <div
                      key={log.id}
                      className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-normal">
                            {actionLabel}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            {log.resource_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            {log.user_email || 'Utilisateur inconnu'}
                          </span>
                        </div>
                        {renderDetails(log)}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
