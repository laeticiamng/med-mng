import { useState } from 'react';
import { useAppliedRecommendations } from '@/hooks/useAppliedRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  BarChart3,
  Trash2,
  Activity,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels = {
  applied: 'Appliquée',
  measuring: 'En cours de mesure',
  completed: 'Terminée',
  reverted: 'Annulée',
};

const statusColors = {
  applied: 'bg-primary/10 text-primary',
  measuring: 'bg-warning/10 text-warning-foreground',
  completed: 'bg-success/10 text-success',
  reverted: 'bg-muted text-muted-foreground',
};

const impactRatingLabels = {
  excellent: 'Excellent',
  good: 'Bon',
  moderate: 'Modéré',
  slight: 'Léger',
  no_improvement: 'Aucune amélioration',
};

const impactRatingColors = {
  excellent: 'bg-success',
  good: 'bg-primary',
  moderate: 'bg-warning',
  slight: 'bg-warning/70',
  no_improvement: 'bg-destructive',
};

export function AppliedRecommendationsTracker() {
  const { appliedRecommendations, loading, measureImpact, updateRecommendation, deleteRecommendation } = useAppliedRecommendations();
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const handleMeasureImpact = async (id: string) => {
    try {
      await measureImpact(id);
    } catch (error) {
      console.error('Error measuring impact:', error);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedRec) return;
    try {
      await updateRecommendation(selectedRec.id, { notes });
      setSelectedRec(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const completedRecommendations = appliedRecommendations.filter(r => r.impact_calculated);
  const pendingRecommendations = appliedRecommendations.filter(r => !r.impact_calculated);
  
  const averageImpact = completedRecommendations.length > 0
    ? completedRecommendations.reduce((sum, r) => sum + (r.impact_score || 0), 0) / completedRecommendations.length
    : 0;

  if (loading && appliedRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{appliedRecommendations.length}</p>
              <p className="text-xs text-muted-foreground">Total appliquées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{completedRecommendations.length}</p>
              <p className="text-xs text-muted-foreground">Impact mesuré</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{pendingRecommendations.length}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{averageImpact.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations en attente de mesure */}
      {pendingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              En attente de mesure d'impact
            </CardTitle>
            <CardDescription>
              Recommandations appliquées attendant la mesure de leur impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRecommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge className={statusColors[rec.status]}>
                          {statusLabels[rec.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Appliquée le {format(new Date(rec.applied_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                      {rec.metrics_before && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs font-semibold mb-2">Métriques avant application:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Taux succès:</span>{' '}
                              <span className="font-semibold">{((rec.metrics_before as any)?.successRate || 0).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>{' '}
                              <span className="font-semibold">{(rec.metrics_before as any)?.total || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Délivrées:</span>{' '}
                              <span className="font-semibold">{(rec.metrics_before as any)?.delivered || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleMeasureImpact(rec.id)}
                        disabled={loading}
                        size="sm"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Mesurer l'impact
                      </Button>
                      <Button
                        onClick={() => deleteRecommendation(rec.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Historique avec impact mesuré */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              Historique des impacts mesurés
            </CardTitle>
          <CardDescription>
            Résultats des recommandations appliquées avec leur impact réel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedRecommendations.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Aucun impact mesuré pour le moment. Appliquez des recommandations et mesurez leur impact après quelques jours.
              </AlertDescription>
            </Alert>
          ) : (
            completedRecommendations.map((rec) => {
              const improvement = (rec.impact_details as any)?.successRateImprovement || 0;
              const rating = (rec.impact_details as any)?.rating || 'no_improvement';
              
              return (
                <Card key={rec.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge className={statusColors[rec.status]}>
                              {statusLabels[rec.status]}
                            </Badge>
                            <Badge className={impactRatingColors[rating]}>
                              {impactRatingLabels[rating]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedRec(rec);
                              setNotes(rec.notes || '');
                            }}>
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Détails de l'impact</DialogTitle>
                              <DialogDescription>
                                Analyse complète de l'impact de la recommandation
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-semibold mb-2">Score d'impact</p>
                                <div className="flex items-center gap-4">
                                  <div className="text-3xl font-bold">{rec.impact_score}/100</div>
                                  <div className={`h-3 flex-1 rounded-full ${impactRatingColors[rating]}`} />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">Avant</p>
                                  <p className="text-lg font-bold">{((rec.impact_details as any)?.successRateBefore || 0).toFixed(1)}%</p>
                                  <p className="text-xs text-muted-foreground">{(rec.impact_details as any)?.totalBefore || 0} notifications</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">Après</p>
                                  <p className="text-lg font-bold">{((rec.impact_details as any)?.successRateAfter || 0).toFixed(1)}%</p>
                                  <p className="text-xs text-muted-foreground">{(rec.impact_details as any)?.totalAfter || 0} notifications</p>
                                </div>
                              </div>

                              <div className="p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm font-semibold mb-1">Amélioration</p>
                                <div className="flex items-center gap-2">
                                  {improvement > 0 ? (
                                    <TrendingUp className="h-5 w-5 text-success" />
                                  ) : (
                                    <TrendingDown className="h-5 w-5 text-destructive" />
                                  )}
                                  <span className="text-xl font-bold">
                                    {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-semibold mb-2">Notes</p>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Ajoutez des notes sur cette recommandation..."
                                  rows={3}
                                />
                                <Button onClick={handleUpdateNotes} className="mt-2" size="sm">
                                  Enregistrer les notes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Résumé visuel de l'impact */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Score d'impact</p>
                          <p className="text-xl font-bold">{rec.impact_score}/100</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Amélioration</p>
                            <div className="flex items-center gap-1">
                              {improvement > 0 ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            <p className="text-xl font-bold">
                              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Évaluation</p>
                          <p className="text-sm font-semibold">{impactRatingLabels[rating]}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
