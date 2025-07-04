import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Play, Database, Code, Palette, Zap, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminCompleteProcess = () => {
  const [currentPhase, setCurrentPhase] = useState<string>('idle');
  const [progress, setProgress] = useState(0);
  const [extractionStats, setExtractionStats] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const phases = [
    { id: 'extraction', name: 'Extraction EDN (367 items)', icon: Download, duration: 15 },
    { id: 'audit-db', name: 'Audit base de données', icon: Database, duration: 2 },
    { id: 'audit-code', name: 'Audit structure code', icon: Code, duration: 3 },
    { id: 'audit-ui', name: 'Audit cohérence UI', icon: Palette, duration: 2 },
    { id: 'audit-perf', name: 'Audit performances', icon: Zap, duration: 3 }
  ];

  const runCompleteProcess = async () => {
    setIsRunning(true);
    setError(null);
    setProgress(0);
    setAuditResults([]);
    
    try {
      // Phase 1: Extraction EDN
      setCurrentPhase('extraction');
      console.log('🚀 Début extraction des 367 items EDN...');
      
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-edn-uness', {
        body: {
          action: 'start',
          credentials: {
            username: 'laeticia.moto-ngane@etud.u-picardie.fr',
            password: 'Aiciteal1!'
          }
        }
      });

      if (extractionError) throw extractionError;
      
      setExtractionStats(extractionData.stats);
      setProgress(20);
      toast.success(`Extraction terminée! ${extractionData.stats?.totalProcessed || 0} items traités`);

      // Phase 2: Audits
      const auditTypes = ['database', 'code', 'ui_consistency', 'performance'];
      const auditNames = ['audit-db', 'audit-code', 'audit-ui', 'audit-perf'];
      
      for (let i = 0; i < auditTypes.length; i++) {
        const auditType = auditTypes[i];
        const phaseName = auditNames[i];
        
        setCurrentPhase(phaseName);
        console.log(`🔍 Audit ${auditType}...`);
        
        const { data: auditData, error: auditError } = await supabase.functions.invoke('audit-system', {
          body: {
            auditType: auditType,
            autoFix: true
          }
        });

        if (auditError) {
          console.error(`Erreur audit ${auditType}:`, auditError);
          setAuditResults(prev => [...prev, {
            type: auditType,
            success: false,
            error: auditError.message
          }]);
        } else {
          setAuditResults(prev => [...prev, {
            type: auditType,
            success: true,
            reportId: auditData.reportId,
            results: auditData.results
          }]);
        }
        
        setProgress(20 + ((i + 1) * 20));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCurrentPhase('completed');
      setProgress(100);
      toast.success('Processus complet terminé avec succès!');
      
    } catch (error: any) {
      console.error('Erreur processus complet:', error);
      setError(error.message);
      toast.error('Erreur lors du processus complet');
    } finally {
      setIsRunning(false);
    }
  };

  const getCurrentPhaseInfo = () => {
    return phases.find(p => p.id === currentPhase) || phases[0];
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Processus complet : Extraction + Audit
            </CardTitle>
            <CardDescription>
              Extraction automatique des 367 items EDN + Audit complet de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runCompleteProcess}
              disabled={isRunning}
              size="lg"
              className="w-full md:w-auto"
            >
              {isRunning ? 'Processus en cours...' : 'Démarrer le processus complet'}
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        {isRunning && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(getCurrentPhaseInfo().icon, { className: "h-5 w-5" })}
                Phase actuelle: {getCurrentPhaseInfo().name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {phases.map((phase, index) => (
                    <div 
                      key={phase.id}
                      className={`p-3 rounded-lg text-center text-sm ${
                        currentPhase === phase.id 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : progress > (index * 20) 
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {React.createElement(phase.icon, { 
                          className: `h-4 w-4 ${
                            currentPhase === phase.id ? 'text-blue-600' : 
                            progress > (index * 20) ? 'text-green-600' : 'text-gray-400'
                          }` 
                        })}
                      </div>
                      <div className={`font-medium ${
                        currentPhase === phase.id ? 'text-blue-900' : 
                        progress > (index * 20) ? 'text-green-900' : 'text-gray-600'
                      }`}>
                        {phase.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extraction Stats */}
        {extractionStats && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de l'extraction EDN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {extractionStats.totalProcessed}
                  </div>
                  <div className="text-sm text-green-700">Items extraits</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {extractionStats.totalErrors}
                  </div>
                  <div className="text-sm text-red-700">Erreurs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    367
                  </div>
                  <div className="text-sm text-blue-700">Items total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Results */}
        {auditResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats des audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditResults.map((audit, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      audit.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-5 w-5 ${audit.success ? 'text-green-600' : 'text-red-600'}`} />
                        <span className="font-medium capitalize">Audit {audit.type}</span>
                      </div>
                      <span className={`text-sm ${audit.success ? 'text-green-700' : 'text-red-700'}`}>
                        {audit.success ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                    {audit.results && (
                      <div className="mt-2 text-sm text-gray-600">
                        Rapport ID: {audit.reportId}
                      </div>
                    )}
                    {audit.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Erreur: {audit.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erreur:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Durée estimée:</strong> Le processus complet prend environ 20-25 minutes 
            (15 min pour l'extraction + 5-10 min pour les audits).
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
};

export default AdminCompleteProcess;