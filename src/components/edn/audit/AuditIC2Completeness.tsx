import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, RefreshCw, Target, XCircle } from 'lucide-react';
import { checkIC2Completeness } from '@/scripts/audit/ic2CompletenessCheck';
import { AuditIC2CompletionButton } from './AuditIC2CompletionButton';

interface IC2Report {
  exists: boolean;
  itemCode?: string;
  title?: string;
  slug?: string;
  rangA: {
    expected: number;
    found: number;
    concepts: string[];
    missingConcepts: string[];
  };
  rangB: {
    expected: number;
    found: number;
    concepts: string[];
    missingConcepts: string[];
  };
  completeness: number;
  recommendations: string[];
}

export const AuditIC2Completeness = () => {
  const [report, setReport] = useState<IC2Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auditReport = await checkIC2Completeness();
      setReport(auditReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getStatusColor = (completeness: number) => {
    if (completeness === 100) return 'bg-green-100 text-green-800 border-green-300';
    if (completeness >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusIcon = (completeness: number) => {
    if (completeness === 100) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Vérification IC-2 selon E-LiSA</h2>
        </div>
        <Button onClick={runAudit} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Vérifier
        </Button>
      </div>

      {/* Bouton de complétion automatique */}
      {report && report.completeness < 100 && (
        <AuditIC2CompletionButton />
      )}

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification en cours...</p>
        </Card>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* Résumé global */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {report.itemCode} - {report.title}
                </h3>
                <p className="text-sm text-gray-600">Slug: {report.slug}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {report.completeness}%
                </div>
                <Badge className={getStatusColor(report.completeness)}>
                  {report.completeness === 100 ? 'COMPLET' : 'INCOMPLET'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(report.completeness)}
                <span className="text-gray-700">
                  Rang A: {report.rangA.found}/{report.rangA.expected} concepts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(report.completeness)}
                <span className="text-gray-700">
                  Rang B: {report.rangB.found}/{report.rangB.expected} concepts
                </span>
              </div>
            </div>
          </Card>

          {/* Détail Rang A */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              📋 Rang A - Connaissances fondamentales ({report.rangA.found}/{report.rangA.expected})
            </h4>
            
            {/* Concepts présents */}
            {report.rangA.concepts.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-700 mb-2">✅ Concepts présents :</h5>
                <div className="space-y-2">
                  {report.rangA.concepts.map((concept, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concepts manquants */}
            {report.rangA.missingConcepts.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-red-700 mb-2">❌ Concepts manquants :</h5>
                <div className="space-y-2">
                  {report.rangA.missingConcepts.map((concept, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Détail Rang B */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              🎯 Rang B - Connaissances approfondies ({report.rangB.found}/{report.rangB.expected})
            </h4>
            
            {/* Concepts présents */}
            {report.rangB.concepts.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-700 mb-2">✅ Concepts présents :</h5>
                <div className="space-y-2">
                  {report.rangB.concepts.map((concept, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concepts manquants */}
            {report.rangB.missingConcepts.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-red-700 mb-2">❌ Concepts manquants :</h5>
                <div className="space-y-2">
                  {report.rangB.missingConcepts.map((concept, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Recommandations */}
          {report.recommendations.length > 0 && (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h4 className="font-semibold text-yellow-800 mb-3">💡 Recommandations pour atteindre 100%</h4>
              <div className="space-y-1">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-800">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Message de félicitation si complet */}
          {report.completeness === 100 && (
            <Card className="p-6 border-green-200 bg-green-50 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-800 mb-2">
                🎉 Félicitations ! Item IC-2 COMPLET
              </h3>
              <p className="text-green-700">
                L'item IC-2 contient bien les 11 connaissances attendues selon le référentiel E-LiSA officiel.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
