import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, FileWarning, FileText, AlertTriangle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractionMonitoringDashboard } from '@/components/admin/ExtractionMonitoringDashboard';
import { DataQualityMonitor } from '@/components/notifications/DataQualityMonitor';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { toast } from 'sonner';

interface OicCompetenceRow {
  id: string;
  intitule: string;
  description: string | null;
  contenu_detaille: unknown | null;
}

interface QualityMetrics {
  totalCompetences: number;
  scannedCompetences: number;
  shortDescriptions: number;
  shortTitles: number;
  corruptedHtml: number;
}

type MetricStatus = 'healthy' | 'warning' | 'critical';

type ThresholdConfig = {
  warning: { count: number; percent: number };
  critical: { count: number; percent: number };
};

const QUALITY_THRESHOLDS: Record<'corruptedHtml' | 'shortDescriptions' | 'shortTitles', ThresholdConfig> = {
  corruptedHtml: {
    warning: { count: 15, percent: 1.5 },
    critical: { count: 60, percent: 6 }
  },
  shortDescriptions: {
    warning: { count: 80, percent: 5 },
    critical: { count: 200, percent: 12 }
  },
  shortTitles: {
    warning: { count: 50, percent: 3 },
    critical: { count: 120, percent: 7 }
  }
};

const DESCRIPTION_MIN_LENGTH = 20;
const TITLE_MIN_LENGTH = 15;

const computeStatus = (count: number, total: number, thresholds: ThresholdConfig): MetricStatus => {
  const percent = total > 0 ? (count / total) * 100 : 0;

  if (count >= thresholds.critical.count || percent >= thresholds.critical.percent) {
    return 'critical';
  }

  if (count >= thresholds.warning.count || percent >= thresholds.warning.percent) {
    return 'warning';
  }

  return 'healthy';
};

const formatPercent = (count: number, total: number) => {
  if (!total) return '0%';
  return `${((count / total) * 100).toFixed(1)}%`;
};

const isCorruptedHtml = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const angleOpen = (trimmed.match(/</g) || []).length;
  const angleClose = (trimmed.match(/>/g) || []).length;
  const hasEscaped = /&lt;|&gt;|&amp;lt;|&amp;gt;/.test(trimmed);
  const hasTag = /<\/?[a-z][\s\S]*?>/i.test(trimmed);

  return hasEscaped || (angleOpen > 0 && (!hasTag || angleOpen !== angleClose));
};

const buildDetailText = (row: OicCompetenceRow) => {
  const description = row.description ?? '';
  const detailed = row.contenu_detaille ? JSON.stringify(row.contenu_detaille) : '';
  return `${description} ${detailed}`.trim();
};

