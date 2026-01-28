import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    BarChart3,
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Eye,
    Flame,
    Layers,
    Play,
    Plus,
    Sparkles,
    Trash2,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function Flashcards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    loading, decks, currentDeck, cards,
    loadDecks, createDeck, deleteDeck, loadCards, addCard, deleteCard,
    generateFromItem, recordReview, getStats
  } = useFlashcards();
  const { addPoints, unlockBadge, checkAndUnlockBadges, stats: gamificationStats } = useGamification();
  const { logActivity } = useActivityTracking();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('decks');
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // New deck form
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState('');
  const [showNewDeckDialog, setShowNewDeckDialog] = useState(false);
  
  // New card form
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  
  // AI generation
  const [itemCodeToGenerate, setItemCodeToGenerate] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  // Review state
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour accéder aux flashcards",
          variant: "destructive"
        });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      loadDecks(user.id);
      getStats(user.id).then(setStats);
    };
    checkAuth();
  }, [navigate, toast, loadDecks, getStats]);

  const handleCreateDeck = async () => {
    if (!user || !newDeckName) return;
    
    await createDeck(user.id, newDeckName, newDeckDescription, newDeckCategory);
    setNewDeckName('');
    setNewDeckDescription('');
    setNewDeckCategory('');
    setShowNewDeckDialog(false);
    loadDecks(user.id);
    getStats(user.id).then(setStats);
  };

  const handleDeleteDeck = async (deckId: string) => {
    await deleteDeck(deckId);
    if (user) {
      loadDecks(user.id);
      getStats(user.id).then(setStats);
    }
  };

  const handleSelectDeck = async (deckId: string) => {
    await loadCards(deckId);
    setActiveTab('cards');
  };

  const handleAddCard = async () => {
    if (!currentDeck || !newCardFront || !newCardBack) return;
    
    await addCard(currentDeck.id, newCardFront, newCardBack);
    setNewCardFront('');
    setNewCardBack('');
    setShowNewCardDialog(false);
    loadCards(currentDeck.id);
    if (user) getStats(user.id).then(setStats);
  };

  const handleGenerateFromItem = async () => {
    if (!currentDeck || !itemCodeToGenerate) return;
    
    await generateFromItem(currentDeck.id, itemCodeToGenerate);
    setItemCodeToGenerate('');
    setShowAIDialog(false);
    loadCards(currentDeck.id);
    if (user) getStats(user.id).then(setStats);
  };

  const handleStartReview = () => {
    setReviewMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setReviewStats({ correct: 0, incorrect: 0 });
  };

  const handleReviewAnswer = async (wasCorrect: boolean) => {
    const currentCard = cards[currentCardIndex];
    await recordReview(currentCard.id, wasCorrect);
    
    // Gamification: Award points for flashcard review
    if (user) {
      await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
      await logActivity({ 
        activity_type: 'flashcard', 
        count: 1, 
        score: wasCorrect ? 100 : 0,
        metadata: { deckId: currentDeck?.id }
      });
      
      // Track total reviews for badge
      const newTotal = totalReviews + 1;
      setTotalReviews(newTotal);
      
      // Unlock badges based on reviews
      if (newTotal >= 10) await unlockBadge(user.id, 'items_10');
      if (newTotal >= 50) await unlockBadge(user.id, 'items_50');
      
      await checkAndUnlockBadges(user.id);
    }
    
    setReviewStats(prev => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1)
    }));

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Review complete
      setReviewMode(false);
      
      const finalCorrect = reviewStats.correct + (wasCorrect ? 1 : 0);
      const score = Math.round((finalCorrect / cards.length) * 100);
      
      toast({
        title: "Révision terminée !",
        description: `${finalCorrect} / ${cards.length} cartes correctes (${score}%)`,
      });
      
      // Bonus for perfect score
      if (user && score === 100) {
        await addPoints(user.id, POINTS_CONFIG.perfectExam, 'perfectExam');
        await unlockBadge(user.id, 'perfect_exam');
      }
      
      if (user) getStats(user.id).then(setStats);
    }
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/5">
      <Helmet>
        <title>Flashcards | MED-MNG</title>
        <meta name="description" content="Flashcards personnalisées pour mémoriser le référentiel EDN" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-warning to-primary bg-clip-text text-transparent">
              Révision flash
            </h1>
            <p className="text-muted-foreground">Pour les moments de fatigue. 5 minutes, c'est déjà avancer.</p>
          </div>
        </div>

        {/* Review Mode */}
        {reviewMode && currentCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setReviewMode(false)}>
                <XCircle className="h-4 w-4 mr-2" />
                Quitter
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentCardIndex + 1} / {cards.length}
              </span>
            </div>
            
            <Progress value={((currentCardIndex + 1) / cards.length) * 100} className="h-2" />

            <Card className="min-h-[300px] flex flex-col">
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                {!showAnswer ? (
                  <>
                    <p className="text-xl text-center mb-8">{currentCard.front}</p>
                    <Button onClick={() => setShowAnswer(true)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      Voir la réponse
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Question:</p>
                    <p className="text-center mb-4">{currentCard.front}</p>
                    <div className="w-full h-px bg-border my-4" />
                    <p className="text-sm text-muted-foreground mb-2">Réponse:</p>
                    <p className="text-xl text-center font-medium mb-8">{currentCard.back}</p>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReviewAnswer(false)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Incorrect
                      </Button>
                      <Button 
                        onClick={() => handleReviewAnswer(true)}
                        className="gap-2 bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Correct
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="h-4 w-4" />
                {reviewStats.correct}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-4 w-4" />
                {reviewStats.incorrect}
              </span>
            </div>
          </div>
        )}

        {/* Normal Mode */}
        {!reviewMode && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="decks" className="gap-2">
                <Layers className="h-4 w-4" />
                Decks
              </TabsTrigger>
              <TabsTrigger value="cards" disabled={!currentDeck} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Cartes
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Decks */}
            <TabsContent value="decks">
              <div className="space-y-4">
                {/* Create deck button */}
                <Dialog open={showNewDeckDialog} onOpenChange={setShowNewDeckDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Créer un deck
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau deck</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nom</Label>
                        <Input 
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          placeholder="Ex: Cardiologie - Items essentiels"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea 
                          value={newDeckDescription}
                          onChange={(e) => setNewDeckDescription(e.target.value)}
                          placeholder="Description du deck..."
                        />
                      </div>
                      <div>
                        <Label>Catégorie</Label>
                        <Input 
                          value={newDeckCategory}
                          onChange={(e) => setNewDeckCategory(e.target.value)}
                          placeholder="Ex: Cardiologie"
                        />
                      </div>
                      <Button onClick={handleCreateDeck} className="w-full">
                        Créer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Decks list */}
                {decks.length === 0 ? (
                  <Card className="text-center p-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun deck créé</p>
                    <p className="text-sm text-muted-foreground">Créez votre premier deck pour commencer</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {decks.map((deck) => (
                      <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleSelectDeck(deck.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-xl">
                                  {deck.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{deck.name}</h3>
                                  <p className="text-sm text-muted-foreground">{deck.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{deck.cardCount} cartes</Badge>
                                {deck.category && <Badge variant="secondary">{deck.category}</Badge>}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteDeck(deck.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cards */}
            <TabsContent value="cards">
              {currentDeck && (
                <div className="space-y-4">
                  {/* Deck header */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold">{currentDeck.name}</h2>
                          <p className="text-sm text-muted-foreground">{cards.length} cartes</p>
                        </div>
                        <div className="flex gap-2">
                          {cards.length > 0 && (
                            <Button onClick={handleStartReview} className="gap-2">
                              <Play className="h-4 w-4" />
                              Réviser
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add card buttons */}
                  <div className="flex gap-2">
                    <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Plus className="h-4 w-4" />
                          Ajouter une carte
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nouvelle carte</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Recto (Question)</Label>
                            <Textarea 
                              value={newCardFront}
                              onChange={(e) => setNewCardFront(e.target.value)}
                              placeholder="Question..."
                            />
                          </div>
                          <div>
                            <Label>Verso (Réponse)</Label>
                            <Textarea 
                              value={newCardBack}
                              onChange={(e) => setNewCardBack(e.target.value)}
                              placeholder="Réponse..."
                            />
                          </div>
                          <Button onClick={handleAddCard} className="w-full">
                            Ajouter
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Sparkles className="h-4 w-4" />
                          Générer depuis un item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Génération automatique</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Code de l'item (ex: 228)</Label>
                            <Input 
                              value={itemCodeToGenerate}
                              onChange={(e) => setItemCodeToGenerate(e.target.value)}
                              placeholder="228"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Des cartes seront générées automatiquement à partir des compétences de l'item.
                          </p>
                          <Button 
                            onClick={handleGenerateFromItem} 
                            disabled={loading}
                            className="w-full gap-2"
                          >
                            <Sparkles className="h-4 w-4" />
                            Générer les cartes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Cards list */}
                  {cards.length === 0 ? (
                    <Card className="text-center p-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune carte dans ce deck</p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {cards.map((card, _index) => (
                        <Card key={card.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{card.front}</p>
                                <p className="text-sm text-muted-foreground mt-1">{card.back}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {card.itemCode && (
                                    <Badge variant="outline">{card.itemCode}</Badge>
                                  )}
                                  <Badge variant="secondary">{card.reviewCount} révisions</Badge>
                                  {card.reviewCount > 0 && (
                                    <Badge variant={
                                      (card.correctCount / card.reviewCount) >= 0.7 ? 'default' : 'destructive'
                                    }>
                                      {Math.round((card.correctCount / card.reviewCount) * 100)}% correct
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteCard(card.id).then(() => loadCards(currentDeck.id))}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Stats */}
            <TabsContent value="stats">
              {stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Layers className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stats.totalDecks}</p>
                        <p className="text-sm text-muted-foreground">Decks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-accent" />
                        <p className="text-2xl font-bold">{stats.totalCards}</p>
                        <p className="text-sm text-muted-foreground">Cartes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Flame className="h-8 w-8 mx-auto mb-2 text-warning" />
                        <p className="text-2xl font-bold">{stats.streakDays}</p>
                        <p className="text-sm text-muted-foreground">Jours de suite</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
                        <p className="text-2xl font-bold">{stats.accuracy}%</p>
                        <p className="text-sm text-muted-foreground">Précision</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Weekly progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Activité hebdomadaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between h-32 gap-2">
                        {stats.weeklyProgress.map((count, index) => {
                          const maxCount = Math.max(...stats.weeklyProgress, 1);
                          const height = (count / maxCount) * 100;
                          const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-primary/20 rounded-t"
                                style={{ height: `${Math.max(height, 4)}%` }}
                              >
                                <div 
                                  className="w-full bg-primary rounded-t transition-all"
                                  style={{ height: '100%' }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">{days[index]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Cartes révisées aujourd'hui</p>
                      <p className="text-4xl font-bold text-primary">{stats.todayReviewed}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
