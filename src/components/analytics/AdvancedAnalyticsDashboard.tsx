import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Download,
  Loader2,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  useAnalyticsDashboard,
  DASHBOARD_TIMEFRAMES,
  type DashboardTimeframe,
  type AnalyticsDashboardPayload,
} from '@/hooks/analytics/useAnalyticsDashboard';
import { formatCanonicalEventLabel, getCanonicalEventColor } from '@/constants/canonicalAnalytics';

interface AnalyticsDashboardProps {
  className?: string;
}

const TIMEFRAME_LABELS: Record<DashboardTimeframe, string> = {
  '24h': '24 dernières heures',
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
};

const formatBucketLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDurationShort = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) {
    return 'Durée inconnue';
  }
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

const getEventCount = (payload: AnalyticsDashboardPayload | null, type: string) =>
  payload?.event_breakdown?.find((entry) => entry.event_type === type)?.count ?? 0;

export default function AdvancedAnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { data, loading, error, timeframe, generatedAt, refresh, setTimeframe } = useAnalyticsDashboard();

  const kpis = data?.kpis;
  const totalEvents = useMemo(
    () => kpis?.total_events ?? data?.event_breakdown?.reduce((sum, entry) => sum + entry.count, 0) ?? 0,
    [data, kpis?.total_events],
  );
  const generationSuccess = useMemo(() => getEventCount(data, 'generate_success'), [data]);
  const generationFail = useMemo(() => getEventCount(data, 'generate_fail'), [data]);

  const successRate = useMemo(() => {
    if (typeof kpis?.generation_success_rate === 'number') {
      return Math.round(kpis.generation_success_rate);
    }
    const denominator = generationSuccess + generationFail;
    if (denominator === 0) {
      return null;
    }
    return Math.round((generationSuccess / denominator) * 100);
  }, [generationSuccess, generationFail, kpis?.generation_success_rate]);

  const averageGenerationTimeLabel = useMemo(() => {
    if (!kpis?.average_generation_time_ms || kpis.average_generation_time_ms <= 0) {
      return null;
    }
    const totalSeconds = Math.round(kpis.average_generation_time_ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }, [kpis?.average_generation_time_ms]);

  const averageQcmScore = typeof kpis?.average_qcm_score === 'number' ? Math.round(kpis.average_qcm_score) : null;
  const qcmAttempts = kpis?.qcm_attempts ?? 0;
  const karaokeSeekEvents = kpis?.karaoke_seek_events ?? 0;

  const breakdownChartData = useMemo(() => {
    const entries = data?.event_breakdown ?? [];
    return entries.map((entry, index) => ({
      ...entry,
      label: formatCanonicalEventLabel(entry.event_type),
      color: getCanonicalEventColor(entry.event_type, index),
    }));
  }, [data]);

  const topEventTypes = useMemo(() => {
    const entries = data?.event_breakdown ?? [];
    return entries
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((entry) => entry.event_type);
  }, [data]);

  const timeseriesChartData = useMemo(() => {
    const timeseries = data?.timeseries ?? [];
    if (timeseries.length === 0) {
      return [] as Array<Record<string, number | string>>;
    }
    const buckets = new Map<string, Record<string, number | string>>();
    timeseries.forEach(({ bucket, event_type, count }) => {
      const key = new Date(bucket).toISOString();
      if (!buckets.has(key)) {
        buckets.set(key, { bucket: key });
      }
      buckets.get(key)![event_type] = count;
    });

    return Array.from(buckets.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([, value]) => value);
  }, [data]);

  const topFrictions = data?.top_frictions ?? [];
  const topContents = data?.top_contents ?? [];
  const topPlayedItems = data?.top_played_items ?? [];
  const recentQcmScores = data?.recent_qcm_scores ?? [];
  const lastUpdatedLabel = generatedAt
    ? new Date(generatedAt).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;
  const hasData = totalEvents > 0;

  const handleExport = () => {
    const payload = data;
    if (!payload) {
      return;
    }
    const exportPayload = {
      generatedAt: generatedAt ?? new Date().toISOString(),
      timeframe,
      metrics: payload,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canonical-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight">Analytics canoniques</h2>
          <CardDescription>
            Vue unifiée des événements clés (génération, karaoké, EDN, séances 8 minutes).
          </CardDescription>
          {lastUpdatedLabel ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>Dernière actualisation&nbsp;: {lastUpdatedLabel}</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as DashboardTimeframe)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {DASHBOARD_TIMEFRAMES.map((option) => (
                <SelectItem key={option} value={option}>
                  {TIMEFRAME_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refresh()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Actualiser
          </Button>
          <Button onClick={handleExport} variant="secondary" disabled={!data}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Badge variant="outline">{TIMEFRAME_LABELS[timeframe]}</Badge>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Récupération des analytics impossible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/80">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Événements analysés</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{hasData ? totalEvents.toLocaleString('fr-FR') : '—'}</div>
            <p className="text-xs text-muted-foreground">Toutes les occurrences reçues sur la période</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de réussite génération</CardTitle>
            {(successRate ?? 0) >= 80 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{successRate !== null ? `${successRate}%` : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {generationSuccess} succès / {generationFail} échecs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Temps moyen de génération</CardTitle>
            <CalendarClock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageGenerationTimeLabel ?? '—'}</div>
            <p className="text-xs text-muted-foreground">
              {karaokeSeekEvents > 0
                ? `${karaokeSeekEvents.toLocaleString('fr-FR')} interactions karaoké`
                : 'Basé sur les pistes réussies'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Score QCM moyen</CardTitle>
            <Target className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageQcmScore !== null ? `${averageQcmScore}%` : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {qcmAttempts > 0
                ? `${qcmAttempts.toLocaleString('fr-FR')} tentatives suivies`
                : 'Aucune tentative sur la période'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Répartition des événements</CardTitle>
            <CardDescription>Volumes par type d’événement canonique.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number | string, name: string) => [
                    typeof value === 'number' ? value.toLocaleString('fr-FR') : value,
                    formatCanonicalEventLabel(name),
                  ]}
                />
                <Bar dataKey="count">
                  {breakdownChartData.map((entry) => (
                    <Cell key={entry.event_type} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Aucune donnée enregistrée sur la période sélectionnée.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Chronologie des interactions</CardTitle>
            <CardDescription>Évolution quotidienne des événements majeurs.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[360px]">
          {hasData && timeseriesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseriesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bucket" tickFormatter={formatBucketLabel} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => formatBucketLabel(value as string)}
                  formatter={(value: number | string, name: string) => [
                    typeof value === 'number' ? value.toLocaleString('fr-FR') : value,
                    formatCanonicalEventLabel(name),
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
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
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Pas encore de séries temporelles pour la période.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top frictions à adresser</CardTitle>
            <CardDescription>Derniers échecs de génération ou synchronisation EDN.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topFrictions.length > 0 ? (
              topFrictions.map((friction) => (
                <div key={`${friction.event_type}-${friction.last_occurrence ?? 'unknown'}`} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {formatCanonicalEventLabel(friction.event_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dernière occurrence&nbsp;:
                        {' '}
                        {friction.last_occurrence
                          ? new Date(friction.last_occurrence).toLocaleString('fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'n/a'}
                      </p>
                    </div>
                    <Badge variant="destructive">{friction.count}</Badge>
                  </div>
                  {friction.sample_metadata ? (
                    <pre className="mt-3 max-h-40 overflow-auto rounded bg-muted/40 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(friction.sample_metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune friction critique détectée sur la période.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top contenus performants</CardTitle>
            <CardDescription>Pistes, lyrics et séances générant le plus d’engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContents.length > 0 ? (
              topContents.map((content) => (
                <div key={`${content.event_type}-${content.content_ref ?? 'none'}`} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-semibold">{content.content_ref ?? 'Référence non fournie'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCanonicalEventLabel(content.event_type)}
                    </p>
                  </div>
                  <Badge variant="secondary">{content.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Pas encore de contenus en tête sur cette période.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Items les plus joués</CardTitle>
            <CardDescription>Basé sur les événements de lecture karaoké.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPlayedItems.length > 0 ? (
              topPlayedItems.slice(0, 6).map((entry, index) => (
                <div key={`${entry.item_code ?? 'unknown'}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-semibold">{entry.item_code ?? 'Item inconnu'}</p>
                    <p className="text-xs text-muted-foreground">{entry.item_title ?? 'Titre non renseigné'}</p>
                  </div>
                  <Badge variant="outline">{entry.play_count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune lecture enregistrée sur la période.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scores QCM récents</CardTitle>
            <CardDescription>Tentatives terminées et corrigées par item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentQcmScores.length > 0 ? (
              recentQcmScores.slice(0, 6).map((entry, index) => (
                <div key={`qcm-${index}`} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{entry.item_code ?? 'Item inconnu'}</p>
                    <Badge variant="secondary">{entry.score !== null ? `${Math.round(entry.score)}%` : '—'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDurationShort(entry.time_spent_seconds)} ·
                    {' '}
                    {new Date(entry.occurred_at).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucun score QCM sauvegardé récemment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
