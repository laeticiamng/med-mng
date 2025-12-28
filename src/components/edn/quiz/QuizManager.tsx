import React, { useState } from 'react';
import { QuizSelector, QuizConfig } from './QuizSelector';
import { QuizInterface } from './QuizInterface';
import { QuizGenerator } from './QuizGenerator';
import { QuizErrorSongGenerator } from '../music/QuizErrorSongGenerator';
import { QuizHistoryPanel } from './QuizHistoryPanel';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { useQuizResults } from '@/hooks/useQuizResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Music, Brain, Trophy, History } from 'lucide-react';
interface QuizManagerProps {
  item: {
    id: string;
    item_code: string;
    title: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    quiz_questions?: any;
  };
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  performance: {
    rangA: { correct: number; total: number };
    rangB: { correct: number; total: number };
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

export const QuizManager: React.FC<QuizManagerProps> = ({ item }) => {
  const [currentView, setCurrentView] = useState<'config' | 'quiz' | 'results'>('config');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  
  const { 
    currentErrors, 
    hasCurrentSession, 
    startQuizSession, 
    endQuizSession 
  } = useQuizErrorTracker();
  
  const { saveQuizResult } = useQuizResults();

  // Calculer le nombre total de questions disponibles
  const calculateTotalQuestions = () => {
    let total = 0;
    
    // Compter les questions existantes dans quiz_questions
    if (item.quiz_questions?.questions) {
      total += item.quiz_questions.questions.length;
    }
    
    // Compter les compétences disponibles pour générer des questions
    if (item.tableau_rang_a?.sections) {
      item.tableau_rang_a.sections.forEach((section: any) => {
        if (section.concepts) {
          total += section.concepts.length * 2; // 2 questions par concept
        }
      });
    }
    
    if (item.tableau_rang_b?.sections) {
      item.tableau_rang_b.sections.forEach((section: any) => {
        if (section.concepts) {
          total += section.concepts.length * 2; // 2 questions par concept
        }
      });
    }
    
    // Minimum garanti
    return Math.max(total, 20);
  };

  const handleStartQuiz = (config: QuizConfig) => {
    // Démarrer une session de tracking des erreurs
    startQuizSession(item.item_code, item.title, config.numberOfQuestions);
    
    // Générer les questions selon la configuration
    const generatedQuestions = QuizGenerator.generateQuestions(item, config);
    
    setQuizConfig(config);
    setQuizQuestions(generatedQuestions);
    setCurrentView('quiz');
  };

  const handleQuizComplete = async (results: QuizResults) => {
    setQuizResults(results);
    
    // Sauvegarder le résultat dans la base de données
    await saveQuizResult({
      itemCode: item.item_code,
      itemTitle: item.title,
      score: results.score,
      totalQuestions: results.totalQuestions,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers,
      timeSpent: results.timeSpent,
      performance: results.performance,
      answers: results.answers
    });
    
    // Terminer la session de tracking des erreurs
    endQuizSession(results.score);
    
    // Passer à la vue résultats
    setCurrentView('results');
  };

  const handleReturnToConfig = () => {
    setCurrentView('config');
    setQuizConfig(null);
    setQuizQuestions([]);
    setQuizResults(null);
  };

  const handleRestartQuiz = () => {
    setCurrentView('config');
    setQuizResults(null);
  };

  if (currentView === 'config') {
    return (
      <QuizSelector
        itemCode={item.item_code}
        itemTitle={item.title}
        totalQuestions={calculateTotalQuestions()}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  if (currentView === 'quiz' && quizConfig) {
    return (
      <QuizInterface
        itemCode={item.item_code}
        itemTitle={item.title}
        config={quizConfig}
        questions={quizQuestions}
        onQuizComplete={handleQuizComplete}
        onReturnToConfig={handleReturnToConfig}
      />
    );
  }

  if (currentView === 'results' && quizResults) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="song" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Chanson
              {currentErrors.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                  {currentErrors.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Trophy className="h-6 w-6" />
                  Résultats du Quiz {item.item_code}
                </CardTitle>
                <CardDescription className="text-primary/70">
                  Quiz terminé avec {quizResults.correctAnswers} bonnes réponses sur {quizResults.totalQuestions}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-success">
                      {quizResults.score}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {quizResults.correctAnswers}
                    </div>
                    <div className="text-sm text-muted-foreground">Correctes</div>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-warning">
                      {quizResults.wrongAnswers}
                    </div>
                    <div className="text-sm text-muted-foreground">Erreurs</div>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-accent">
                      {Math.round(quizResults.timeSpent / 60)}min
                    </div>
                    <div className="text-sm text-muted-foreground">Temps</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleRestartQuiz} className="w-full" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nouveau Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <QuizHistoryPanel itemCode={item.item_code} />
          </TabsContent>

          <TabsContent value="song" className="space-y-4">
            {currentErrors.length > 0 ? (
              <QuizErrorSongGenerator
                itemCode={item.item_code}
                itemTitle={item.title}
              />
            ) : (
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-success">
                    <Trophy className="h-6 w-6" />
                    Quiz parfait !
                  </CardTitle>
                  <CardDescription className="text-success/80">
                    Aucune erreur détectée - pas besoin de chanson d'aide-mémoire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Brain className="h-12 w-12 mx-auto text-success mb-2" />
                    <p className="text-success/80">
                      Excellent travail ! Vous maîtrisez parfaitement {item.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <div className="text-muted-foreground">Chargement du quiz...</div>
    </div>
  );
};