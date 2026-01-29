// AI-powered ECOS feedback component
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Award, BookOpen, CheckCircle, Loader2, MessageSquare, Sparkles, Target, TrendingUp, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface EcosStep {
  step_number: number;
  title: string;
  description: string;
  user_response?: string;
  expected_response?: string;
  is_correct?: boolean;
}

interface QuizAnswer {
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface EcosFeedbackAIProps {
  scenarioTitle: string;
  scenarioId: number;
  steps: EcosStep[];
  quizAnswers?: QuizAnswer[];
  timeSpent: number; // in seconds
  onClose?: () => void;
}

interface FeedbackSection {
  title: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  feedback: string;
  recommendations: string[];
}

export const EcosFeedbackAI: React.FC<EcosFeedbackAIProps> = ({
  scenarioTitle,
  scenarioId,
  steps,
  quizAnswers = [],
  timeSpent,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    globalScore: number;
    globalFeedback: string;
    sections: FeedbackSection[];
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  } | null>(null);
  const { toast } = useToast();

  const generateFeedback = async () => {
    setLoading(true);

    try {
      // Prepare context for AI
      const stepsContext = steps.map(s => ({
        step: s.step_number,
        title: s.title,
        response: s.user_response || 'Non répondu',
        correct: s.is_correct
      }));

      const quizContext = quizAnswers.map(q => ({
        question: q.question,
        userAnswer: q.user_answer,
        correct: q.is_correct
      }));

      const correctSteps = steps.filter(s => s.is_correct).length;
      const correctQuiz = quizAnswers.filter(q => q.is_correct).length;
      const totalScore = ((correctSteps / Math.max(1, steps.length)) * 0.6 + (correctQuiz / Math.max(1, quizAnswers.length)) * 0.4) * 100;

      const { data, error } = await supabase.functions.invoke('medical-chat-ai', {
        body: {
          messages: [
            {
              role: 'system',
              content: `Tu es un examinateur ECOS bienveillant et pédagogue. Analyse la performance de l'étudiant et fournis un feedback constructif et détaillé.

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide (pas de texte autour):
{
  "globalScore": <nombre 0-100>,
  "globalFeedback": "<2-3 phrases d'évaluation globale>",
  "sections": [
    {
      "category": "communication|clinique|raisonnement|technique",
      "score": <0-100>,
      "feedback": "<feedback spécifique>",
      "recommendations": ["<conseil 1>", "<conseil 2>"]
    }
  ],
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "improvements": ["<point à améliorer 1>", "<point à améliorer 2>"],
  "nextSteps": ["<prochaine étape 1>", "<prochaine étape 2>"]
}`
            },
            {
              role: 'user',
              content: `Analyse cette simulation ECOS:

Scénario: ${scenarioTitle} (SD ${scenarioId})
Temps passé: ${Math.round(timeSpent / 60)} minutes

Étapes complétées:
${JSON.stringify(stepsContext, null, 2)}

Réponses au quiz:
${JSON.stringify(quizContext, null, 2)}

Score brut: ${Math.round(totalScore)}%
Étapes réussies: ${correctSteps}/${steps.length}
Quiz réussi: ${correctQuiz}/${quizAnswers.length}

Fournis un feedback détaillé et constructif.`
            }
          ],
          model: 'google/gemini-2.5-flash'
        }
      });

      if (error) throw error;

      // Parse response
      let parsedFeedback;
      try {
        const content = data.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedFeedback = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Impossible de parser le feedback');
      }

      // Map categories to icons
      const categoryIcons: Record<string, React.ReactNode> = {
        communication: <MessageSquare className="h-5 w-5" />,
        clinique: <Target className="h-5 w-5" />,
        raisonnement: <BookOpen className="h-5 w-5" />,
        technique: <TrendingUp className="h-5 w-5" />,
      };

      const sections: FeedbackSection[] = (parsedFeedback.sections || []).map((s: any) => ({
        title: s.category.charAt(0).toUpperCase() + s.category.slice(1),
        icon: categoryIcons[s.category] || <Target className="h-5 w-5" />,
        score: s.score,
        maxScore: 100,
        feedback: s.feedback,
        recommendations: s.recommendations || [],
      }));

      setFeedback({
        globalScore: parsedFeedback.globalScore || Math.round(totalScore),
        globalFeedback: parsedFeedback.globalFeedback || 'Analyse terminée.',
        sections,
        strengths: parsedFeedback.strengths || [],
        improvements: parsedFeedback.improvements || [],
        nextSteps: parsedFeedback.nextSteps || [],
      });

    } catch (error: any) {
      console.error('Feedback error:', error);
      toast({
        title: 'Erreur de génération',
        description: error.message || 'Impossible de générer le feedback IA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 80) return { label: 'Très bien', variant: 'default' as const };
    if (score >= 70) return { label: 'Bien', variant: 'secondary' as const };
    if (score >= 60) return { label: 'Passable', variant: 'outline' as const };
    return { label: 'À améliorer', variant: 'destructive' as const };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Feedback IA détaillé
        </CardTitle>
        <CardDescription>
          Analyse approfondie de votre performance ECOS
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!feedback && !loading && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p className="text-muted-foreground mb-4">
              Obtenez une analyse détaillée de votre simulation avec des conseils personnalisés
            </p>
            <Button onClick={generateFeedback} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Générer le feedback IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyse de votre performance...</p>
          </div>
        )}

        {feedback && (
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-6">
              {/* Global Score */}
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                <div className={`text-5xl font-bold mb-2 ${getScoreColor(feedback.globalScore)}`}>
                  {feedback.globalScore}%
                </div>
                <Badge {...getScoreBadge(feedback.globalScore)}>
                  {getScoreBadge(feedback.globalScore).label}
                </Badge>
                <p className="mt-4 text-muted-foreground">{feedback.globalFeedback}</p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Évaluation par compétence
                </h4>
                {feedback.sections.map((section, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(section.score)}`}>
                          {section.score}%
                        </span>
                      </div>
                      <Progress value={section.score} className="h-2 mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">{section.feedback}</p>
                      {section.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Recommandations:</p>
                          <ul className="text-xs space-y-1">
                            {section.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-success/30 bg-success/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      Points forts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {feedback.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Award className="h-3 w-3 text-success mt-1 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-warning/30 bg-warning/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      Points à améliorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {feedback.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-warning mt-1 shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Next Steps */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Prochaines étapes recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {onClose && (
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Fermer
                </Button>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
