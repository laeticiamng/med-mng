import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KaraokePlayer } from '@/components/karaoke/KaraokePlayer';
import { ECNPredictionCard } from '@/components/ai-tutor/ECNPredictionCard';
import { useKaraokeSession } from '@/hooks/useKaraokeSession';
import { useSynchronizedLyrics } from '@/hooks/useSynchronizedLyrics';
import { useBKTKnowledge } from '@/hooks/useBKTKnowledge';
import { 
  Mic, Music, Target, Trophy, BarChart3, 
  ArrowLeft, Play, BookOpen 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const KaraokePage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  
  const [song, setSong] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('karaoke');
  
  const { fetchQuizData, startSession, getSessionStats } = useKaraokeSession();
  const { lyricsData, loading: lyricsLoading, loadSynchronizedLyrics } = useSynchronizedLyrics(songId);
  const { getMasteryStats } = useBKTKnowledge();
  
  const [quizData, setQuizData] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [masteryStats, setMasteryStats] = useState<any>(null);

  useEffect(() => {
    if (songId) {
      loadSongData();
      loadQuizData();
      loadStats();
    }
  }, [songId]);

  const loadSongData = async () => {
    if (!songId) return;
    
    const { data, error } = await supabase
      .from('med_mng_songs')
      .select('*')
      .eq('id', songId)
      .maybeSingle();
    
    if (!error && data) {
      setSong(data);
    }
  };

  const loadQuizData = async () => {
    if (!songId) return;
    const data = await fetchQuizData(songId);
    setQuizData(data);
  };

  const loadStats = async () => {
    const [karaokeStats, mastery] = await Promise.all([
      getSessionStats(),
      getMasteryStats()
    ]);
    setSessionStats(karaokeStats);
    setMasteryStats(mastery);
  };

  const handleSessionComplete = async (score: number, maxScore: number) => {
    // Session completion is handled in the hook
    await loadStats();
  };

  // Mock lyrics for demo if none available
  const demoLyrics = [
    { time: 0, text: "Bienvenue dans le mode Karaoké" },
    { time: 3, text: "Apprenez la médecine en chantant" },
    { time: 6, text: "Les paroles contiennent les concepts clés" },
    { time: 9, text: "Remplissez les blancs pour tester vos connaissances", blanks: [{ position: 20, term: "blancs", hint: "espaces vides" }] },
    { time: 12, text: "L'hypertension artérielle est une maladie chronique", blanks: [{ position: 2, term: "hypertension", hint: "HTA" }] },
    { time: 16, text: "Elle nécessite un traitement au long cours" },
    { time: 20, text: "Les inhibiteurs de l'enzyme de conversion", blanks: [{ position: 4, term: "inhibiteurs", hint: "IEC" }] },
    { time: 24, text: "Sont un traitement de première intention" },
  ];

  const demoQCM = [
    {
      time: 15,
      question: "Quel est le seuil de l'hypertension artérielle ?",
      options: ["120/80 mmHg", "140/90 mmHg", "160/100 mmHg", "180/110 mmHg"],
      correct: 1,
      explanation: "L'HTA est définie par une PAS ≥ 140 et/ou PAD ≥ 90 mmHg"
    }
  ];

  const lyrics = lyricsData?.lyrics_data || demoLyrics;
  const audioUrl = song?.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mic className="h-6 w-6 text-primary" />
              Mode Karaoké Médical
            </h1>
            <p className="text-muted-foreground">
              Apprenez en chantant, testez vos connaissances
            </p>
          </div>
        </div>
        {song && (
          <Badge variant="outline" className="text-lg py-1 px-3">
            {song.title}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="karaoke" className="gap-2">
            <Mic className="h-4 w-4" />
            Karaoké
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="prediction" className="gap-2">
            <Target className="h-4 w-4" />
            Prédiction ECN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="karaoke" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <KaraokePlayer
                audioUrl={audioUrl}
                lyrics={lyrics}
                qcmQuestions={quizData?.qcm_questions || demoQCM}
                title={song?.title || "Chanson démo"}
                itemCode={song?.item_code}
                onSessionComplete={handleSessionComplete}
              />
            </div>
            
            <div className="space-y-4">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Statistiques rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionStats ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sessions</span>
                        <span className="font-bold">{sessionStats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score total</span>
                        <span className="font-bold">{sessionStats.totalScore} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Précision</span>
                        <span className="font-bold">{sessionStats.avgAccuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temps total</span>
                        <span className="font-bold">{sessionStats.totalTimeMinutes} min</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Commencez une session pour voir vos stats
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Mastery Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Maîtrise des concepts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {masteryStats ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {Math.round(masteryStats.masteryRate)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {masteryStats.masteredCount}/{masteryStats.totalConcepts} concepts maîtrisés
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Répondez aux quiz pour suivre votre progression
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Detailed Stats Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Sessions par type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionStats?.byType ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Écoute passive</span>
                      <Badge>{sessionStats.byType.listen}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Karaoké</span>
                      <Badge variant="secondary">{sessionStats.byType.karaoke}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Quiz</span>
                      <Badge variant="outline">{sessionStats.byType.quiz}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">Aucune donnée</p>
                )}
              </CardContent>
            </Card>

            {/* More stats cards can be added here */}
          </div>
        </TabsContent>

        <TabsContent value="prediction" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <ECNPredictionCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KaraokePage;
