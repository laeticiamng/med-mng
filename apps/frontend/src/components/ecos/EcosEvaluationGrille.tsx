/**
 * ECOS Evaluation Grille Component
 * Displays and manages evaluation criteria for ECOS scenarios
 *
 * Features:
 * - View evaluation criteria
 * - Score user performance
 * - Calculate total scores
 * - Provide feedback
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  CheckCircle,
  Circle,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface EvaluationCriterion {
  id: string;
  criterion_name: string;
  criterion_description?: string;
  max_points: number;
  category: 'communication' | 'examination' | 'diagnosis' | 'management' | 'professionalism';
  order_index: number;
  is_mandatory: boolean;
  hints?: string;
}

interface CriterionScore {
  criterion_id: string;
  points_earned: number;
  feedback?: string;
}

interface EcosEvaluationGrilleProps {
  situationId: string;
  sessionId?: string; // If evaluating an existing session
  isReadOnly?: boolean; // View only mode
  onScoreUpdate?: (scores: CriterionScore[], totalScore: number, maxScore: number) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    communication: 'bg-blue-500',
    examination: 'bg-green-500',
    diagnosis: 'bg-purple-500',
    management: 'bg-orange-500',
    professionalism: 'bg-pink-500',
  };
  return colors[category] || 'bg-gray-500';
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    communication: 'Communication',
    examination: 'Examen',
    diagnosis: 'Diagnostic',
    management: 'Prise en charge',
    professionalism: 'Professionnalisme',
  };
  return labels[category] || category;
};

export const EcosEvaluationGrille: React.FC<EcosEvaluationGrilleProps> = ({
  situationId,
  sessionId,
  isReadOnly = false,
  onScoreUpdate,
}) => {
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [scores, setScores] = useState<Map<string, CriterionScore>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selfReflection, setSelfReflection] = useState('');
  const { toast } = useToast();

  // Fetch evaluation criteria
  useEffect(() => {
    fetchCriteria();
    if (sessionId) {
      fetchSessionScores();
    }
  }, [situationId, sessionId]);

  const fetchCriteria = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_ecos_criteria', {
        p_situation_id: situationId,
      });

      if (error) throw error;

      setCriteria(data || []);
    } catch (err: any) {
      console.error('Error fetching criteria:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les critères d\'évaluation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionScores = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('ecos_session_scores')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      const scoresMap = new Map<string, CriterionScore>();
      data?.forEach((score) => {
        scoresMap.set(score.criterion_id, {
          criterion_id: score.criterion_id,
          points_earned: score.points_earned,
          feedback: score.feedback,
        });
      });

      setScores(scoresMap);
    } catch (err: any) {
      console.error('Error fetching session scores:', err);
    }
  };

  // Update score for a criterion
  const updateScore = (criterionId: string, points: number, feedback?: string) => {
    const newScores = new Map(scores);
    newScores.set(criterionId, {
      criterion_id: criterionId,
      points_earned: points,
      feedback,
    });
    setScores(newScores);

    // Calculate totals
    const totalEarned = Array.from(newScores.values()).reduce(
      (sum, score) => sum + score.points_earned,
      0
    );
    const maxPossible = criteria.reduce((sum, c) => sum + c.max_points, 0);

    onScoreUpdate?.(Array.from(newScores.values()), totalEarned, maxPossible);
  };

  // Calculate current totals
  const totalEarned = Array.from(scores.values()).reduce(
    (sum, score) => sum + score.points_earned,
    0
  );
  const maxPossible = criteria.reduce((sum, c) => sum + c.max_points, 0);
  const percentage = maxPossible > 0 ? (totalEarned / maxPossible) * 100 : 0;

  // Group criteria by category
  const criteriaByCategory = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, EvaluationCriterion[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-600" />
            Grille d'Évaluation ECOS
          </CardTitle>
          <CardDescription>
            {criteria.length} critères d'évaluation · {maxPossible} points maximum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score Total</span>
                <span className="text-2xl font-bold">
                  {totalEarned} / {maxPossible}
                </span>
              </div>
              <Progress value={percentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {percentage.toFixed(1)}% de réussite
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(criteriaByCategory).map(([category, cats]) => {
                const categoryMax = cats.reduce((sum, c) => sum + c.max_points, 0);
                const categoryEarned = cats.reduce((sum, c) => {
                  const score = scores.get(c.id);
                  return sum + (score?.points_earned || 0);
                }, 0);
                const categoryPercent =
                  categoryMax > 0 ? (categoryEarned / categoryMax) * 100 : 0;

                return (
                  <div
                    key={category}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('w-3 h-3 rounded-full', getCategoryColor(category))} />
                      <span className="text-xs font-medium">{getCategoryLabel(category)}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {categoryEarned}/{categoryMax}
                    </div>
                    <Progress value={categoryPercent} className="h-1 mt-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria List */}
      {Object.entries(criteriaByCategory).map(([category, categoryCriteria]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded-full', getCategoryColor(category))} />
              <CardTitle className="text-lg">{getCategoryLabel(category)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryCriteria.map((criterion) => {
              const score = scores.get(criterion.id);
              const points = score?.points_earned || 0;

              return (
                <div
                  key={criterion.id}
                  className="p-4 rounded-lg border bg-card/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{criterion.criterion_name}</h4>
                        {criterion.is_mandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Obligatoire
                          </Badge>
                        )}
                      </div>
                      {criterion.criterion_description && (
                        <p className="text-sm text-muted-foreground">
                          {criterion.criterion_description}
                        </p>
                      )}
                      {criterion.hints && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {criterion.hints}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold">{criterion.max_points}</div>
                      <div className="text-xs text-muted-foreground">points max</div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">
                          Points obtenus: {points} / {criterion.max_points}
                        </Label>
                        <Slider
                          value={[points]}
                          onValueChange={([value]) =>
                            updateScore(criterion.id, value, score?.feedback)
                          }
                          max={criterion.max_points}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Commentaires</Label>
                        <Textarea
                          value={score?.feedback || ''}
                          onChange={(e) =>
                            updateScore(criterion.id, points, e.target.value)
                          }
                          placeholder="Ajoutez des commentaires d'évaluation..."
                          className="mt-1 min-h-[60px]"
                        />
                      </div>
                    </div>
                  )}

                  {isReadOnly && score && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Points obtenus:</span>
                        <span className="text-lg font-bold">
                          {points} / {criterion.max_points}
                        </span>
                      </div>
                      {score.feedback && (
                        <div className="p-2 bg-muted rounded text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          {score.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Self Reflection (if not read-only) */}
      {!isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Auto-Réflexion
            </CardTitle>
            <CardDescription>
              Réfléchissez à votre performance et notez ce que vous avez appris
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={selfReflection}
              onChange={(e) => setSelfReflection(e.target.value)}
              placeholder="Qu'avez-vous bien fait? Que pourriez-vous améliorer? Qu'avez-vous appris?"
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EcosEvaluationGrille;
