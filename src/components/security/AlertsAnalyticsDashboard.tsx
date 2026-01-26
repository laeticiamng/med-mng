import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowDown, ArrowUp, Calendar, Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--chart-4))',
  'hsl(var(--primary))'
];

type PeriodFilter = '7d' | '30d' | '90d';

export const AlertsAnalyticsDashboard = () => {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const dashboardRef = useRef<HTMLDivElement>(null);

  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);

  // Période de comparaison (période précédente)
  const comparisonCutoffDate = new Date(cutoffDate);
  comparisonCutoffDate.setDate(comparisonCutoffDate.getDate() - periodDays);

  const { data: alerts } = useQuery({
    queryKey: ['unified-alerts-analytics', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_alerts')
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: comparisonAlerts } = useQuery({
    queryKey: ['unified-alerts-comparison', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_alerts')
        .select('*')
        .gte('created_at', comparisonCutoffDate.toISOString())
        .lt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: scoreHistory } = useQuery({
    queryKey: ['alert-score-history', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_score_history')
        .select('*')
        .gte('calculated_at', cutoffDate.toISOString())
        .order('calculated_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Statistiques de comparaison
  const currentCount = alerts?.length || 0;
  const previousCount = comparisonAlerts?.length || 0;
  const countChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

  const currentAvgScore = alerts?.reduce((sum, a) => sum + (a.unified_score || 0), 0) / (currentCount || 1);
  const previousAvgScore = comparisonAlerts?.reduce((sum, a) => sum + (a.unified_score || 0), 0) / (previousCount || 1);
  const scoreChange = previousAvgScore > 0 ? ((currentAvgScore - previousAvgScore) / previousAvgScore) * 100 : 0;

  const currentCritical = alerts?.filter(a => a.severity === 'critical').length || 0;
  const previousCritical = comparisonAlerts?.filter(a => a.severity === 'critical').length || 0;
  const criticalChange = previousCritical > 0 ? ((currentCritical - previousCritical) / previousCritical) * 100 : 0;

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
    { name: 'Critique', value: alerts?.filter(a => a.severity === 'critical').length || 0, color: COLORS[0] },
    { name: 'Élevée', value: alerts?.filter(a => a.severity === 'high').length || 0, color: COLORS[1] },
    { name: 'Moyenne', value: alerts?.filter(a => a.severity === 'medium').length || 0, color: COLORS[2] },
    { name: 'Faible', value: alerts?.filter(a => a.severity === 'low').length || 0, color: COLORS[3] },
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

  // Export PDF avec graphiques
  const exportToPDF = async () => {
    if (!dashboardRef.current) {
      toast.error('Dashboard non disponible');
      return;
    }

    toast.info('Génération du PDF en cours...');

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Ajouter le titre
      pdf.setFontSize(16);
      pdf.text('Rapport Analytics - Alertes Unifiées', 105, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Période: ${periodDays} derniers jours`, 105, 22, { align: 'center' });
      pdf.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 105, 27, { align: 'center' });

      position = 35;

      // Ajouter le graphique
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height - position;

      // Ajouter des pages si nécessaire
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height;
      }

      pdf.save(`rapport-alertes-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Export PDF réussi');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const renderComparisonBadge = (change: number) => {
    const isPositive = change > 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    const colorClass = isPositive ? 'text-destructive' : 'text-success';
    
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
        <Icon className="h-4 w-4" />
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics & Tendances
              </CardTitle>
              <CardDescription>Analyse historique des alertes unifiées avec comparaison période</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  onClick={() => setPeriod('7d')}
                  variant={period === '7d' ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  7j
                </Button>
                <Button
                  onClick={() => setPeriod('30d')}
                  variant={period === '30d' ? 'default' : 'ghost'}
                  size="sm"
                >
                  30j
                </Button>
                <Button
                  onClick={() => setPeriod('90d')}
                  variant={period === '90d' ? 'default' : 'ghost'}
                  size="sm"
                >
                  90j
                </Button>
              </div>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cartes de comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Alertes</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{currentCount}</CardTitle>
              {renderComparisonBadge(countChange)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousCount} période précédente
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Score Moyen</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{currentAvgScore.toFixed(1)}</CardTitle>
              {renderComparisonBadge(scoreChange)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousAvgScore.toFixed(1)} période précédente
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Alertes Critiques</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl text-destructive">{currentCritical}</CardTitle>
              {renderComparisonBadge(criticalChange)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousCritical} période précédente
            </p>
          </CardHeader>
        </Card>
      </div>

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
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="hsl(var(--chart-5))" name="Nombre" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="hsl(var(--warning))" name="Score Moyen" />
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
                  fill="hsl(var(--chart-1))"
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
                <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-5))" name="Score Unifié" strokeWidth={2} />
                <Line type="monotone" dataKey="pagerduty" stroke="hsl(var(--destructive))" name="PagerDuty" />
                <Line type="monotone" dataKey="cvss" stroke="hsl(var(--primary))" name="CVSS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
