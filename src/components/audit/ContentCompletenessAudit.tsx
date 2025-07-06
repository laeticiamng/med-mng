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

            {/* Onglets détaillés */}
            <Tabs defaultValue="critical" className="w-full">
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
                    Ces compétences ont moins de {20}% de complétude et nécessitent une attention immédiate.
                  </p>
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

            {/* Actions */}
            <div className="flex justify-center pt-4">
              <Button onClick={runAnalysis} variant="outline" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Relancer l'analyse
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};