import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useMoodTracker } from '@/hooks/useMoodTracker';
import { 
  Calendar, 
  Heart, 
  Meh, 
  Smile, 
  Frown, 
  Angry, 
  Loader2,
  Sparkles,
  TrendingUp,
  Brain,
  Sun,
  Activity,
  BarChart3
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

const moodEmojis = [
  { score: 1, icon: Angry, label: 'Très mauvais', color: 'text-destructive' },
  { score: 2, icon: Frown, label: 'Mauvais', color: 'text-warning' },
  { score: 3, icon: Meh, label: 'Neutre', color: 'text-muted-foreground' },
  { score: 4, icon: Smile, label: 'Bon', color: 'text-primary' },
  { score: 5, icon: Heart, label: 'Excellent', color: 'text-success' },
];

const factors = [
  { id: 'sleep', label: '😴 Sommeil' },
  { id: 'exercise', label: '🏃 Sport' },
  { id: 'study', label: '📚 Études' },
  { id: 'social', label: '👥 Social' },
  { id: 'nutrition', label: '🥗 Nutrition' },
  { id: 'stress', label: '😰 Stress' },
];

const MoodTracker = () => {
  const { moodHistory, isLoading, logMood, isLogging, todayEntry, averageMood, last7Days, moodTrend } = useMoodTracker();
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleLogMood = () => {
    logMood({
      mood_score: selectedMood,
      energy_level: energyLevel,
      stress_level: stressLevel,
      notes,
      factors: selectedFactors,
    });
    setNotes('');
    setSelectedFactors([]);
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  const getMoodIcon = (score: number) => {
    const mood = moodEmojis.find(m => m.score === score);
    if (!mood) return null;
    const Icon = mood.icon;
    return <Icon className={`h-6 w-6 ${mood.color}`} />;
  };

  // Préparer les données pour le graphique d'évolution
  const chartData = useMemo(() => {
    return last7Days
      .slice()
      .reverse()
      .map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        humeur: entry.mood_score,
        énergie: entry.energy_level,
        stress: entry.stress_level,
      }));
  }, [last7Days]);

  // Calculer la corrélation entre stress et performance (simplifiée)
  const stressImpactAnalysis = useMemo(() => {
    if (moodHistory.length < 3) return null;
    
    const highStressDays = moodHistory.filter(e => e.stress_level >= 4);
    const lowStressDays = moodHistory.filter(e => e.stress_level <= 2);
    
    const avgMoodHighStress = highStressDays.length > 0 
      ? highStressDays.reduce((sum, e) => sum + e.mood_score, 0) / highStressDays.length 
      : 0;
    const avgMoodLowStress = lowStressDays.length > 0 
      ? lowStressDays.reduce((sum, e) => sum + e.mood_score, 0) / lowStressDays.length 
      : 0;
    
    return {
      highStressAvgMood: avgMoodHighStress.toFixed(1),
      lowStressAvgMood: avgMoodLowStress.toFixed(1),
      stressCorrelation: avgMoodLowStress > avgMoodHighStress ? 'negative' : 'neutral',
      recommendation: avgMoodLowStress > avgMoodHighStress + 0.5 
        ? 'Ton humeur est meilleure quand tu es moins stressé. Essaie de prendre des pauses régulières !' 
        : 'Continue à observer les facteurs qui influencent ton bien-être.'
    };
  }, [moodHistory]);

  return (
    <>
      <Helmet>
        <title>Suivi d'humeur | MED-MNG</title>
        <meta name="description" content="Suivez votre bien-être mental au quotidien avec le tracker d'humeur MED-MNG. Analysez vos tendances et identifiez les facteurs influençant votre état." />
        <meta name="keywords" content="humeur, bien-être, stress, énergie, suivi quotidien, médecine, étudiant" />
        <link rel="canonical" href="/mood" />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Suivi d'humeur</h1>
          </div>
          <p className="text-muted-foreground">
            Prenez soin de votre bien-être mental au quotidien
          </p>
        </div>

      {/* Today's Check-in */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-warning" />
            Comment te sens-tu aujourd'hui ?
          </CardTitle>
          <CardDescription>
            {todayEntry 
              ? 'Tu as déjà enregistré ton humeur aujourd\'hui ✓' 
              : 'Prends un moment pour faire le point'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Humeur générale</label>
            <div className="flex justify-center gap-4">
              {moodEmojis.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.score}
                    onClick={() => setSelectedMood(mood.score)}
                    className={`p-4 rounded-full transition-all ${
                      selectedMood === mood.score 
                        ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    title={mood.label}
                  >
                    <Icon className={`h-8 w-8 ${mood.color}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Niveau d'énergie</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    energyLevel === level 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {level === 1 ? '😴' : level === 2 ? '🥱' : level === 3 ? '😐' : level === 4 ? '⚡' : '🔥'}
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Niveau de stress</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setStressLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    stressLevel === level 
                      ? 'bg-warning text-warning-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Calme</span>
              <span>Très stressé</span>
            </div>
          </div>

          {/* Factors */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Facteurs influents</label>
            <div className="flex flex-wrap gap-2">
              {factors.map((factor) => (
                <Button
                  key={factor.id}
                  variant={selectedFactors.includes(factor.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFactor(factor.id)}
                >
                  {factor.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Notes (optionnel)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comment s'est passée ta journée ? Qu'est-ce qui t'a marqué ?"
              rows={3}
            />
          </div>

          <Button 
            className="w-full gap-2" 
            onClick={handleLogMood}
            disabled={isLogging}
          >
            {isLogging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Enregistrer mon humeur
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humeur moyenne</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{averageMood.toFixed(1)}</p>
                  {getMoodIcon(Math.round(averageMood))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entrées ce mois</p>
                <p className="text-2xl font-bold">{moodHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tendance</p>
                <p className="text-2xl font-bold">
                  {moodTrend === 'up' ? '📈' : moodTrend === 'down' ? '📉' : '➡️'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Évolution sur 7 jours
            </CardTitle>
            <CardDescription>
              Visualise tes tendances d'humeur, énergie et stress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="humeur" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorMood)"
                    strokeWidth={2}
                    name="😊 Humeur"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="énergie" 
                    stroke="hsl(var(--success))" 
                    fill="url(#colorEnergy)"
                    strokeWidth={2}
                    name="⚡ Énergie"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="hsl(var(--warning))" 
                    fill="url(#colorStress)"
                    strokeWidth={2}
                    name="😰 Stress"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyse d'impact du stress */}
      {stressImpactAnalysis && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Analyse Stress / Performance
            </CardTitle>
            <CardDescription>
              Impact du stress sur ton bien-être
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground">Humeur (stress faible)</p>
                <p className="text-3xl font-bold text-success">{stressImpactAnalysis.lowStressAvgMood}/5</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground">Humeur (stress élevé)</p>
                <p className="text-3xl font-bold text-warning">{stressImpactAnalysis.highStressAvgMood}/5</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{stressImpactAnalysis.recommendation}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique récent</CardTitle>
          <CardDescription>Tes 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : last7Days.length > 0 ? (
            <div className="space-y-3">
              {last7Days.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getMoodIcon(entry.mood_score)}
                    <div>
                      <p className="font-medium">
                        {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">⚡ {entry.energy_level}</Badge>
                    <Badge variant="outline">😰 {entry.stress_level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun historique pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Commence à suivre ton humeur pour voir tes tendances !
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default MoodTracker;
