import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, CheckCircle, XCircle, RefreshCw, 
  Music, BookOpen, Target, TrendingUp, Filter
} from 'lucide-react';
import { contentQualityAnalyzer } from '@/services/contentQualityAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ContentQualityScore {
  itemCode: string;
  title: string;
  lyricsQuality: number;
  competencesQuality: number;
  overallQuality: number;
  issues: string[];
  recommendations: string[];
}

export const ContentQualityDashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    analyzed: number;
    lowQualityItems: ContentQualityScore[];
    averageQuality: number;
    criticalIssues: string[];
    recommendations: string[];
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentQualityScore | null>(null);
  const { toast } = useToast();

  const runQualityAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = await contentQualityAnalyzer.analyzeAllContent();
      setAnalysisResults(results);
      
      toast({
        title: "Analyse de qualité terminée",
        description: `${results.analyzed} items analysés. Score moyen: ${Math.round(results.averageQuality)}%`
      });
      
      logger.info('ui', 'Analyse de qualité du contenu terminée', {
        component: 'ContentQualityDashboard',
        action: 'runQualityAnalysis',
        metadata: {
          analyzed: results.analyzed,
          averageQuality: results.averageQuality,
          lowQualityCount: results.lowQualityItems.length
        }
      });
      
    } catch (error) {
      logger.error('ui', 'Erreur lors de l\'analyse de qualité', {
        component: 'ContentQualityDashboard',
        action: 'runQualityAnalysis',
        metadata: { error }
      });
      
      toast({
        title: "Erreur d'analyse",
        description: "Impossible de terminer l'analyse de qualité",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-secondary';
    return 'text-destructive';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-primary/10 text-primary">Excellente</Badge>;
    if (score >= 60) return <Badge variant="secondary">Acceptable</Badge>;
    return <Badge variant="destructive">À améliorer</Badge>;
  };

  useEffect(() => {
    // Lancer l'analyse automatiquement au chargement
    runQualityAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Qualité du Contenu</CardTitle>
              <p className="text-muted-foreground">
                Analyse complète de la qualité des items EDN, paroles et compétences
              </p>
            </div>
            <Button 
              onClick={runQualityAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyse...' : 'Relancer l\'analyse'}
            </Button>
          </div>
        </CardHeader>

        {analysisResults && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {analysisResults.analyzed}
                </div>
                <p className="text-sm text-muted-foreground">Items analysés</p>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${getQualityColor(analysisResults.averageQuality)}`}>
                  {Math.round(analysisResults.averageQuality)}%
                </div>
                <p className="text-sm text-muted-foreground">Qualité moyenne</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">
                  {analysisResults.lowQualityItems.length}
                </div>
                <p className="text-sm text-muted-foreground">Items à améliorer</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">
                  {analysisResults.criticalIssues.length}
                </div>
                <p className="text-sm text-muted-foreground">Problèmes critiques</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Qualité globale</span>
                <span className="text-sm">{Math.round(analysisResults.averageQuality)}%</span>
              </div>
              <Progress value={analysisResults.averageQuality} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {analysisResults && (
        <Tabs defaultValue="low-quality" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="low-quality">Items à améliorer ({analysisResults.lowQualityItems.length})</TabsTrigger>
            <TabsTrigger value="issues">Problèmes critiques</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          </TabsList>

          {/* Items de faible qualité */}
          <TabsContent value="low-quality" className="space-y-4">
            {analysisResults.lowQualityItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Excellent travail !</h3>
                  <p className="text-muted-foreground">
                    Tous les items analysés ont une qualité acceptable.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {analysisResults.lowQualityItems.map((item) => (
                  <Card key={item.itemCode} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedItem(item)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.itemCode}</Badge>
                          <h4 className="font-medium truncate">{item.title}</h4>
                        </div>
                        {getQualityBadge(item.overallQuality)}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span>Paroles: {Math.round(item.lyricsQuality)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Compétences: {Math.round(item.competencesQuality)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Global: {Math.round(item.overallQuality)}%</span>
                        </div>
                      </div>

                      {item.issues.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex flex-wrap gap-1">
                            {item.issues.slice(0, 3).map((issue, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                            {item.issues.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.issues.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Problèmes critiques */}
          <TabsContent value="issues" className="space-y-4">
            {analysisResults.criticalIssues.map((issue, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium">{issue}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recommandations */}
          <TabsContent value="recommendations" className="space-y-4">
            {analysisResults.recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span>{recommendation}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de détail d'un item */}
      {selectedItem && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedItem.itemCode} - {selectedItem.title}
                  {getQualityBadge(selectedItem.overallQuality)}
                </CardTitle>
              </div>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Scores détaillés */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(selectedItem.lyricsQuality)}%
                </div>
                <p className="text-sm text-muted-foreground">Qualité des paroles</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(selectedItem.competencesQuality)}%
                </div>
                <p className="text-sm text-muted-foreground">Qualité des compétences</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(selectedItem.overallQuality)}%
                </div>
                <p className="text-sm text-muted-foreground">Score global</p>
              </div>
            </div>

            {/* Problèmes identifiés */}
            {selectedItem.issues.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Problèmes identifiés
                </h4>
                <div className="space-y-2">
                  {selectedItem.issues.map((issue, index) => (
                    <div key={index} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommandations */}
            {selectedItem.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Recommandations d'amélioration
                </h4>
                <div className="space-y-2">
                  {selectedItem.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};