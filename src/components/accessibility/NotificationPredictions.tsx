import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, AlertTriangle, Sparkles, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoricalData {
  date: string;
  total: number;
  success: number;
  failed: number;
}

interface Prediction {
  date: string;
  predicted: number;
  confidence: 'high' | 'medium' | 'low';
}

export function NotificationPredictions() {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trend, setTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');
  const [averageDaily, setAverageDaily] = useState(0);

  useEffect(() => {
    loadDataAndPredict();
  }, []);

  const loadDataAndPredict = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les 30 derniers jours
      const startDate = startOfDay(subDays(new Date(), 30));
      const endDate = startOfDay(new Date());

      const { data, error } = await supabase
        .from('notification_history')
        .select('sent_at, status')
        .eq('user_id', user.id)
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString())
        .order('sent_at', { ascending: true });

      if (error) throw error;

      // Grouper par jour
      const grouped: Record<string, HistoricalData> = {};
      (data || []).forEach((item) => {
        const dateKey = format(new Date(item.sent_at), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            total: 0,
            success: 0,
            failed: 0,
          };
        }
        grouped[dateKey].total++;
        if (item.status === 'success') grouped[dateKey].success++;
        if (item.status === 'failed') grouped[dateKey].failed++;
      });

      const historical = Object.values(grouped).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setHistoricalData(historical);

      // Calculer les prédictions
      if (historical.length >= 7) {
        const predictedData = calculatePredictions(historical);
        setPredictions(predictedData);
        
        // Calculer la tendance
        const trendValue = calculateTrend(historical);
        setTrend(trendValue);

        // Moyenne quotidienne
        const avg = historical.reduce((sum, d) => sum + d.total, 0) / historical.length;
        setAverageDaily(Math.round(avg));
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = (historical: HistoricalData[]): Prediction[] => {
    // Régression linéaire simple
    const n = historical.length;
    const x = historical.map((_, i) => i);
    const y = historical.map((d) => d.total);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculer l'écart-type pour la confiance
    const predictions = y.map((_, i) => slope * i + intercept);
    const residuals = y.map((yi, i) => Math.abs(yi - predictions[i]));
    const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;

    // Prédire les 7 prochains jours
    const futurePredictions: Prediction[] = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = addDays(new Date(), i);
      const predicted = Math.max(0, Math.round(slope * (n + i - 1) + intercept));
      
      // Déterminer la confiance basée sur l'écart-type
      let confidence: 'high' | 'medium' | 'low' = 'high';
      if (avgResidual > predicted * 0.5) {
        confidence = 'low';
      } else if (avgResidual > predicted * 0.25) {
        confidence = 'medium';
      }

      futurePredictions.push({
        date: format(futureDate, 'yyyy-MM-dd'),
        predicted,
        confidence,
      });
    }

    return futurePredictions;
  };

  const calculateTrend = (historical: HistoricalData[]): 'increasing' | 'decreasing' | 'stable' => {
    if (historical.length < 7) return 'stable';

    // Comparer première et deuxième moitié
    const mid = Math.floor(historical.length / 2);
    const firstHalf = historical.slice(0, mid);
    const secondHalf = historical.slice(mid);

    const avgFirst = firstHalf.reduce((sum, d) => sum + d.total, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.total, 0) / secondHalf.length;

    const diff = ((avgSecond - avgFirst) / avgFirst) * 100;

    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  };

  const getCombinedData = () => {
    const historical = historicalData.map((d) => ({
      date: format(new Date(d.date), 'dd MMM', { locale: fr }),
      actual: d.total,
      predicted: null as number | null,
      type: 'historical' as const,
    }));

    const future = predictions.map((p) => ({
      date: format(new Date(p.date), 'dd MMM', { locale: fr }),
      actual: null as number | null,
      predicted: p.predicted,
      type: 'prediction' as const,
    }));

    return [...historical, ...future];
  };

  const getNextWeekTotal = () => {
    return predictions.reduce((sum, p) => sum + p.predicted, 0);
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-5 w-5 text-yellow-600 rotate-90" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'increasing':
        return 'En hausse';
      case 'decreasing':
        return 'En baisse';
      default:
        return 'Stable';
    }
  };

  const getHighConfidencePredictions = () => {
    return predictions.filter((p) => p.confidence === 'high').length;
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

  if (historicalData.length < 7) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Prédictions de Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Pas assez de données pour générer des prédictions. Au moins 7 jours d'historique sont nécessaires.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const combinedData = getCombinedData();
  const nextWeekTotal = getNextWeekTotal();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Prédictions de Volume
        </CardTitle>
        <CardDescription>
          Anticipation des volumes de notifications basée sur l'analyse de l'historique
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métriques clés */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{nextWeekTotal}</p>
                <p className="text-sm text-muted-foreground">Prévision 7 jours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto mb-2">{getTrendIcon()}</div>
                <p className="text-2xl font-bold">{getTrendLabel()}</p>
                <p className="text-sm text-muted-foreground">Tendance actuelle</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{averageDaily}</p>
                <p className="text-sm text-muted-foreground">Moyenne quotidienne</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold">{getHighConfidencePredictions()}/7</p>
                <p className="text-sm text-muted-foreground">Prédictions fiables</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {trend === 'increasing' && nextWeekTotal > averageDaily * 10 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Volume élevé prévu:</strong> Les prédictions indiquent une augmentation significative des notifications la semaine prochaine (+{Math.round((nextWeekTotal / (averageDaily * 7) - 1) * 100)}%). Vérifiez la capacité de vos webhooks.
            </AlertDescription>
          </Alert>
        )}

        {/* Graphique: Historique et Prédictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution et Prévisions</CardTitle>
            <CardDescription>
              Données historiques (ligne pleine) et prédictions (ligne pointillée)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-2">{data.date}</p>
                          {data.actual !== null && (
                            <p className="text-sm text-blue-600">Réel: {data.actual}</p>
                          )}
                          {data.predicted !== null && (
                            <p className="text-sm text-purple-600">Prévu: {data.predicted}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <ReferenceLine
                  x={format(new Date(), 'dd MMM', { locale: fr })}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label="Aujourd'hui"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historique"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Prédictions"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Détails des prédictions par jour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prédictions Détaillées - 7 Prochains Jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div
                  key={prediction.date}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">
                        {format(new Date(prediction.date), 'EEEE d MMMM', { locale: fr })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.predicted} notifications prévues
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      prediction.confidence === 'high'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : prediction.confidence === 'medium'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }
                  >
                    {prediction.confidence === 'high'
                      ? 'Haute confiance'
                      : prediction.confidence === 'medium'
                      ? 'Confiance moyenne'
                      : 'Faible confiance'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">Insights</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • La tendance actuelle est <strong>{getTrendLabel().toLowerCase()}</strong> sur les 30 derniers jours
                  </li>
                  <li>
                    • Volume moyen quotidien: <strong>{averageDaily} notifications</strong>
                  </li>
                  <li>
                    • Prévision pour la semaine prochaine: <strong>{nextWeekTotal} notifications</strong> (moy. {Math.round(nextWeekTotal / 7)}/jour)
                  </li>
                  {trend === 'increasing' && (
                    <li className="text-orange-600">
                      • ⚠️ Augmentation du volume détectée - surveillez les performances de vos webhooks
                    </li>
                  )}
                  {getHighConfidencePredictions() < 4 && (
                    <li className="text-orange-600">
                      • ⚠️ Certaines prédictions ont une faible confiance - les volumes réels peuvent varier
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
