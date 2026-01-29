import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Heart, 
  Meh, 
  Smile, 
  Frown, 
  Angry, 
  Sparkles,
  TrendingUp,
  Brain,
  Moon,
  Sun
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MoodEntry {
  id: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  notes: string;
  factors: string[];
  created_at: string;
}

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
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    {
      id: '1',
      mood_score: 4,
      energy_level: 4,
      stress_level: 2,
      notes: 'Bonne journée de révision',
      factors: ['study', 'sleep'],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      mood_score: 3,
      energy_level: 2,
      stress_level: 4,
      notes: 'Examen demain...',
      factors: ['stress', 'study'],
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const logMood = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood_score: selectedMood,
      energy_level: energyLevel,
      stress_level: stressLevel,
      notes,
      factors: selectedFactors,
      created_at: new Date().toISOString(),
    };
    setMoodHistory(prev => [newEntry, ...prev]);
    setNotes('');
    setSelectedFactors([]);
    toast.success('Humeur enregistrée !', {
      description: 'Continue à suivre ton bien-être chaque jour'
    });
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

  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((acc, e) => acc + e.mood_score, 0) / moodHistory.length).toFixed(1)
    : '0';

  const todayEntry = moodHistory.find(e => 
    new Date(e.created_at).toDateString() === new Date().toDateString()
  );

  const last7Days = moodHistory.slice(0, 7);

  return (
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
            onClick={logMood}
          >
            <Sparkles className="h-4 w-4" />
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
                  <p className="text-2xl font-bold">{averageMood}</p>
                  {getMoodIcon(Math.round(Number(averageMood)))}
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
                  {last7Days.length >= 2
                    ? last7Days[0].mood_score >= last7Days[last7Days.length - 1].mood_score
                      ? '📈'
                      : '📉'
                    : '➡️'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique récent</CardTitle>
          <CardDescription>Tes 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          {last7Days.length > 0 ? (
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
  );
};

export default MoodTracker;
