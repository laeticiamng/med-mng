import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, Clock, CheckCircle, XCircle, ArrowRight, 
  RotateCcw, Zap, Star, TrendingUp, Calendar, Target,
  Play, Pause, ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSRS, ReviewQuality, UserItemProgress } from '@/hooks/useSRS';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/config/routes';

interface ReviewItem {
  item_code: string;
  title: string;
  progress?: UserItemProgress;
  isNew?: boolean;
}

export default function SRSReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    stats, 
    getStats, 
    getDueItems, 
    getNewItems, 
    recordReview, 
    startSession, 
    completeSession,
    loading 
  } = useSRS();

  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, again: 0 });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [itemStartTime, setItemStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [itemDetails, setItemDetails] = useState<any>(null);

  // Check auth and load stats
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour utiliser le système de révision",
          variant: "destructive"
        });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      getStats(user.id);
    };
    checkAuth();
  }, [navigate, toast, getStats]);

  // Load review queue
  const loadReviewQueue = useCallback(async () => {
    if (!user) return;

    const dueItems = await getDueItems(user.id, 20);
    const dueItemCodes = dueItems.map(d => d.item_code);
    
    // Get new items if we have less than 20 due
    let newItemsToAdd: any[] = [];
    if (dueItems.length < 20) {
      const existingCodes = dueItems.map(d => d.item_code);
      const { data: userProgress } = await supabase
        .from('user_item_progress')
        .select('item_code')
        .eq('user_id', user.id);
      
      const allStudiedCodes = userProgress?.map(p => p.item_code) || [];
      newItemsToAdd = await getNewItems(user.id, allStudiedCodes, 20 - dueItems.length);
    }

    // Get item details for due items
    const allItemCodes = [...dueItemCodes, ...newItemsToAdd.map(n => n.item_code)];
    const { data: itemsData } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title')
      .in('item_code', allItemCodes);

    const itemsMap = new Map(itemsData?.map(i => [i.item_code, i]) || []);

    const queue: ReviewItem[] = [
      ...dueItems.map(d => ({
        item_code: d.item_code,
        title: itemsMap.get(d.item_code)?.title || d.item_code,
        progress: d,
        isNew: false
      })),
      ...newItemsToAdd.map(n => ({
        item_code: n.item_code,
        title: n.title,
        isNew: true
      }))
    ];

    setReviewQueue(queue);
  }, [user, getDueItems, getNewItems]);

  useEffect(() => {
    if (user) {
      loadReviewQueue();
    }
  }, [user, loadReviewQueue]);

  // Load current item details
  useEffect(() => {
    const loadItemDetails = async () => {
      if (reviewQueue.length === 0 || currentIndex >= reviewQueue.length) return;
      
      const currentItem = reviewQueue[currentIndex];
      const { data } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', currentItem.item_code)
        .single();
      
      setItemDetails(data);
      setItemStartTime(new Date());
    };

    if (isSessionActive) {
      loadItemDetails();
      setShowAnswer(false);
    }
  }, [currentIndex, reviewQueue, isSessionActive]);

  // Start session
  const handleStartSession = async () => {
    if (!user) return;
    
    const session = await startSession(user.id, 'mixed');
    if (session) {
      setSessionId(session.id);
      setIsSessionActive(true);
      setStartTime(new Date());
      setCurrentIndex(0);
      setSessionStats({ reviewed: 0, correct: 0, again: 0 });
    }
  };

  // Handle review response
  const handleResponse = async (quality: ReviewQuality) => {
    if (!user || !reviewQueue[currentIndex]) return;

    const currentItem = reviewQueue[currentIndex];
    const responseTime = itemStartTime ? Date.now() - itemStartTime.getTime() : undefined;

    await recordReview(
      user.id,
      currentItem.item_code,
      quality,
      responseTime,
      sessionId || undefined
    );

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      again: prev.again + (quality < 3 ? 1 : 0)
    }));

    // Move to next item
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      await handleEndSession();
    }
  };

  // End session
  const handleEndSession = async () => {
    if (sessionId && startTime) {
      const totalTime = Math.round((Date.now() - startTime.getTime()) / 1000);
      await completeSession(
        sessionId,
        sessionStats.reviewed,
        sessionStats.correct,
        sessionStats.again,
        totalTime
      );
    }

    setIsSessionActive(false);
    toast({
      title: "Session terminée !",
      description: `${sessionStats.reviewed} items révisés, ${sessionStats.correct} corrects`,
    });
    
    // Refresh stats
    if (user) {
      getStats(user.id);
      loadReviewQueue();
    }
  };

  const currentItem = reviewQueue[currentIndex];
  const progressPercent = reviewQueue.length > 0 
    ? ((currentIndex + (showAnswer ? 0.5 : 0)) / reviewQueue.length) * 100 
    : 0;

  // Get competences from item details
  const getCompetences = () => {
    if (!itemDetails) return [];
    
    const competences: string[] = [];
    
    if (itemDetails.tableau_rang_a?.competences_cles) {
      itemDetails.tableau_rang_a.competences_cles.forEach((c: any) => {
        if (c.intitule) competences.push(c.intitule);
      });
    }
    
    if (itemDetails.tableau_rang_b?.competences_cles) {
      itemDetails.tableau_rang_b.competences_cles.slice(0, 3).forEach((c: any) => {
        if (c.intitule) competences.push(c.intitule);
      });
    }
    
    return competences.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>Révision SRS | MED-MNG</title>
        <meta name="description" content="Système de répétition espacée pour mémoriser efficacement les items EDN" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Révision Espacée
            </h1>
            <p className="text-muted-foreground">Algorithme SM-2 pour une mémorisation optimale</p>
          </div>
        </div>

        {/* Stats Dashboard */}
        {!isSessionActive && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-2xl font-bold text-destructive">{stats?.dueToday || 0}</p>
                <p className="text-sm text-muted-foreground">À réviser</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{stats?.newItems || 0}</p>
                <p className="text-sm text-muted-foreground">Nouveaux</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold text-warning">{stats?.learningItems || 0}</p>
                <p className="text-sm text-muted-foreground">En apprentissage</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold text-success">{stats?.masteredItems || 0}</p>
                <p className="text-sm text-muted-foreground">Maîtrisés</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Start Session Button */}
        {!isSessionActive && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Prêt à réviser ?</h2>
              <p className="text-muted-foreground mb-6">
                {reviewQueue.length} items dans la file d'attente
              </p>
              <Button 
                size="lg" 
                onClick={handleStartSession}
                disabled={reviewQueue.length === 0 || loading}
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Commencer la session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Review Session */}
        {isSessionActive && currentItem && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentIndex + 1} / {reviewQueue.length}</span>
                <span>{sessionStats.correct} corrects</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Review Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={currentItem.isNew ? "default" : "secondary"}>
                      {currentItem.isNew ? "Nouveau" : "Révision"}
                    </Badge>
                    <span className="font-mono text-lg">{currentItem.item_code}</span>
                  </div>
                  {currentItem.progress && (
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Intervalle: {currentItem.progress.interval_days}j
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-2">{currentItem.title}</CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {!showAnswer ? (
                  // Question Side
                  <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground mb-8">
                      Quelles sont les compétences clés de cet item ?
                    </p>
                    <Button size="lg" onClick={() => setShowAnswer(true)} className="gap-2">
                      <Zap className="h-5 w-5" />
                      Voir la réponse
                    </Button>
                  </div>
                ) : (
                  // Answer Side
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Compétences clés:</h4>
                      <ul className="space-y-2">
                        {getCompetences().map((comp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                            <span className="text-sm">{comp}</span>
                          </li>
                        ))}
                        {getCompetences().length === 0 && (
                          <li className="text-muted-foreground">Chargement des compétences...</li>
                        )}
                      </ul>
                    </div>

                    {/* Response Buttons */}
                    <div className="border-t pt-6">
                      <p className="text-center text-sm text-muted-foreground mb-4">
                        Comment évaluez-vous votre réponse ?
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleResponse(0)}
                          className="flex-col h-auto py-3"
                        >
                          <RotateCcw className="h-5 w-5 mb-1" />
                          <span className="text-xs">À revoir</span>
                          <span className="text-[10px] opacity-70">&lt;1min</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleResponse(3)}
                          className="flex-col h-auto py-3 border-warning text-warning hover:bg-warning/10"
                        >
                          <XCircle className="h-5 w-5 mb-1" />
                          <span className="text-xs">Difficile</span>
                          <span className="text-[10px] opacity-70">1j</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleResponse(4)}
                          className="flex-col h-auto py-3 border-success text-success hover:bg-success/10"
                        >
                          <CheckCircle className="h-5 w-5 mb-1" />
                          <span className="text-xs">Correct</span>
                          <span className="text-[10px] opacity-70">
                            {currentItem.progress 
                              ? `${Math.round((currentItem.progress.interval_days || 1) * (currentItem.progress.ease_factor || 2.5))}j`
                              : '1j'
                            }
                          </span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleResponse(5)}
                          className="flex-col h-auto py-3 border-primary text-primary hover:bg-primary/10"
                        >
                          <Star className="h-5 w-5 mb-1" />
                          <span className="text-xs">Facile</span>
                          <span className="text-[10px] opacity-70">4j</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Controls */}
            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleEndSession} className="gap-2">
                <Pause className="h-4 w-4" />
                Terminer la session
              </Button>
            </div>
          </div>
        )}

        {/* Session Complete */}
        {isSessionActive && !currentItem && sessionStats.reviewed > 0 && (
          <Card className="text-center p-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
            <h2 className="text-2xl font-bold mb-2">Session terminée !</h2>
            <p className="text-muted-foreground mb-6">
              {sessionStats.reviewed} items révisés • {sessionStats.correct} corrects • {sessionStats.again} à revoir
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                Retour aux items
              </Button>
              <Button onClick={handleStartSession}>
                Nouvelle session
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
