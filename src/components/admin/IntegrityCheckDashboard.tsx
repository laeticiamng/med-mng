import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Play,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntegrityCheck {
  id: string;
  check_type: string;
  batch_id: string;
  status: string;
  tables_checked: string[];
  issues_found: number;
  critical_issues: number;
  should_block: boolean;
  results: any;
  started_at: string;
  completed_at?: string;
}

interface CheckResult {
  table: string;
  total_records: number;
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    description: string;
  }[];
}

export const IntegrityCheckDashboard: React.FC = () => {
  const [checks, setChecks] = useState<IntegrityCheck[]>([]);
  const [currentCheck, setCurrentCheck] = useState<IntegrityCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-integrity-check', {
        body: { action: 'get_status' }
      });

      if (error) throw error;

      if (data.success) {
        setChecks(data.data);
      }
    } catch (error) {
      console.error('Erreur fetch checks:', error);
      toast.error('Erreur lors du chargement des checks');
    } finally {
      setLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    setRunningCheck(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-integrity-check', {
        body: { 
          action: 'run_check',
          check_type: 'manual',
          tables: ['edn_items_complete', 'ecos_situations_complete', 'oic_competences']
        }
      });

      if (error) throw error;

      if (data.success) {
        if (data.should_block) {
          toast.error(`🚨 CHECK BLOQUÉ: ${data.summary.critical_issues} problèmes critiques détectés!`);
        } else {
          toast.success(`✅ Check terminé: ${data.summary.total_issues} problèmes trouvés`);
        }
        
        await fetchChecks();
      }
    } catch (error) {
      console.error('Erreur run check:', error);
      toast.error('Erreur lors du check d\'intégrité');
    } finally {
      setRunningCheck(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  const getStatusIcon = (status: string, shouldBlock?: boolean) => {
    if (status === 'running') return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (status === 'blocked' || shouldBlock) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string, shouldBlock?: boolean) => {
    if (status === 'running') return <Badge className="bg-blue-500">En cours</Badge>;
    if (status === 'blocked' || shouldBlock) return <Badge className="bg-red-500">BLOQUÉ</Badge>;
    if (status === 'completed') return <Badge className="bg-green-500">Terminé</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Contrôle d'Intégrité des Données
          </h2>
          <p className="text-muted-foreground">
            Validation automatique de la cohérence et complétude des données
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runIntegrityCheck} 
            disabled={runningCheck}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {runningCheck ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Lancer Check
          </Button>
          <Button variant="outline" onClick={fetchChecks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Résumé des derniers checks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checks totaux</p>
                <p className="text-2xl font-bold">{checks.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Problèmes critiques</p>
                <p className="text-2xl font-bold text-red-600">
                  {checks.reduce((sum, check) => sum + (check.critical_issues || 0), 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checks bloqués</p>
                <p className="text-2xl font-bold text-orange-600">
                  {checks.filter(check => check.should_block).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
                <p className="text-2xl font-bold text-green-600">
                  {checks.length > 0 ? Math.round((checks.filter(c => !c.should_block).length / checks.length) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des checks */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Chargement des checks...</p>
          </div>
        ) : checks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucun check d'intégrité enregistré</p>
              <Button onClick={runIntegrityCheck} className="mt-4">
                Lancer le premier check
              </Button>
            </CardContent>
          </Card>
        ) : (
          checks.map((check) => (
            <Card key={check.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status, check.should_block)}
                    <div>
                      <CardTitle className="text-lg">
                        Check {check.check_type} - {check.batch_id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(check.started_at).toLocaleString()}
                        {check.completed_at && ` - ${new Date(check.completed_at).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(check.status, check.should_block)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {check.should_block && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>BLOCAGE CRITIQUE:</strong> Ce check a détecté {check.critical_issues} problèmes critiques 
                      qui nécessitent une intervention immédiate avant toute mise en production.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tables vérifiées</p>
                    <p className="text-lg">{check.tables_checked?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Problèmes trouvés</p>
                    <p className="text-lg">{check.issues_found || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Problèmes critiques</p>
                    <p className="text-lg text-red-600">{check.critical_issues || 0}</p>
                  </div>
                </div>

                {check.results?.checks && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Détails par table:</h4>
                    {check.results.checks.map((tableResult: CheckResult, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">{tableResult.table}</h5>
                            <Badge variant="outline">{tableResult.total_records} enregistrements</Badge>
                          </div>
                          
                          {tableResult.issues.length > 0 ? (
                            <div className="space-y-2">
                              {tableResult.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className={`p-2 rounded text-sm ${getSeverityColor(issue.severity)}`}>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{issue.description}</span>
                                    <Badge className={getSeverityColor(issue.severity)}>
                                      {issue.severity} ({issue.count})
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-green-600">✅ Aucun problème détecté</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentCheck(currentCheck?.id === check.id ? null : check)}
                  >
                    {currentCheck?.id === check.id ? 'Masquer détails' : 'Voir détails'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};