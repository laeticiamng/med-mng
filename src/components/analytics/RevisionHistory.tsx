import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  History, Calendar, Clock, BookOpen, TrendingUp, 
  CheckCircle, XCircle, RotateCcw, Filter, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadHistory();
  }, [selectedPeriod]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Données de démonstration enrichies
      const now = new Date();
      const demoHistory: RevisionEntry[] = [
        {
          id: '1',
          itemCode: 'IC-1',
          itemTitle: 'Relations médecin-malade',
          reviewedAt: new Date(now.getTime() - 30 * 60 * 1000),
          result: 'correct',
          timeSpent: 180,
          difficulty: 'easy',
          nextReview: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          itemCode: 'IC-3',
          itemTitle: 'Le raisonnement clinique',
          reviewedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          result: 'partial',
          timeSpent: 240,
          difficulty: 'medium',
          nextReview: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          itemCode: 'IC-228',
          itemTitle: 'Douleur thoracique aiguë',
          reviewedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          result: 'correct',
          timeSpent: 300,
          difficulty: 'hard',
          nextReview: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          itemCode: 'IC-232',
          itemTitle: 'Insuffisance cardiaque',
          reviewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          result: 'incorrect',
          timeSpent: 150,
          difficulty: 'hard',
          nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        },
        {
          id: '5',
          itemCode: 'IC-80',
          itemTitle: 'Prescription d\'antibiotiques',
          reviewedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          result: 'correct',
          timeSpent: 200,
          difficulty: 'medium'
        }
      ];

      // Générer les stats quotidiennes
      const weekStart = startOfWeek(now, { locale: fr });
      const weekEnd = endOfWeek(now, { locale: fr });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const stats: DailyStats[] = days.map((day, index) => ({
        date: day,
        itemsReviewed: Math.floor(Math.random() * 10) + 2,
        correctRate: 70 + Math.floor(Math.random() * 25),
        timeSpent: Math.floor(Math.random() * 60) + 15
      }));

      setHistory(demoHistory);
      setDailyStats(stats);
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
