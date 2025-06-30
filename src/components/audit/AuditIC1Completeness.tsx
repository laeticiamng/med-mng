
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  PlayCircle,
  FileText,
  Heart,
  User,
  Activity,
  Stethoscope
} from 'lucide-react';
import { IC1CompletenessAuditor } from '@/scripts/audit/itemIC1Completeness';

interface IC1CompletenessReport {
  isCompliant: boolean;
  missingElements: string[];
  contentAnalysis: {
    rangA: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
    rangB: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
  };
  medicalContentCheck: {
    hasRelationMedecinMalade: boolean;
    hasCorpsHumainDimensions: boolean;
    hasMaladiesImpact: boolean;
    hasPratiquesCliniques: boolean;
  };
  recommendations: string[];
}

export const AuditIC1Completeness = () => {
  const [report, setReport] = useState<IC1CompletenessReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auditReport = await IC1CompletenessAuditor.auditIC1Completeness();
      setReport(auditReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceScore = () => {
    if (!report) return 0;
    
    const checks = [
      report.contentAnalysis.rangA.hasContent,
      report.contentAnalysis.rangB.hasContent,
      report.medicalContentCheck.hasRelationMedecinMalade,
      report.medicalContentCheck.hasCorpsHumainDimensions,
      report.medicalContentCheck.hasMaladiesImpact,
      report.medicalContentCheck.hasPratiquesCliniques
    ];
    
    const passedChecks = checks.filter(Boolean).length;
    return Math.round((passedChecks / checks.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audit IC-1 : Relation médecin-malade
        </h1>
        <p className="text-gray-600">
          Vérification de la complétude et conformité de l'item IC-1
        </p>
      </div>

      <div className="mb-8">
        <Button 
          onClick={runAudit} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {loading ? 'Audit en cours...' : 'Lancer l\'audit IC-1'}
        </Button>
      </div>

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

      {report && (
        <div className="space-y-8">
          {/* Score global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Score de Conformité IC-1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Conformité globale</span>
                <Badge className={report.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {report.isCompliant ? 'CONFORME' : 'NON CONFORME'}
                </Badge>
              </div>
              <Progress value={getComplianceScore()} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">
                {getComplianceScore()}% des critères respectés
              </p>
            </CardContent>
          </Card>

          {/* Analyse du contenu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rang A - Colloque singulier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  {report.contentAnalysis.rangA.hasContent ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {report.contentAnalysis.rangA.competencesCount} compétences
                  </span>
                </div>
                
                {report.contentAnalysis.rangA.missingCompetences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-800 mb-2">Compétences manquantes:</p>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {report.contentAnalysis.rangA.missingCompetences.map((comp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rang B - Outils pratiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  {report.contentAnalysis.rangB.hasContent ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {report.contentAnalysis.rangB.competencesCount} compétences
                  </span>
                </div>
                
                {report.contentAnalysis.rangB.missingCompetences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-800 mb-2">Compétences manquantes:</p>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {report.contentAnalysis.rangB.missingCompetences.map((comp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contenu médical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Contenu Médical Spécialisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {report.medicalContentCheck.hasRelationMedecinMalade ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Relation médecin-malade</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.medicalContentCheck.hasCorpsHumainDimensions ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Dimensions du corps humain</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.medicalContentCheck.hasMaladiesImpact ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Impact des maladies</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.medicalContentCheck.hasPratiquesCliniques ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm">Pratiques cliniques</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recommandations d'amélioration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Éléments manquants */}
          {report.missingElements.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Éléments manquants</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.missingElements.map((element, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span className="text-sm text-orange-700">{element}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
