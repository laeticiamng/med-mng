import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Eye, Mail, MousePointer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface EmailStat {
  id: string;
  email_id: string;
  recipient: string;
  subject: string;
  sent_at: string;
  opened_at: string | null;
  first_opened_at: string | null;
  open_count: number;
  clicked_at: string | null;
  click_count: number;
  bounced: boolean;
  complained: boolean;
  delivered_at: string | null;
}

interface StatsSummary {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplained: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export const EmailStatistics: React.FC = () => {
  const [stats, setStats] = useState<EmailStat[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('email_statistics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_statistics'
        } as any,
        () => {
          loadStatistics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadStatistics = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('email_statistics')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const emailStats = (data || []) as EmailStat[];
      setStats(emailStats);

      // Calculer le résumé
      const totalSent = emailStats.length;
      const totalOpened = emailStats.filter(s => s.opened_at).length;
      const totalClicked = emailStats.filter(s => s.clicked_at).length;
      const totalBounced = emailStats.filter(s => s.bounced).length;
      const totalComplained = emailStats.filter(s => s.complained).length;

      setSummary({
        totalSent,
        totalOpened,
        totalClicked,
        totalBounced,
        totalComplained,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading email statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const pieData = [
    { name: 'Ouverts', value: summary.totalOpened, color: 'hsl(var(--success))' },
    { name: 'Non ouverts', value: summary.totalSent - summary.totalOpened, color: 'hsl(var(--muted-foreground))' },
  ];

  const barData = [
    {
      name: 'Envoyés',
      value: summary.totalSent,
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Ouverts',
      value: summary.totalOpened,
      color: 'hsl(var(--success))'
    },
    {
      name: 'Cliqués',
      value: summary.totalClicked,
      color: 'hsl(var(--warning))'
    },
    {
      name: 'Bounces',
      value: summary.totalBounced,
      color: 'hsl(var(--destructive))'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Ouverture</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {summary.openRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalOpened} / {summary.totalSent} emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Clic</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {summary.clickRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalClicked} clics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Bounce</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {summary.bounceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalBounced} bounces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Envoyés</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {summary.totalSent}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total depuis le début
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Emails</CardTitle>
            <CardDescription>Emails ouverts vs non ouverts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques Détaillées</CardTitle>
            <CardDescription>Vue d'ensemble des métriques</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Liste des emails récents */}
      <Card>
        <CardHeader>
          <CardTitle>Emails Récents</CardTitle>
          <CardDescription>20 derniers emails envoyés avec leurs statistiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.slice(0, 20).map((stat) => (
              <div
                key={stat.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{stat.subject}</div>
                  <div className="text-xs text-muted-foreground">{stat.recipient}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Envoyé: {new Date(stat.sent_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stat.opened_at ? (
                    <Badge variant="default" className="bg-success hover:bg-success/90">
                      <Eye className="h-3 w-3 mr-1" />
                      {stat.open_count}x
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Non ouvert</Badge>
                  )}
                  {stat.clicked_at && (
                    <Badge variant="default" className="bg-warning hover:bg-warning/90 text-warning-foreground">
                      <MousePointer className="h-3 w-3 mr-1" />
                      {stat.click_count}x
                    </Badge>
                  )}
                  {stat.bounced && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Bounce
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
