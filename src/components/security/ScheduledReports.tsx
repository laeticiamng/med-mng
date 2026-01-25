import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Mail, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  last_sent_at?: string;
  next_scheduled_at?: string;
  enabled: boolean;
}

export const ScheduledReports = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [email, setEmail] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  // Fetch scheduled reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (_error) throw _error;
      return (_data || []) as ScheduledReport[];
    },
  });

  // Create scheduled report
  const createReport = useMutation({
    mutationFn: async (data: { reportType: string; recipients: string[] }) => {
      const nextScheduled = getNextScheduledDate(data.reportType);
      
      const { _error } = await supabase
        .from('scheduled_reports')
        .insert({
          report_type: data.reportType,
          recipients: data.recipients,
          next_scheduled_at: nextScheduled.toISOString(),
          enabled: true,
        } as any);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Rapport planifié créé');
      setDialogOpen(false);
      setRecipients([]);
      setEmail('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  // Delete scheduled report
  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { _error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Rapport supprimé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Send report now
  const sendReport = useMutation({
    mutationFn: async (reportType: string) => {
      const { error } = await supabase.functions.invoke('send-scheduled-reports', {
        body: { reportType },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rapport envoyé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    },
  });

  function getNextScheduledDate(reportType: string): Date {
    const now = new Date();
    switch (reportType) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  const addRecipient = () => {
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setEmail('');
    }
  };

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter(e => e !== emailToRemove));
  };

  const handleCreate = () => {
    if (recipients.length === 0) {
      toast.error('Ajoutez au moins un destinataire');
      return;
    }
    createReport.mutate({ reportType, recipients });
  };
  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'daily': return <Badge>Quotidien</Badge>;
      case 'weekly': return <Badge variant="secondary">Hebdomadaire</Badge>;
      case 'monthly': return <Badge variant="outline">Mensuel</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rapports Planifiés</CardTitle>
              <CardDescription>
                Configuration des rapports de sécurité automatiques par email
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rapport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun rapport planifié configuré</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier rapport
                </Button>
              </div>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getReportTypeBadge(report.report_type)}
                          <Badge variant={report.enabled ? 'default' : 'outline'}>
                            {report.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {report.recipients.length} destinataire{report.recipients.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReport.mutate(report.report_type)}
                          disabled={sendReport.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Envoyer Maintenant
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport.mutate(report.id)}
                          disabled={deleteReport.isPending}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {report.recipients.map((recipient) => (
                        <Badge key={recipient} variant="secondary">
                          {recipient}
                        </Badge>
                      ))}
                    </div>

                    {report.last_sent_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Dernier envoi: {new Date(report.last_sent_at).toLocaleString('fr-FR')}
                      </div>
                    )}

                    {report.next_scheduled_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Prochain envoi: {new Date(report.next_scheduled_at).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un Rapport Planifié</DialogTitle>
            <DialogDescription>
              Configurez un rapport de sécurité automatique envoyé par email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fréquence</Label>
              <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien (tous les jours)</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire (toutes les semaines)</SelectItem>
                  <SelectItem value="monthly">Mensuel (tous les mois)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destinataires</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <Button onClick={addRecipient} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((recipient) => (
                    <Badge key={recipient} variant="secondary" className="gap-2">
                      {recipient}
                      <button
                        onClick={() => removeRecipient(recipient)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createReport.isPending}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
