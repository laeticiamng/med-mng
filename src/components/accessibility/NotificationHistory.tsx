import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, History, Send, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationHistoryItem {
  id: string;
  test_id: string | null;
  test_name: string | null;
  platform: 'slack' | 'discord';
  message_content: string;
  status: 'success' | 'failed' | 'pending';
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

export function NotificationHistory() {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistoryItem | null>(null);
  
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { _data, _error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (_error) throw _error;
      
      const typedData = (_data || []).map(item => ({
        ...item,
        platform: item.platform as 'slack' | 'discord',
        status: item.status as 'success' | 'failed' | 'pending',
      }));
      
      setHistory(typedData);
    } catch (error) {
      console.error('Error loading notification history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    if (filters.platform !== 'all') {
      filtered = filtered.filter(item => item.platform === filters.platform);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    setFilteredHistory(filtered);
  };

  const handleResend = async (notificationId: string) => {
    try {
      setResending(notificationId);
      
      const { _data, error } = await supabase.functions.invoke('resend-notification', {
        body: { notificationId },
      });

      if (error) throw error;

      if (_data?.success) {
        toast.success('Notification renvoyée avec succès');
        loadHistory();
      } else {
        toast.error(_data?.error || 'Échec du renvoi');
      }
    } catch (error: any) {
      console.error('Error resending notification:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setResending(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Succès</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Échec</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/20">En attente</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    total: history.length,
    success: history.filter(h => h.status === 'success').length,
    failed: history.filter(h => h.status === 'failed').length,
    pending: history.filter(h => h.status === 'pending').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des Notifications
            </CardTitle>
            <CardDescription>
              Suivez toutes vos notifications envoyées avec leur statut
            </CardDescription>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats.success}</p>
                <p className="text-sm text-muted-foreground">Succès</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Échecs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtres:</span>
          </div>
          <Select
            value={filters.platform}
            onValueChange={(value) => setFilters({ ...filters, platform: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes plateformes</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="discord">Discord</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="success">Succès</SelectItem>
              <SelectItem value="failed">Échec</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune notification {filters.platform !== 'all' || filters.status !== 'all' ? 'correspondante' : 'envoyée'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((notification) => (
              <Card key={notification.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(notification.status)}
                        <h3 className="font-semibold">{notification.test_name || 'Notification'}</h3>
                        {getStatusBadge(notification.status)}
                        <Badge variant="outline">
                          {notification.platform === 'slack' ? 'Slack' : 'Discord'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message_content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Envoyé: {format(new Date(notification.sent_at), 'Pp', { locale: fr })}
                        </span>
                        {notification.error_message && (
                          <span className="text-destructive">
                            Erreur: {notification.error_message.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setDetailsOpen(true);
                        }}
                      >
                        Détails
                      </Button>
                      {notification.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResend(notification.id)}
                          disabled={resending === notification.id}
                        >
                          {resending === notification.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Renvoyer
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog Détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la notification</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'envoi
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Test</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.test_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Plateforme</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedNotification.platform}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedNotification.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Date d'envoi</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedNotification.sent_at), 'PPpp', { locale: fr })}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Message</Label>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <pre className="whitespace-pre-wrap text-sm">
                    {selectedNotification.message_content}
                  </pre>
                </div>
              </div>

              {selectedNotification.error_message && (
                <div>
                  <Label className="text-sm font-semibold text-destructive">Message d'erreur</Label>
                  <div className="bg-destructive/10 p-4 rounded-lg mt-2 border border-destructive/20">
                    <pre className="whitespace-pre-wrap text-sm text-destructive">
                      {selectedNotification.error_message}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}>{children}</label>;
}
