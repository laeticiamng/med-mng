import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContentCompletenessChecker } from '@/hooks/useContentCompletenessChecker';
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle, Clock, FileText, Play } from 'lucide-react';
import React from 'react';

export const ContentCompletenessAudit: React.FC = () => {
  const { isAnalyzing, results, error, runAnalysis } = useContentCompletenessChecker();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'LOW':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-gradient-subtle border-b">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <BarChart3 className="w-6 h-6" />
          Audit de Complétude des Compétences OIC
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Analyse automatique de la qualité et complétude des données OIC
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {!results && !isAnalyzing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Prêt à analyser les compétences OIC
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Lancez l'analyse pour identifier les compétences incomplètes et générer un rapport détaillé
            </p>
            <Button onClick={runAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Lancer l'analyse
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
            <p className="text-muted-foreground">
              Examen des compétences OIC et calcul des métriques de complétude
            </p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Erreur lors de l'analyse</span>
            </div>
            <p className="text-destructive mt-2">{error}</p>
            <Button onClick={runAnalysis} variant="outline" className="mt-3">
              Réessayer
            </Button>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{results.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Complétude moyenne</p>
                      <p className="text-2xl font-bold text-primary">{results.statistics.averageCompleteness}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <Progress value={results.statistics.averageCompleteness} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Critiques</p>
                      <p className="text-2xl font-bold text-destructive">{results.statistics.criticalCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Complètes</p>
                      <p className="text-2xl font-bold text-success">{results.statistics.completeCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé analytique */}
            <div className="bg-gradient-subtle rounded-lg p-6 mb-6 border">
              <h3 className="text-lg font-semibold mb-4">📊 Analyse Détaillée</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span className="font-medium">Critiques (&lt;20%)</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{results.statistics.criticalCount}</p>
                  <p className="text-muted-foreground">Nécessitent une action immédiate</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="font-medium">Incomplètes (20-70%)</span>
                  </div>
                  <p className="text-2xl font-bold text-warning">{results.statistics.incompleteCount}</p>
                  <p className="text-muted-foreground">Peuvent être améliorées</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="font-medium">Attention (70-90%)</span>
                  </div>
                  <p className="text-2xl font-bold text-warning">{results.needsAttention.length}</p>
                  <p className="text-muted-foreground">Peuvent être optimisées</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="font-medium">Complètes (&gt;90%)</span>
                  </div>
                  <p className="text-2xl font-bold text-success">{results.statistics.completeCount}</p>
                  <p className="text-muted-foreground">Bien documentées</p>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-warning mb-4">🎯 Actions Prioritaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Immédiat</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Corriger {results.statistics.criticalCount} compétences critiques</li>
                    <li>• Remplir les champs obligatoires vides</li>
                    <li>• Éliminer les contenus génériques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Court terme</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enrichir {results.statistics.incompleteCount} compétences incomplètes</li>
                    <li>• Synchroniser avec les données UNESS officielles</li>
                    <li>• Standardiser les formats de contenu</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Métriques de qualité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Taux de Complétude</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={results.statistics.averageCompleteness} className="flex-1" />
                    <span className="text-lg font-bold text-primary">{results.statistics.averageCompleteness}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Moyenne générale</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Qualité des Données</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.round((results.statistics.completeCount / results.total) * 100)} className="flex-1" />
                    <span className="text-lg font-bold text-success">
                      {Math.round((results.statistics.completeCount / results.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Compétences de qualité</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Urgence d'Action</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.round((results.statistics.criticalCount / results.total) * 100)} className="flex-1" />
                    <span className="text-lg font-bold text-destructive">
                      {Math.round((results.statistics.criticalCount / results.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Compétences critiques</p>
                </CardContent>
              </Card>
            </div>

            {/* Onglets détaillés */}
            <Tabs defaultValue={results.statistics.criticalCount > 0 ? "critical" : "incomplete"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="critical" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critiques ({results.critical.length})
                </TabsTrigger>
                <TabsTrigger value="incomplete" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Incomplètes ({results.incomplete.length})
                </TabsTrigger>
                <TabsTrigger value="attention" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Attention ({results.needsAttention.length})
                </TabsTrigger>
                <TabsTrigger value="complete" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Complètes ({results.complete.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="critical" className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-destructive mb-2">🚨 Compétences Critiques</h4>
                  <p className="text-muted-foreground text-sm">
                    Ces compétences ont moins de 20% de complétude et nécessitent une attention immédiate.
                  </p>
                  {results.critical.length > 0 && (
                    <div className="mt-3 p-3 bg-destructive/20 rounded border border-destructive/30">
                      <h5 className="font-medium text-xs mb-2">ACTIONS URGENTES REQUISES :</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Identifier les sources de données officielles UNESS</li>
                        <li>• Prioriser l'enrichissement de ces {results.critical.length} compétences</li>
                        <li>• Programmer une extraction complète des contenus manquants</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {results.critical.map((comp) => (
                  <Card key={comp.id} className="border-destructive/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold">{comp.titre}</h5>
                          <p className="text-sm text-muted-foreground">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{comp.completeness}%</Badge>
                          <Progress value={comp.completeness} className="w-24" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {comp.emptyFields.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-destructive">Champs vides:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {comp.emptyFields.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {comp.recommendations.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Actions prioritaires:</span>
                            <ul className="mt-1 text-sm text-muted-foreground">
                              {comp.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                    {rec.priority}
                                  </Badge>
                                  <span>{rec.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="incomplete" className="space-y-4">
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-warning mb-2">⚠️ Compétences Incomplètes</h4>
                  <p className="text-muted-foreground text-sm">
                    Ces compétences ont entre 20% et 70% de complétude et peuvent être améliorées.
                  </p>
                </div>
                
                {results.incomplete.map((comp) => (
                  <Card key={comp.id} className="border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold">{comp.titre}</h5>
                          <p className="text-sm text-muted-foreground">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-warning/10 text-warning">
                            {comp.completeness}%
                          </Badge>
                          <Progress value={comp.completeness} className="w-24" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Champs vides: </span>
                          <span className="text-muted-foreground">{comp.emptyFields.length}</span>
                        </div>
                        <div>
                          <span className="font-medium">Champs partiels: </span>
                          <span className="text-muted-foreground">{comp.partialFields.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="attention" className="space-y-4">
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-warning mb-2">👀 Compétences Nécessitant Attention</h4>
                  <p className="text-muted-foreground text-sm">
                    Ces compétences ont entre 70% et 90% de complétude et peuvent être optimisées.
                  </p>
                </div>
                
                {results.needsAttention.map((comp) => (
                  <Card key={comp.id} className="border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold">{comp.titre}</h5>
                          <p className="text-sm text-muted-foreground">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-warning/10 text-warning">
                            {comp.completeness}%
                          </Badge>
                          <Progress value={comp.completeness} className="w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="complete" className="space-y-4">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-success mb-2">✅ Compétences Complètes</h4>
                  <p className="text-muted-foreground text-sm">
                    Ces compétences ont plus de 90% de complétude et sont bien documentées.
                  </p>
                </div>
                
                {results.complete.map((comp) => (
                  <Card key={comp.id} className="border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold">{comp.titre}</h5>
                          <p className="text-sm text-muted-foreground">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            {comp.completeness}%
                          </Badge>
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Plan d'action et export */}
            <div className="bg-muted rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">📋 Plan d'Action et Export</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded border">
                  <h4 className="font-medium mb-2">📊 Rapport Détaillé</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Exportez un rapport complet de l'analyse avec toutes les métriques.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Télécharger PDF
                  </Button>
                </div>
                
                <div className="bg-card p-4 rounded border">
                  <h4 className="font-medium mb-2">📋 Liste Compétences</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Exportez la liste des compétences à corriger au format CSV.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Exporter CSV
                  </Button>
                </div>
                
                <div className="bg-card p-4 rounded border">
                  <h4 className="font-medium mb-2">🔄 Synchronisation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Lancez une synchronisation avec les données UNESS officielles.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Sync UNESS
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions principales */}
            <div className="flex justify-center gap-4 pt-6">
              <Button onClick={runAnalysis} variant="outline" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Relancer l'analyse
              </Button>
              <Button className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Appliquer les corrections
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};