export const AdminExtractionQualityDashboard: React.FC = () => {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const { createAlert } = useSystemAlerts();
  const lastAlertStatus = useRef<Record<string, MetricStatus>>({
    corruptedHtml: 'healthy',
    shortDescriptions: 'healthy',
    shortTitles: 'healthy'
  });

  const fetchQualityMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count, error } = await supabase
        .from('oic_competences')
        .select('id, intitule, description, contenu_detaille', { count: 'exact' })
        .range(0, 9999);

      if (error) throw error;

      const rows = (data || []) as OicCompetenceRow[];
      const totalCompetences = count ?? rows.length;
      const scannedCompetences = rows.length;

      const metrics = rows.reduce(
        (acc, row) => {
          const description = row.description?.trim() ?? '';
          const title = row.intitule?.trim() ?? '';
          const detailText = buildDetailText(row);

          if (description.length < DESCRIPTION_MIN_LENGTH) {
            acc.shortDescriptions += 1;
          }

          if (title.length < TITLE_MIN_LENGTH) {
            acc.shortTitles += 1;
          }

          if (detailText && isCorruptedHtml(detailText)) {
            acc.corruptedHtml += 1;
          }

          return acc;
        },
        {
          totalCompetences,
          scannedCompetences,
          shortDescriptions: 0,
          shortTitles: 0,
          corruptedHtml: 0
        } as QualityMetrics
      );

      setQualityMetrics(metrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erreur récupération KPI qualité:', err);
      toast.error('Erreur lors du chargement des KPI qualité OIC');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQualityMetrics();
  }, [fetchQualityMetrics]);

  const kpiCards = useMemo(() => {
    if (!qualityMetrics) return [];

    const total = qualityMetrics.totalCompetences || qualityMetrics.scannedCompetences;

    return [
      {
        key: 'corruptedHtml',
        title: 'HTML corrompu',
        description: 'Descriptions ou contenus détaillés avec balises incomplètes ou échappées',
        count: qualityMetrics.corruptedHtml,
        total,
        thresholds: QUALITY_THRESHOLDS.corruptedHtml,
        icon: <FileWarning className="h-4 w-4 text-warning" />
      },
      {
        key: 'shortDescriptions',
        title: 'Descriptions courtes',
        description: `Descriptions < ${DESCRIPTION_MIN_LENGTH} caractères`,
        count: qualityMetrics.shortDescriptions,
        total,
        thresholds: QUALITY_THRESHOLDS.shortDescriptions,
        icon: <FileText className="h-4 w-4 text-muted-foreground" />
      },
      {
        key: 'shortTitles',
        title: 'Intitulés courts',
        description: `Intitulés < ${TITLE_MIN_LENGTH} caractères`,
        count: qualityMetrics.shortTitles,
        total,
        thresholds: QUALITY_THRESHOLDS.shortTitles,
        icon: <Database className="h-4 w-4 text-muted-foreground" />
      }
    ];
  }, [qualityMetrics]);

  useEffect(() => {
    if (!qualityMetrics) return;

    const total = qualityMetrics.totalCompetences || qualityMetrics.scannedCompetences;
    if (!total) return;

    kpiCards.forEach(card => {
      const status = computeStatus(card.count, total, card.thresholds);
      const previous = lastAlertStatus.current[card.key];

      if ((status === 'warning' || status === 'critical') && status !== previous) {
        createAlert(
          status === 'critical' ? 'critical' : 'warning',
          'data',
          `KPI ${card.title} au-dessus des seuils`,
          `${card.count} compétences (${formatPercent(card.count, total)}) dépassent les seuils ${card.thresholds.warning.percent}% / ${card.thresholds.warning.count}.`,
          'oic-quality-monitor',
          {
            metric: card.key,
            count: card.count,
            total,
            percent: Number(((card.count / total) * 100).toFixed(2))
          }
        );
      }

      lastAlertStatus.current[card.key] = status;
    });
  }, [qualityMetrics, kpiCards, createAlert]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Extraction & Qualité</h1>
            <p className="text-muted-foreground mt-1">
              Suivi unifié des extractions et des KPI de qualité des contenus OIC.
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-2">
                Dernière mise à jour : {lastUpdated.toLocaleString('fr-FR')}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={fetchQualityMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser KPI qualité
          </Button>
        </div>

        <Tabs defaultValue="extraction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extraction">Extraction</TabsTrigger>
            <TabsTrigger value="quality">Qualité</TabsTrigger>
          </TabsList>

          <TabsContent value="extraction" className="space-y-6">
            <ExtractionMonitoringDashboard />
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  KPI qualité ciblés
                </CardTitle>
                <CardDescription>
                  Indicateurs spécifiques aux extractions OIC (qualité du texte et structure HTML).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityMetrics && qualityMetrics.scannedCompetences < qualityMetrics.totalCompetences && (
                  <Alert variant="default">
                    <AlertTitle>Échantillon analysé</AlertTitle>
                    <AlertDescription>
                      {qualityMetrics.scannedCompetences.toLocaleString()} compétences analysées sur{' '}
                      {qualityMetrics.totalCompetences.toLocaleString()}. Le reste sera pris en compte à la prochaine analyse.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  {kpiCards.map(card => {
                    const status = computeStatus(card.count, card.total, card.thresholds);
                    const badgeVariant = status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'outline';

                    return (
                      <Card key={card.key} className={status !== 'healthy' ? 'border-warning/40' : ''}>
                        <CardHeader className="space-y-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              {card.icon}
                              {card.title}
                            </CardTitle>
                            <Badge variant={badgeVariant}>
                              {status === 'critical' ? 'Critique' : status === 'warning' ? 'Surveillance' : 'OK'}
                            </Badge>
                          </div>
                          <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-2xl font-bold">
                            {card.count.toLocaleString()} <span className="text-sm text-muted-foreground">({formatPercent(card.count, card.total)})</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Seuils : {card.thresholds.warning.count} / {card.thresholds.warning.percent}% (warning),
                            {card.thresholds.critical.count} / {card.thresholds.critical.percent}% (critique)
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Définitions des KPI</CardTitle>
                <CardDescription>Règles d'interprétation utilisées pour la qualité des extractions.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• HTML corrompu : présence de balises incomplètes, HTML échappé ou structure incohérente.</li>
                  <li>• Descriptions courtes : description &lt; {DESCRIPTION_MIN_LENGTH} caractères.</li>
                  <li>• Intitulés courts : intitulé &lt; {TITLE_MIN_LENGTH} caractères.</li>
                </ul>
              </CardContent>
            </Card>

            <DataQualityMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminExtractionQualityDashboard;
