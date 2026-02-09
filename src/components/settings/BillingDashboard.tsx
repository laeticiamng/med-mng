import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Receipt,
  TrendingUp,
  Crown,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionInfo {
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  invoiceUrl: string | null;
}

const PLAN_DETAILS: Record<string, { label: string; price: string; color: string }> = {
  gratuit: { label: 'Gratuit', price: '0\u20AC/mois', color: 'bg-muted text-muted-foreground' },
  standard: { label: 'Standard', price: '19\u20AC/mois', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  pro: { label: 'Pro', price: '29\u20AC/mois', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  premium: { label: 'Premium', price: '39\u20AC/mois', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
};

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Actif', variant: 'success' },
  canceled: { label: 'Annul\u00E9', variant: 'warning' },
  past_due: { label: 'Paiement en retard', variant: 'destructive' },
};

export const BillingDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageStats, setUsageStats] = useState<{ songsGenerated: number; sessionsThisMonth: number; storageUsedMB: number }>({
    songsGenerated: 0,
    sessionsThisMonth: 0,
    storageUsedMB: 0,
  });
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({ plan: 'gratuit', status: 'active', currentPeriodEnd: null, cancelAtPeriodEnd: false });
        setLoading(false);
        return;
      }

      // Fetch subscription info
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (subError) {
        console.error('Erreur lors de la r\u00E9cup\u00E9ration de l\u2019abonnement:', subError);
      }

      if (subData) {
        setSubscription({
          plan: subData.plan ?? 'gratuit',
          status: (subData.status as SubscriptionInfo['status']) ?? 'active',
          currentPeriodEnd: subData.current_period_end ?? null,
          cancelAtPeriodEnd: subData.cancel_at_period_end ?? false,
        });
      } else {
        setSubscription({ plan: 'gratuit', status: 'active', currentPeriodEnd: null, cancelAtPeriodEnd: false });
      }

      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (invoiceError) {
        console.error('Erreur lors de la r\u00E9cup\u00E9ration des factures:', invoiceError);
      }

      if (invoiceData) {
        setInvoices(
          invoiceData.map((inv: Record<string, unknown>) => ({
            id: inv.id as string,
            amount: (inv.amount as number) ?? 0,
            currency: (inv.currency as string) ?? 'eur',
            status: (inv.status as string) ?? 'unknown',
            date: (inv.created_at as string) ?? '',
            invoiceUrl: (inv.invoice_url as string) ?? null,
          }))
        );
      }

      // Fetch usage stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count: songsCount } = await supabase
        .from('generated_songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth);

      const { count: sessionsCount } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth);

      setUsageStats({
        songsGenerated: songsCount ?? 0,
        sessionsThisMonth: sessionsCount ?? 0,
        storageUsedMB: 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des donn\u00E9es de facturation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations de facturation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {},
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Aucune URL de portail re\u00E7ue.');
      }
    } catch (error) {
      console.error('Erreur portail client:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\u2019ouvrir le portail de gestion. Veuillez r\u00E9essayer.',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '\u2014';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Chargement des informations de facturation...</span>
      </div>
    );
  }

  const planKey = subscription?.plan?.toLowerCase() ?? 'gratuit';
  const planInfo = PLAN_DETAILS[planKey] ?? PLAN_DETAILS.gratuit;
  const statusInfo = STATUS_MAP[subscription?.status ?? 'active'] ?? STATUS_MAP.active;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Facturation</h2>
        <p className="text-muted-foreground">
          G\u00E9rez votre abonnement, consultez vos factures et suivez votre utilisation.
        </p>
      </div>

      {/* Abonnement actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Abonnement actuel
          </CardTitle>
          <CardDescription>D\u00E9tails de votre forfait et statut de l\u2019abonnement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${planInfo.color}`}>
                {planInfo.label}
              </span>
              <span className="text-lg font-medium text-muted-foreground">{planInfo.price}</span>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning-foreground">
              Votre abonnement sera annul\u00E9 \u00E0 la fin de la p\u00E9riode en cours.
            </div>
          )}

          {subscription?.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.cancelAtPeriodEnd
                  ? `Acc\u00E8s jusqu\u2019au ${formatDate(subscription.currentPeriodEnd)}`
                  : `Prochain renouvellement le ${formatDate(subscription.currentPeriodEnd)}`}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            {planKey !== 'gratuit' && (
              <Button onClick={handleManageSubscription} disabled={portalLoading} variant="outline">
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                G\u00E9rer l\u2019abonnement
              </Button>
            )}
            {planKey !== 'premium' && (
              <Button onClick={() => navigate('/med-mng/pricing')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {planKey === 'gratuit' ? 'Choisir un forfait' : 'Upgrade'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Utilisation ce mois-ci
          </CardTitle>
          <CardDescription>Suivi de votre consommation pour la p\u00E9riode en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{usageStats.songsGenerated}</p>
              <p className="text-sm text-muted-foreground mt-1">Morceaux g\u00E9n\u00E9r\u00E9s</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{usageStats.sessionsThisMonth}</p>
              <p className="text-sm text-muted-foreground mt-1">Sessions d\u2019\u00E9tude</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{usageStats.storageUsedMB}</p>
              <p className="text-sm text-muted-foreground mt-1">Mo de stockage utilis\u00E9s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
          <CardDescription>Vos derni\u00E8res factures et transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Aucune facture pour le moment.</p>
              {planKey === 'gratuit' && (
                <p className="text-sm mt-1">
                  Les factures appara\u00EEtront ici une fois que vous aurez souscrit \u00E0 un forfait payant.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'success'
                          : invoice.status === 'open'
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {invoice.status === 'paid'
                        ? 'Pay\u00E9e'
                        : invoice.status === 'open'
                          ? 'En attente'
                          : invoice.status === 'void'
                            ? 'Annul\u00E9e'
                            : invoice.status}
                    </Badge>
                    {invoice.invoiceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.invoiceUrl!, '_blank')}
                        aria-label="Voir la facture"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;
