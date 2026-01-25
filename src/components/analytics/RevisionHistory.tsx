import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    History,
    RotateCcw,
    TrendingUp,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RevisionEntry {
  id: string;
  itemCode: string;
  itemTitle: string;
  reviewedAt: Date;
  result: 'correct' | 'incorrect' | 'partial';
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview?: Date;
}

interface DailyStats {
  date: Date;
  itemsReviewed: number;
  correctRate: number;
  timeSpent: number;
}

export const RevisionHistory: React.FC = () => {
  const [history, setHistory] = useState<RevisionEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [_loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadHistory();
  }, [selectedPeriod]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Calculer la période de filtrage
      const now = new Date();
      let startDate: Date;
      if (selectedPeriod === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (selectedPeriod === 'week') {
        startDate = subDays(now, 7);
      } else {
        startDate = subDays(now, 30);
      }

      // Charger les vraies données de révision depuis Supabase
      const { _data: progressData } = await supabase
        .from('user_item_progress')
        .select('id, item_code, last_review_date, next_review_date, total_reviews, ease_factor, interval_days')
        .eq('user_id', user.id)
        .gte('last_review_date', startDate.toISOString())
        .order('last_review_date', { ascending: false })
        .limit(50);

      // Récupérer les titres des items
      const itemCodes = progressData?.map(p => p.item_code) || [];
      const { _data: itemsData } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .in('item_code', itemCodes.length > 0 ? itemCodes : ['none']);

      const itemTitleMap: Record<string, string> = {};
      itemsData?.forEach(item => {
        itemTitleMap[item.item_code] = item.title;
      });

      // Transformer les données en RevisionEntry
      const realHistory: RevisionEntry[] = (progressData || []).map((progress) => {
        // Déterminer le résultat basé sur ease_factor
        let result: 'correct' | 'incorrect' | 'partial' = 'correct';
        if (progress.ease_factor && progress.ease_factor < 2.0) result = 'incorrect';
        else if (progress.ease_factor && progress.ease_factor < 2.5) result = 'partial';

        // Déterminer la difficulté basée sur interval_days
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        if (progress.interval_days && progress.interval_days > 14) difficulty = 'easy';
        else if (progress.interval_days && progress.interval_days < 3) difficulty = 'hard';

        return {
          id: progress.id,
          itemCode: progress.item_code,
          itemTitle: itemTitleMap[progress.item_code] || progress.item_code,
          reviewedAt: new Date(progress.last_review_date),
          result,
          timeSpent: Math.round((progress.total_reviews || 1) * 60 + 120), // Estimation basée sur le nombre de révisions
          difficulty,
          nextReview: progress.next_review_date ? new Date(progress.next_review_date) : undefined
        };
      });

      // Générer les stats quotidiennes depuis user_activity_log
      const weekStart = startOfWeek(now, { locale: fr });
      const weekEnd = endOfWeek(now, { locale: fr });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const { _data: activityData } = await supabase
        .from('user_activity_log')
        .select('activity_type, count, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const stats: DailyStats[] = days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayActivities = activityData?.filter(a => 
          format(new Date(a.created_at), 'yyyy-MM-dd') === dayStr
        ) || [];
        
        const itemsReviewed = dayActivities.reduce((sum, a) => sum + (a.count || 1), 0);
        const studyActivities = dayActivities.filter(a => a.activity_type === 'study').length;
        const correctRate = studyActivities > 0 ? Math.min(100, 70 + studyActivities * 5) : 0;
        const timeSpent = itemsReviewed * 5; // Estimation: 5 min par révision

        return { date: day, itemsReviewed, correctRate, timeSpent };
      });

      setHistory(realHistory);
      setDailyStats(stats);
    } catch (error) {
      console.error('Error loading revision history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result: RevisionEntry['result']) => {
    switch (result) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'partial':
        return <RotateCcw className="h-4 w-4 text-warning" />;
    }
  };

  const getResultBadge = (result: RevisionEntry['result']) => {
    switch (result) {
      case 'correct':
        return <Badge className="bg-success/10 text-success">Réussi</Badge>;
      case 'incorrect':
        return <Badge className="bg-destructive/10 text-destructive">À revoir</Badge>;
      case 'partial':
        return <Badge className="bg-warning/10 text-warning">Partiel</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: RevisionEntry['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="text-success border-success">Facile</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-warning border-warning">Moyen</Badge>;
      case 'hard':
        return <Badge variant="outline" className="text-destructive border-destructive">Difficile</Badge>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalStats = {
    itemsReviewed: history.length,
    correctRate: history.length > 0 
      ? Math.round((history.filter(h => h.result === 'correct').length / history.length) * 100) 
      : 0,
    totalTime: history.reduce((acc, h) => acc + h.timeSpent, 0),
    avgTimePerItem: history.length > 0 
      ? Math.round(history.reduce((acc, h) => acc + h.timeSpent, 0) / history.length) 
      : 0
  };

  const exportHistory = () => {
    const csv = history.map(h => 
      `${h.itemCode},${h.itemTitle},${h.reviewedAt.toISOString()},${h.result},${h.timeSpent},${h.difficulty}`
    ).join('\n');
    
    const blob = new Blob([`Code,Titre,Date,Résultat,Temps,Difficulté\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-revision-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Historique de Révision
              </CardTitle>
              <CardDescription>
                Suivez votre progression et analysez vos performances
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportHistory}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.itemsReviewed}</p>
                <p className="text-xs text-muted-foreground">Items révisés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.correctRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de réussite</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(totalStats.totalTime)}</p>
                <p className="text-xs text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(totalStats.avgTimePerItem)}</p>
                <p className="text-xs text-muted-foreground">Moyenne/item</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activité de la semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {dailyStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-muted rounded-t relative" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t transition-all"
                    style={{ height: `${(day.itemsReviewed / 12) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(day.date, 'EEE', { locale: fr })}
                </span>
                <span className="text-xs font-medium">{day.itemsReviewed}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Dernières révisions</CardTitle>
            <div className="flex gap-2">
              {(['today', 'week', 'month'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'today' ? "Aujourd'hui" :
                   period === 'week' ? 'Cette semaine' : 'Ce mois'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {history.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getResultIcon(entry.result)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.itemCode}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm">{entry.itemTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(entry.reviewedAt, 'PPp', { locale: fr })}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(entry.timeSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDifficultyBadge(entry.difficulty)}
                    {getResultBadge(entry.result)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Prochaines révisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Prochaines révisions programmées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history
              .filter(h => h.nextReview)
              .sort((a, b) => (a.nextReview?.getTime() || 0) - (b.nextReview?.getTime() || 0))
              .slice(0, 5)
              .map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{entry.itemCode}</Badge>
                    <span className="text-sm">{entry.itemTitle}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {entry.nextReview && format(entry.nextReview, 'PPP', { locale: fr })}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
