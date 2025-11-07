import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export const AlertsAnalyticsDashboard = () => {
  const { data: alerts } = useQuery({
    queryKey: ['unified-alerts-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: scoreHistory } = useQuery({
    queryKey: ['alert-score-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_score_history')
        .select('*')
        .order('calculated_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Données pour graphique temporel
  const timelineData = alerts?.reduce((acc: any[], alert) => {
    const date = new Date(alert.created_at).toLocaleDateString('fr-FR');
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count++;
      existing.avgScore = (existing.avgScore + (alert.unified_score || 0)) / 2;
    } else {
      acc.push({ date, count: 1, avgScore: alert.unified_score || 0 });
    }
    return acc;
  }, []) || [];

  // Données par sévérité
  const severityData = [
    { name: 'Critique', value: alerts?.filter(a => a.severity === 'critical').length || 0, color: '#ef4444' },
    { name: 'Élevée', value: alerts?.filter(a => a.severity === 'high').length || 0, color: '#f97316' },
    { name: 'Moyenne', value: alerts?.filter(a => a.severity === 'medium').length || 0, color: '#eab308' },
    { name: 'Faible', value: alerts?.filter(a => a.severity === 'low').length || 0, color: '#3b82f6' },
  ];

  // Évolution des scores
  const scoreEvolution = scoreHistory?.map(h => ({
    date: new Date(h.calculated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    score: h.unified_score,
    pagerduty: h.pagerduty_score,
    cvss: h.cvss_normalized_score,
  })) || [];

  // Export Excel
  const exportToExcel = () => {
    if (!alerts || alerts.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      alerts.map(a => ({
        'ID Externe': a.external_id,
        'Source': a.source,
        'Sévérité': a.severity,
        'Titre': a.title,
        'Score Unifié': a.unified_score,
        'Score CVSS': a.cvss_score,
        'Occurrences': a.occurrence_count,
        'Statut': a.status,
        'Créé le': new Date(a.created_at).toLocaleString('fr-FR'),
        'URL': a.url,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alertes');
    XLSX.writeFile(workbook, `alertes-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel réussi');
  };

  // Export CSV
  const exportToCSV = () => {
    if (!alerts || alerts.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID Externe', 'Source', 'Sévérité', 'Titre', 'Score Unifié', 'Score CVSS', 'Occurrences', 'Statut', 'Créé le', 'URL'];
    const rows = alerts.map(a => [
      a.external_id,
      a.source,
      a.severity,
      a.title,
      a.unified_score,
      a.cvss_score || '',
      a.occurrence_count,
      a.status,
      new Date(a.created_at).toLocaleString('fr-FR'),
      a.url || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alertes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics & Tendances
              </CardTitle>
              <CardDescription>Analyse historique des alertes unifiées</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution Temporelle</CardTitle>
            <CardDescription>Nombre d'alertes et score moyen par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8b5cf6" name="Nombre" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#f59e0b" name="Score Moyen" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution par Sévérité</CardTitle>
            <CardDescription>Répartition des alertes actives</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des Scores (Dernières 100 entrées)</CardTitle>
            <CardDescription>Décomposition par facteur de scoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Score Unifié" strokeWidth={2} />
                <Line type="monotone" dataKey="pagerduty" stroke="#ef4444" name="PagerDuty" />
                <Line type="monotone" dataKey="cvss" stroke="#3b82f6" name="CVSS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
