import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, FileDown, Loader2, Minus, Target, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React, { useCallback } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface QuizHistorySummaryProps {
  itemCode: string;
}

export const QuizHistorySummary: React.FC<QuizHistorySummaryProps> = ({ itemCode }) => {
  const { summary, loading } = useQuizHistory(itemCode);

  const exportToPDF = useCallback(async () => {
    if (!summary) return;

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text(`Historique Quiz - ${itemCode}`, pageWidth / 2, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, 28, { align: 'center' });
      
      // Stats
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Statistiques', 20, 45);
      
      doc.setFontSize(12);
      doc.text(`Meilleur score: ${Math.round(summary.bestScore ?? 0)}%`, 25, 55);
      doc.text(`Score moyen: ${Math.round(summary.averageScore ?? 0)}%`, 25, 63);
      doc.text(`Nombre d'essais: ${summary.totalAttempts ?? 0}`, 25, 71);
      
      if (summary.lastAttempt) {
        doc.text(`Dernier essai: ${format(new Date(summary.lastAttempt), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 25, 79);
      }
      
      // Recent scores
      if (summary.recentScores && summary.recentScores.length > 0) {
        doc.setFontSize(14);
        doc.text('Scores récents', 20, 95);
        
        doc.setFontSize(11);
        summary.recentScores.slice(0, 10).forEach((score, idx) => {
          doc.text(`Essai ${idx + 1}: ${Math.round(score ?? 0)}%`, 25, 105 + (idx * 8));
        });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('EDN Complete - Plateforme de révision médicale', pageWidth / 2, 280, { align: 'center' });
      
      doc.save(`quiz-history-${itemCode}-${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }, [summary, itemCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="py-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-7 w-7 text-primary/60" />
            </div>
            <div>
              <p className="font-medium text-foreground">Prêt à tester vos connaissances ?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Faites votre premier quiz pour voir vos statistiques
              </p>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">
              🎯 Objectif : Score {'>'} 80%
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Historique des quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-warning" />
            <div className={`text-lg font-bold ${getScoreColor(summary.bestScore)}`}>
              {Math.round(summary.bestScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Meilleur</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">
              {Math.round(summary.averageScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Moyenne</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-bold text-foreground">
              {summary.totalAttempts}
            </div>
            <div className="text-xs text-muted-foreground">Essais</div>
          </div>
        </div>

        {/* Graphe Recharts enrichi */}
        {summary.recentScores && summary.recentScores.length > 1 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression récente</span>
              {(() => {
                const recent = summary.recentScores.slice(0, 3);
                const older = summary.recentScores.slice(3);
                if (older.length === 0) return null;
                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
                const diff = recentAvg - olderAvg;
                if (diff > 5) return <span className="flex items-center text-success"><TrendingUp className="h-3 w-3 mr-1" />+{Math.round(diff)}%</span>;
                if (diff < -5) return <span className="flex items-center text-destructive"><TrendingDown className="h-3 w-3 mr-1" />{Math.round(diff)}%</span>;
                return <span className="flex items-center text-muted-foreground"><Minus className="h-3 w-3 mr-1" />Stable</span>;
              })()}
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.recentScores.slice(0, 10).reverse().map((score, idx) => ({
                  attempt: idx + 1,
                  score: Math.round(score)
                }))}>
                  <XAxis dataKey="attempt" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Essai ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <ReferenceLine y={80} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={60} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.3} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {summary.lastAttempt && (
          <p className="text-xs text-muted-foreground text-center pt-1 border-t">
            Dernier essai: {formatDistanceToNow(new Date(summary.lastAttempt), { addSuffix: true, locale: fr })}
          </p>
        )}
        
        {/* Export PDF Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={exportToPDF}
          className="w-full mt-3 gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exporter PDF
        </Button>
      </CardContent>
    </Card>
  );
};
