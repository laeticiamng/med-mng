import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    Award,
    Clock,
    Download,
    Flame,
    Star,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { toast } from 'sonner';

// Couleurs sémantiques pour les graphiques (compatibles avec le design system)
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
};

const Statistics = () => {
  const { _getHeatmapData, getWeeklySummary, getStreak } = useActivityTracking();
  const { _stats: gamificationStats, loadStats } = useGamification();
  const [personalStats, setPersonalStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadStats(user.id);
        
        const [heatmap, weekly, streak] = await Promise.all([
          _getHeatmapData(30),
          getWeeklySummary(),
          getStreak()
        ]);
        
        setWeeklyData(heatmap.slice(-7).map(d => ({
          name: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
          activities: d.count,
          ...d.activities
        })));
        
        setPersonalStats(weekly);
        setStreakData(streak);
      }
      setLoading(false);
    };
    load();
  }, [_getHeatmapData, getWeeklySummary, getStreak, loadStats]);

  // Données de spécialités basées sur l'activité réelle
  const activityTypeData = personalStats?.byType ? Object.entries(personalStats.byType)
    .filter(([_, v]) => (v as number) > 0)
    .map(([type, value], index) => ({
      name: type === 'srs_review' ? 'SRS' : 
            type === 'exam' ? 'Examens' : 
            type === 'flashcard' ? 'Flashcards' : 
            type === 'clinical_case' ? 'Cas cliniques' : 'Étude',
      value: value as number,
      color: [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4, CHART_COLORS.chart5][index % 5]
    })) : [];

  const exportToPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      pdf.setFontSize(20);
      pdf.text('Mes Statistiques MED-MNG', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
      
      pdf.setFontSize(14);
      pdf.text('Résumé', 20, 50);
      
      pdf.setFontSize(11);
      pdf.text(`Niveau: ${gamificationStats?.level || 1}`, 20, 62);
      pdf.text(`XP Total: ${gamificationStats?.totalPoints?.toLocaleString() || 0}`, 20, 72);
      pdf.text(`Streak Actuel: ${streakData.current} jours`, 20, 82);
      pdf.text(`Record Streak: ${streakData.longest} jours`, 20, 92);
      pdf.text(`Activités cette semaine: ${personalStats?.totalActivities || 0}`, 20, 102);
      pdf.text(`Badges obtenus: ${gamificationStats?.badges?.length || 0}`, 20, 112);
      
      pdf.setFontSize(14);
      pdf.text('Progression', 20, 130);
      
      pdf.setFontSize(11);
      pdf.text(`Score moyen: ${personalStats?.averageScore || 0}%`, 20, 142);
      pdf.text(`Objectif hebdomadaire: ${gamificationStats?.weeklyGoalProgress || 0}%`, 20, 152);
      
      pdf.save('mes-statistiques-medmng.pdf');
      toast.success('PDF exporté avec succès !');
    } catch (err) {
      console.error('Erreur export PDF:', err);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  return (
    <>
      <Helmet>
        <title>Mes Statistiques | MED-MNG</title>
        <meta name="description" content="Tableaux de bord et statistiques personnelles de la plateforme MED-MNG" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Mes Statistiques</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Analyse de votre progression et performances sur MED-MNG
            </p>
          </div>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter en PDF
          </Button>
        </div>

        {/* Stats personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Niveau</CardTitle>
              <Star className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gamificationStats?.level || 1}</div>
              <p className="text-xs text-muted-foreground">{gamificationStats?.totalPoints?.toLocaleString() || 0} XP total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak Actuel</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakData.current} jours</div>
              <p className="text-xs text-muted-foreground">Record: {streakData.longest} jours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{personalStats?.totalActivities || 0}</div>
              <p className="text-xs text-muted-foreground">
                {personalStats?.trend > 0 ? '+' : ''}{personalStats?.trend || 0}% vs semaine dernière
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gamificationStats?.badges?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Obtenus</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques avec données réelles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité sur 7 jours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activité des 7 derniers jours
              </CardTitle>
              <CardDescription>
                Nombre d'activités par jour
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill={CHART_COLORS.chart1} name="Activités" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Pas encore de données d'activité
                </div>
              )}
            </CardContent>
          </Card>

          {/* Répartition par type d'activité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Répartition par Type
              </CardTitle>
              <CardDescription>
                Distribution de vos activités
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill={CHART_COLORS.chart1}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Pas encore de données d'activité
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indicateurs de Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Indicateurs de Progression
              </CardTitle>
              <CardDescription>
                Votre progression personnelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progression Niveau</span>
                    <Badge variant="secondary">
                      {gamificationStats?.totalPoints ? (gamificationStats.totalPoints % 1000) : 0}/1000 XP
                    </Badge>
                  </div>
                  <Progress 
                    value={gamificationStats?.totalPoints ? ((gamificationStats.totalPoints % 1000) / 10) : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Objectif Hebdomadaire</span>
                    <Badge variant="secondary">{gamificationStats?.weeklyGoalProgress || 0}%</Badge>
                  </div>
                  <Progress value={gamificationStats?.weeklyGoalProgress || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Score Moyen</span>
                    <Badge variant="secondary">{personalStats?.averageScore || 0}%</Badge>
                  </div>
                  <Progress value={personalStats?.averageScore || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Temps d'étude (cette semaine)</span>
                    <Badge variant="secondary">{Math.round((personalStats?.totalTime || 0) / 60)} min</Badge>
                  </div>
                  <Progress value={Math.min((personalStats?.totalTime || 0) / 36, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé des Tendances */}
        <Card>
          <CardHeader>
            <CardTitle>Votre Parcours</CardTitle>
            <CardDescription>
              Analyse de votre progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-success mb-2">📈 Cette Semaine</h3>
                <p className="text-sm text-muted-foreground">
                  {personalStats?.totalActivities || 0} activités complétées
                  {personalStats?.trend && personalStats.trend > 0 
                    ? `, soit ${personalStats.trend}% de plus que la semaine dernière !`
                    : '.'}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-primary mb-2">🔥 Streak</h3>
                <p className="text-sm text-muted-foreground">
                  Vous avez une série de {streakData.current} jours consécutifs.
                  {streakData.current >= streakData.longest && streakData.current > 0 
                    ? " C'est votre record !"
                    : ` Record: ${streakData.longest} jours.`}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-accent mb-2">🏆 Badges</h3>
                <p className="text-sm text-muted-foreground">
                  {gamificationStats?.badges?.length || 0} badges obtenus. 
                  Continuez pour en débloquer davantage !
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Statistics;