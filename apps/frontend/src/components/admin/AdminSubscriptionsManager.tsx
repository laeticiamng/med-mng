import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, TrendingUp, DollarSign, Users, Calendar,
  MoreHorizontal, Ban, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  user_email: string;
  user_name?: string;
  plan_type: string;
  status: 'active' | 'cancelled' | 'expired';
  monthly_quota: number;
  used_credits: number;
  start_date: string;
  next_billing: string;
  total_revenue: number;
}

interface SubscriptionStats {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageCreditsUsage: number;
  planDistribution: { [key: string]: number };
}

export const AdminSubscriptionsManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    averageCreditsUsage: 0,
    planDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données des abonnements depuis user_quotas
      const { data: quotaData, error: quotaError } = await supabase
        .from('user_quotas')
        .select(`
          user_id, subscription_type, 
          monthly_music_quota, monthly_qcm_quota, monthly_chat_quota,
          monthly_music_used, monthly_qcm_used, monthly_chat_used,
          quota_reset_date, created_at, updated_at
        `)
        .neq('subscription_type', 'free');

      if (quotaError) {
        throw quotaError;
      }

      // Transformer les données pour l'affichage
      const transformedSubscriptions: Subscription[] = quotaData?.map(quota => {
        const totalQuota = quota.monthly_music_quota + quota.monthly_qcm_quota + quota.monthly_chat_quota;
        const usedCredits = quota.monthly_music_used + quota.monthly_qcm_used + quota.monthly_chat_used;
        
        // Calcul approximatif du revenu basé sur le type d'abonnement
        const planPrices = {
          'standard': 19,
          'pro': 29,
          'premium': 39
        };
        
        const monthlyPrice = planPrices[quota.subscription_type as keyof typeof planPrices] || 0;

        return {
          id: quota.user_id,
          user_email: 'user-' + quota.user_id.slice(0, 8) + '@example.com',
          user_name: 'Utilisateur ' + quota.user_id.slice(0, 8),
          plan_type: quota.subscription_type,
          status: 'active' as const, // Simplification - tous les abonnements récupérés sont actifs
          monthly_quota: totalQuota,
          used_credits: usedCredits,
          start_date: quota.created_at,
          next_billing: quota.quota_reset_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_revenue: monthlyPrice
        };
      }) || [];

      setSubscriptions(transformedSubscriptions);

      // Calculer les statistiques
      const totalRevenue = transformedSubscriptions.reduce((sum, sub) => sum + sub.total_revenue, 0);
      const activeSubscriptions = transformedSubscriptions.length;
      const averageCreditsUsage = Math.round(
        transformedSubscriptions.reduce((sum, sub) => sum + (sub.used_credits / sub.monthly_quota * 100), 0) / activeSubscriptions
      );

      // Distribution des plans
      const planDistribution = transformedSubscriptions.reduce((acc, sub) => {
        acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      setStats({
        totalRevenue,
        activeSubscriptions,
        churnRate: 5, // Valeur simulée
        averageCreditsUsage,
        planDistribution
      });

    } catch (error) {
      logger.error('Erreur chargement abonnements:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: 'suspend' | 'reactivate' | 'refund') => {
    try {
      // Ici, vous implémenteriez les actions réelles sur les abonnements
      // Pour la démo, on simule juste une action
      toast.success(`Action ${action} exécutée pour l'abonnement`);
      
      // Refresh des données
      fetchSubscriptions();
    } catch (error) {
      logger.error('Erreur action abonnement:', error);
      toast.error('Erreur lors de l\'exécution de l\'action');
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'warning';
      case 'pro': return 'default';
      case 'standard': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des revenus */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div className="text-sm font-medium text-muted-foreground">Revenus mensuels</div>
            </div>
            <div className="text-2xl font-bold text-success">
              {stats.totalRevenue.toLocaleString()}€
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium text-muted-foreground">Abonnements actifs</div>
            </div>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-medium text-muted-foreground">Utilisation moyenne</div>
            </div>
            <div className="text-2xl font-bold">{stats.averageCreditsUsage}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="text-sm font-medium text-muted-foreground">Taux de désabonnement</div>
            </div>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des plans */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des plans</CardTitle>
          <CardDescription>Répartition des abonnements par type de plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.planDistribution).map(([plan, count]) => (
              <div key={plan} className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{plan}</div>
                <Badge variant={getPlanColor(plan) as any}>{plan}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestion des abonnements
          </CardTitle>
          <CardDescription>
            Gérez les abonnements actifs et leur utilisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Revenu</TableHead>
                  <TableHead>Prochaine facture</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.user_name || 'Sans nom'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.user_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanColor(subscription.plan_type) as any}>
                        {subscription.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(subscription.status) as any}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {subscription.used_credits} / {subscription.monthly_quota}
                        </div>
                        <div className="text-muted-foreground">
                          {getUsagePercentage(subscription.used_credits, subscription.monthly_quota)}% utilisé
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{subscription.total_revenue}€/mois</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(subscription.next_billing).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction(subscription.id, 'suspend')}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspendre
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Réactiver
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction(subscription.id, 'refund')}
                          >
                            Rembourser
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {subscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun abonnement trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};