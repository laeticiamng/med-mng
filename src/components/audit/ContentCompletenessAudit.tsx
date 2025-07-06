import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, Play, FileText, BarChart3 } from 'lucide-react';
import { useContentCompletenessChecker } from '@/hooks/useContentCompletenessChecker';

export const ContentCompletenessAudit: React.FC = () => {
  const { isAnalyzing, results, error, runAnalysis } = useContentCompletenessChecker();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'incomplete':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'empty':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'incomplete':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'empty':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-900">
          <BarChart3 className="w-6 h-6" />
          Audit de Complétude des Compétences OIC
        </CardTitle>
        <p className="text-blue-700 text-sm">
          Analyse automatique de la qualité et complétude des données OIC
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {!results && !isAnalyzing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prêt à analyser les compétences OIC
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyse en cours...</h3>
            <p className="text-gray-600">
              Examen des compétences OIC et calcul des métriques de complétude
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Erreur lors de l'analyse</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
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
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complétude moyenne</p>
                      <p className="text-2xl font-bold text-blue-600">{results.statistics.averageCompleteness}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <Progress value={results.statistics.averageCompleteness} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critiques</p>
                      <p className="text-2xl font-bold text-red-600">{results.statistics.criticalCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complètes</p>
                      <p className="text-2xl font-bold text-green-600">{results.statistics.completeCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé analytique */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analyse Détaillée</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Critiques (&lt;20%)</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{results.statistics.criticalCount}</p>
                  <p className="text-gray-600">Nécessitent une action immédiate</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Incomplètes (20-70%)</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{results.statistics.incompleteCount}</p>
                  <p className="text-gray-600">Peuvent être améliorées</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Attention (70-90%)</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{results.needsAttention.length}</p>
                  <p className="text-gray-600">Peuvent être optimisées</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Complètes (&gt;90%)</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{results.statistics.completeCount}</p>
                  <p className="text-gray-600">Bien documentées</p>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">🎯 Actions Prioritaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">Immédiat</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Corriger {results.statistics.criticalCount} compétences critiques</li>
                    <li>• Remplir les champs obligatoires vides</li>
                    <li>• Éliminer les contenus génériques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">Court terme</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
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
                  <h4 className="font-semibold text-gray-900 mb-2">Taux de Complétude</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={results.statistics.averageCompleteness} className="flex-1" />
                    <span className="text-lg font-bold text-blue-600">{results.statistics.averageCompleteness}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Moyenne générale</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Qualité des Données</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.round((results.statistics.completeCount / results.total) * 100)} className="flex-1" />
                    <span className="text-lg font-bold text-green-600">
                      {Math.round((results.statistics.completeCount / results.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Compétences de qualité</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Urgence d'Action</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.round((results.statistics.criticalCount / results.total) * 100)} className="flex-1" />
                    <span className="text-lg font-bold text-red-600">
                      {Math.round((results.statistics.criticalCount / results.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Compétences critiques</p>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Compétences Critiques</h4>
                  <p className="text-red-700 text-sm">
                    Ces compétences ont moins de 20% de complétude et nécessitent une attention immédiate.
                  </p>
                  {results.critical.length > 0 && (
                    <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                      <h5 className="font-medium text-red-800 text-xs mb-2">ACTIONS URGENTES REQUISES :</h5>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Identifier les sources de données officielles UNESS</li>
                        <li>• Prioriser l'enrichissement de ces {results.critical.length} compétences</li>
                        <li>• Programmer une extraction complète des contenus manquants</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {results.critical.map((comp) => (
                  <Card key={comp.id} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{comp.titre}</h5>
                          <p className="text-sm text-gray-600">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{comp.completeness}%</Badge>
                          <Progress value={comp.completeness} className="w-24" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {comp.emptyFields.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-700">Champs vides:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {comp.emptyFields.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {comp.recommendations.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Actions prioritaires:</span>
                            <ul className="mt-1 text-sm text-gray-600">
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
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Compétences Incomplètes</h4>
                  <p className="text-orange-700 text-sm">
                    Ces compétences ont entre 20% et 70% de complétude et peuvent être améliorées.
                  </p>
                </div>
                
                {results.incomplete.map((comp) => (
                  <Card key={comp.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{comp.titre}</h5>
                          <p className="text-sm text-gray-600">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {comp.completeness}%
                          </Badge>
                          <Progress value={comp.completeness} className="w-24" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Champs vides: </span>
                          <span className="text-gray-600">{comp.emptyFields.length}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Champs partiels: </span>
                          <span className="text-gray-600">{comp.partialFields.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="attention" className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">👀 Compétences Nécessitant Attention</h4>
                  <p className="text-yellow-700 text-sm">
                    Ces compétences ont entre 70% et 90% de complétude et peuvent être optimisées.
                  </p>
                </div>
                
                {results.needsAttention.map((comp) => (
                  <Card key={comp.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{comp.titre}</h5>
                          <p className="text-sm text-gray-600">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Compétences Complètes</h4>
                  <p className="text-green-700 text-sm">
                    Ces compétences ont plus de 90% de complétude et sont bien documentées.
                  </p>
                </div>
                
                {results.complete.map((comp) => (
                  <Card key={comp.id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{comp.titre}</h5>
                          <p className="text-sm text-gray-600">ID: {comp.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {comp.completeness}%
                          </Badge>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Plan d'action et export */}
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Plan d'Action et Export</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">📊 Rapport Détaillé</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Exportez un rapport complet de l'analyse avec toutes les métriques.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Télécharger PDF
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">📋 Liste Compétences</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Exportez la liste des compétences à corriger au format CSV.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Exporter CSV
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">🔄 Synchronisation</h4>
                  <p className="text-sm text-gray-600 mb-3">
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