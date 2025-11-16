/**
 * Composant d'Analyse de Qualité d'un Item EDN
 * Affiche un rapport détaillé de la qualité avec suggestions d'amélioration
 */

import { AlertCircle, CheckCircle, XCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useEdnItemQuality, useEnrichEdnItem } from '@/hooks/useEdnQuality';
import { toast } from '@/hooks/use-toast';

interface EdnQualityAnalysisProps {
  itemCode: string;
}

export default function EdnQualityAnalysis({ itemCode }: EdnQualityAnalysisProps) {
  const { data: quality, isLoading, refetch } = useEdnItemQuality(itemCode);
  const enrichMutation = useEnrichEdnItem();

  const handleEnrich = async () => {
    try {
      const result = await enrichMutation.mutateAsync(itemCode);

      toast({
        title: 'Item enrichi !',
        description: `${result.extracted_keywords_count} mots-clés extraits, complexité: ${result.inferred_complexity}`,
      });

      // Rafraîchir l'analyse
      refetch();
    } catch (error) {
      toast({
        title: 'Erreur lors de l\'enrichissement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <QualityAnalysisSkeleton />;
  }

  if (!quality) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger l'analyse de qualité pour cet item.
        </AlertDescription>
      </Alert>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Très bon':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Bon':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Satisfaisant':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Moyen':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const getGradeStars = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return '⭐⭐⭐⭐⭐';
      case 'Très bon':
        return '⭐⭐⭐⭐';
      case 'Bon':
        return '⭐⭐⭐';
      case 'Satisfaisant':
        return '⭐⭐';
      case 'Moyen':
        return '⭐';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec score global */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Analyse de Qualité
                <Badge className={getGradeColor(quality.quality_grade)}>
                  {quality.quality_grade}
                </Badge>
              </CardTitle>
              <CardDescription>{quality.item_code} - {quality.title}</CardDescription>
            </div>

            <Button
              onClick={handleEnrich}
              disabled={enrichMutation.isPending}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${enrichMutation.isPending ? 'animate-spin' : ''}`}
              />
              Enrichir
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score de complétude */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Score de Complétude</p>
                <p className="text-3xl font-bold">{quality.quality_score}%</p>
              </div>

              <div className="text-right">
                <p className="text-4xl">{getGradeStars(quality.quality_grade)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {quality.is_validated ? '✅ Validé' : '❌ Non validé'}
                </p>
              </div>
            </div>

            <Progress value={quality.quality_score} className="h-3" />
          </div>

          {/* Compteurs de compétences */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Rang A</p>
              <p className="text-2xl font-bold">{quality.competences_count.rang_a}</p>
            </div>

            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Rang B</p>
              <p className="text-2xl font-bold">{quality.competences_count.rang_b}</p>
            </div>

            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{quality.competences_count.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails par composant */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Composants</CardTitle>
          <CardDescription>
            Score obtenu pour chaque élément de l'item EDN
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {quality.quality_details.map((detail) => (
            <ComponentRow key={detail.component} detail={detail} />
          ))}
        </CardContent>
      </Card>

      {/* Éléments manquants */}
      {quality.missing_elements.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Éléments Manquants ({quality.missing_elements.length})</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {quality.missing_elements.map((element, index) => (
                <li key={index}>{element}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions d'amélioration */}
      {quality.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Suggestions d'Amélioration
            </CardTitle>
            <CardDescription>
              Actions recommandées pour compléter cet item
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {quality.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm flex-1">{suggestion}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Analysé le</span>
            <span className="font-medium">
              {new Date(quality.analyzed_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Code Item</span>
            <Badge variant="outline">{quality.item_code}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pourcentage de complétude</span>
            <span className="font-medium">{quality.completeness_percentage}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Sous-composants
// ============================================

function ComponentRow({ detail }: { detail: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getComponentLabel = (component: string) => {
    const labels: Record<string, string> = {
      tableau_rang_a: 'Tableau Rang A',
      tableau_rang_b: 'Tableau Rang B',
      competences_oic_rang_a: 'Compétences OIC Rang A',
      competences_oic_rang_b: 'Compétences OIC Rang B',
      quiz_questions: 'Quiz Interactif',
      scene_immersive: 'Scène Immersive',
      paroles_musicales: 'Paroles Musicales',
    };

    return labels[component] || component;
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        {getStatusIcon(detail.status)}

        <div className="flex-1">
          <p className="font-medium">{getComponentLabel(detail.component)}</p>
          {detail.count !== undefined && (
            <p className="text-sm text-muted-foreground">
              {detail.count} élément{detail.count > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className={`text-lg font-bold ${getStatusColor(detail.status)}`}>
          {detail.score} pts
        </p>
      </div>
    </div>
  );
}

function QualityAnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48" />
      <Skeleton className="h-64" />
      <Skeleton className="h-32" />
      <Skeleton className="h-48" />
    </div>
  );
}
