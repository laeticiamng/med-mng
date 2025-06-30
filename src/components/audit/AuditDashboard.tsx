
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuditItems } from '@/hooks/useAuditItems';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Loader2,
  PlayCircle,
  BarChart3
} from 'lucide-react';

export const AuditDashboard = () => {
  const { report, loading, error, runAudit, exportReport } = useAuditItems();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const validationRate = report ? Math.round((report.validItems / report.totalItems) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audit & Conformité EDN Items
        </h1>
        <p className="text-gray-600">
          Vérification de la conformité des items EDN au schéma v2 et contrôles de qualité
        </p>
      </div>

      {/* Actions principales */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={runAudit} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {loading ? 'Audit en cours...' : 'Lancer l\'audit'}
        </Button>

        {report && (
          <>
            <Button 
              variant="outline"
              onClick={() => exportReport('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button 
              variant="outline"
              onClick={() => exportReport('markdown')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Markdown
            </Button>
          </>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Erreur d'audit</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'audit */}
      {report && (
        <div className="space-y-8">
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold">{report.totalItems}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valides</p>
                    <p className="text-2xl font-bold text-green-600">{report.validItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invalides</p>
                    <p className="text-2xl font-bold text-yellow-600">{report.invalidItems}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Erreurs</p>
                    <p className="text-2xl font-bold text-red-600">{report.errorItems}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Taux de validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Taux de Conformité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Validation Globale</span>
                  <span className="text-sm text-gray-600">{validationRate}%</span>
                </div>
                <Progress value={validationRate} className="h-2" />
                <p className="text-xs text-gray-500">
                  {report.validItems} items sur {report.totalItems} respectent le schéma v2
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Détail des items */}
          <Card>
            <CardHeader>
              <CardTitle>Détail par Item</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Tous ({report.totalItems})</TabsTrigger>
                  <TabsTrigger value="valid">Valides ({report.validItems})</TabsTrigger>
                  <TabsTrigger value="invalid">Invalides ({report.invalidItems})</TabsTrigger>
                  <TabsTrigger value="error">Erreurs ({report.errorItems})</TabsTrigger>
                </TabsList>

                {['all', 'valid', 'invalid', 'error'].map(filter => (
                  <TabsContent key={filter} value={filter} className="mt-6">
                    <div className="space-y-4">
                      {report.results
                        .filter(item => filter === 'all' || item.status === filter)
                        .map(item => (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusIcon(item.status)}
                                  <span className="font-medium text-lg">{item.item_code}</span>
                                  <Badge className={getStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                  <Badge variant="outline">
                                    {item.isV2Format ? 'v2' : 'v1'}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3">
                                  Slug: {item.slug}
                                </p>

                                {/* Complétude */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                  <div className="flex items-center gap-2">
                                    {item.completeness.rangA ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">Rang A</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.completeness.rangB ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">Rang B</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.completeness.parolesMusicales ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    )}
                                    <span className="text-sm">Paroles</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.completeness.generationConfig ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    )}
                                    <span className="text-sm">Config</span>
                                  </div>
                                </div>

                                {/* Erreurs */}
                                {item.errors.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-red-800 mb-1">Erreurs:</p>
                                    <ul className="text-sm text-red-700 space-y-1">
                                      {item.errors.map((error, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-red-500">•</span>
                                          <span>{error}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Avertissements */}
                                {item.warnings.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-yellow-800 mb-1">Avertissements:</p>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                      {item.warnings.map((warning, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-yellow-500">•</span>
                                          <span>{warning}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!report && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Comment utiliser l'audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Lancer l'audit</h3>
                  <p className="text-sm text-gray-600">
                    Cliquez sur "Lancer l'audit" pour analyser tous les items EDN en base
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Analyser les résultats</h3>
                  <p className="text-sm text-gray-600">
                    Consultez le tableau de bord pour identifier les items non conformes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Exporter le rapport</h3>
                  <p className="text-sm text-gray-600">
                    Téléchargez le rapport au format JSON ou Markdown pour documentation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
