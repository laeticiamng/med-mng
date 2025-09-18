import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { describeRateLimitError } from "@/utils/errors/rateLimit";
import { toast } from "sonner";
import { type AnalyticsDashboardPayload } from '@/hooks/analytics/useAnalyticsDashboard';
import { formatCanonicalEventLabel, getCanonicalEventColor } from '@/constants/canonicalAnalytics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, RefreshCw, Download, Calendar } from "lucide-react";

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
  });
};

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-engine', {
        body: { timeframe },
      });

      if (error) {
        const rateLimit = describeRateLimitError(error, "Tableau de bord indisponible pour le moment.");
        if (rateLimit.isRateLimited) {
          toast.warning(rateLimit.message);
          return;
        }
        throw error;
      }

      const payload = (data?.metrics ?? null) as AnalyticsDashboardPayload | null;
      setAnalytics(payload);
      setLastUpdate(data?.generated_at ? new Date(data.generated_at) : new Date());
      if (payload) {
        toast.success(`Analytics mises à jour (${timeframe})`);
      } else {
        toast.info('Aucune donnée analytics disponible sur la période');
      }
    } catch (err) {
      console.error('Erreur analytics:', err);
      toast.error('Erreur lors de la récupération des analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const exportAnalytics = () => {
    if (!analytics) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canonical-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export du dashboard généré');
  };

  const getEventCount = (eventType: string) =>
    analytics?.event_breakdown?.find((entry) => entry.event_type === eventType)?.count ?? 0;

  const totalEvents = analytics?.event_breakdown?.reduce((sum, entry) => sum + entry.count, 0) ?? 0;
  const generationSuccess = getEventCount('generate_success');
  const generationFailures = getEventCount('generate_fail');
  const syncFailures = getEventCount('sync_fail');
  const studySessions = getEventCount('study_start');

  const successRate = generationSuccess + generationFailures > 0
    ? Math.round((generationSuccess / (generationSuccess + generationFailures)) * 100)
    : null;

  const breakdownChartData = analytics?.event_breakdown ?? [];

  const topEventTypes = useMemo(() => {
    if (!analytics) return [] as string[];
    return [...analytics.event_breakdown]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((entry) => entry.event_type);
  }, [analytics]);

  const timeseriesData = useMemo(() => {
    if (!analytics) return [] as Array<Record<string, number | string>>;

    const map = new Map<string, Record<string, number | string>>();
    analytics.timeseries.forEach(({ bucket, event_type, count }) => {
      const key = new Date(bucket).toISOString();
      if (!map.has(key)) {
        map.set(key, { bucket: key });
      }
      map.get(key)![event_type] = count;
    });

    const sorted = Array.from(map.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([, value]) => value);

    return sorted;
  }, [analytics]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className={`h-8 w-8 mx-auto mb-4 ${loading ? 'animate-spin' : ''}`} />
          <p>
            {loading ? 'Chargement des analytics canoniques...' : 'Aucune donnée analytics disponible sur cette période.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard analytics canonique</h2>
          <p className="text-muted-foreground">
            Événements normalisés pour suivre génération musicale, EDN et séances.
          </p>
          {lastUpdate ? (
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Mise à jour&nbsp;: {lastUpdate.toLocaleString('fr-FR')}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(event) => setTimeframe(event.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">24h</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
          <Button onClick={fetchAnalytics} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Événements totaux</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Tous événements opt-in sur la période</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Générations réussies</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{generationSuccess}</div>
            <p className="text-xs text-muted-foreground">
              {successRate !== null
                ? `${successRate}% de réussite (${generationFailures} échecs)`
                : 'Aucune génération enregistrée'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Sync EDN en erreur</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{syncFailures}</div>
            <p className="text-xs text-muted-foreground">Sur {getEventCount('sync_success')} synchronisations réussies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-indigo-600">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Séances 8 minutes lancées</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{studySessions}</div>
            <p className="text-xs text-muted-foreground">Événements study_start opt-in</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Répartition par type d’événement</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="event_type" tickFormatter={formatCanonicalEventLabel} angle={-30} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number, name: string) => [value, formatCanonicalEventLabel(name)]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {breakdownChartData.map((entry, index) => (
                    <Cell key={entry.event_type} fill={getCanonicalEventColor(entry.event_type, index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Chronologie des événements majeurs</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseriesData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="bucket" tickFormatter={formatDateLabel} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) => formatDateLabel(value as string)}
                  formatter={(value: number, name: string) => [value, formatCanonicalEventLabel(name)]}
                />
                <Legend formatter={(value) => formatCanonicalEventLabel(value as string)} />
                {topEventTypes.map((eventType, index) => (
                  <Line
                    key={eventType}
                    type="monotone"
                    dataKey={eventType}
                    stroke={getCanonicalEventColor(eventType, index)}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top frictions (5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.top_frictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune friction détectée sur la période sélectionnée.</p>
            ) : (
              analytics.top_frictions.map((friction) => (
                <div key={`${friction.event_type}-${friction.last_occurrence ?? 'none'}`} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatCanonicalEventLabel(friction.event_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        Dernier cas&nbsp;: {friction.last_occurrence ? new Date(friction.last_occurrence).toLocaleString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="destructive">{friction.count}</Badge>
                  </div>
                  {friction.sample_metadata ? (
                    <pre className="mt-2 text-xs bg-muted/60 rounded p-2 overflow-x-auto">
                      {JSON.stringify(friction.sample_metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top contenus performants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.top_contents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contenu mis en avant sur la période.</p>
            ) : (
              analytics.top_contents.map((content) => (
                <div key={`${content.content_ref ?? 'unknown'}-${content.event_type}`} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{content.content_ref ?? 'Sans identifiant'}</p>
                      <p className="text-xs text-muted-foreground">{formatCanonicalEventLabel(content.event_type)}</p>
                    </div>
                    <Badge variant="secondary">{content.count}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
