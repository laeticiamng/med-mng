import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Play, Database, Code, Palette, Zap, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SecureCredentialsForm, useSecureCredentials } from '@/components/common/SecureCredentialsForm';

const AdminCompleteProcess = () => {
  const [currentPhase, setCurrentPhase] = useState<string>('idle');
  const [progress, setProgress] = useState(0);
  const [extractionStats, setExtractionStats] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReimporting, setIsReimporting] = useState(false);
  const [reimportResults, setReimportResults] = useState<any>(null);
  const { getCredentials, showCredentialsForm, handleCredentialsSubmit } = useSecureCredentials();
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

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
      // Phase 1: Extraction EDN - SÉCURISÉE
      setCurrentPhase('extraction');
      console.log('🚀 Début extraction des 367 items EDN...');
      
      // ✅ SÉCURISÉ: Récupération des credentials via composant sécurisé
      const credentials = await getCredentials();
      
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-edn-uness', {
        body: {
          action: 'start',
          credentials // Credentials sécurisés (pas de hardcodé)
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

  const runReimportProcess = async () => {
    setIsReimporting(true);
    setReimportResults(null);
    setError(null);

    try {
      console.log('🔄 Début de la ré-importation complète EDN...');
      toast.info('Ré-importation en cours...', {
        description: 'Mise à jour de tous les contenus avec données spécifiques'
      });

      const { data, error: reimportError } = await supabase.functions.invoke('reimport-edn-complete', {
        body: { action: 'reimport_all' }
      });

      if (reimportError) throw reimportError;

      setReimportResults(data);
      toast.success('Ré-importation terminée!', {
        description: `${data.stats?.success || 0} items mis à jour avec contenu spécifique`
      });

    } catch (error: any) {
      console.error('Erreur ré-importation:', error);
      setError(error.message);
      toast.error('Erreur lors de la ré-importation');
    } finally {
      setIsReimporting(false);
    }
  };

  const getCurrentPhaseInfo = () => {
    return phases.find(p => p.id === currentPhase) || phases[0];
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        
        {/* Header - Processus d'extraction et audit */}
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
              disabled={isRunning || isReimporting}
              size="lg"
              className="w-full md:w-auto"
            >
              {isRunning ? 'Processus en cours...' : 'Démarrer le processus complet'}
            </Button>
          </CardContent>
        </Card>

        {/* Header - Ré-importation avec contenu spécifique */}
        <Card className="border-2 border-success/30 bg-gradient-to-r from-success/5 to-success/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <RefreshCw className="h-6 w-6" />
              Ré-importation Complète avec Contenu Spécifique
            </CardTitle>
            <CardDescription>
              Remplace le contenu générique par des données spécifiques et uniques pour chaque item EDN (recommandé)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-lg">
                <h4 className="font-semibold text-success mb-2">✅ Améliorations incluses :</h4>
                <ul className="text-sm text-success/80 space-y-1">
                  <li>• Compétences Rang A/B spécifiques par domaine</li>
                  <li>• Paroles musicales personnalisées</li>
                  <li>• Scènes immersives contextualisées</li>
                  <li>• Quiz adaptés au contenu</li>
                </ul>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-semibold text-warning mb-2">⚡ Contenu par spécialité :</h4>
                <ul className="text-xs text-warning/80 space-y-1">
                  <li>• IC-1 à IC-10 : Fondamentaux médicaux</li>
                  <li>• IC-23 à IC-42 : Gynéco-obstétrique</li>
                  <li>• IC-60 à IC-80 : Psychiatrie</li>
                  <li>• IC-290 à IC-320 : Cancérologie</li>
                  <li>• IC-331 à IC-367 : Médecine d'urgence</li>
                </ul>
              </div>
            </div>
            
            <Button 
              onClick={runReimportProcess}
              disabled={isRunning || isReimporting}
              size="lg"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              {isReimporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Ré-importation en cours...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Lancer la Ré-importation Intelligente
                </>
              )}
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
                          ? 'bg-primary/10 border-2 border-primary' 
                          : progress > (index * 20) 
                            ? 'bg-success/10 border border-success/30'
                            : 'bg-muted border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {React.createElement(phase.icon, { 
                          className: `h-4 w-4 ${
                            currentPhase === phase.id ? 'text-primary' : 
                            progress > (index * 20) ? 'text-success' : 'text-muted-foreground'
                          }` 
                        })}
                      </div>
                      <div className={`font-medium ${
                        currentPhase === phase.id ? 'text-primary' : 
                        progress > (index * 20) ? 'text-success' : 'text-muted-foreground'
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
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {extractionStats.totalProcessed}
                  </div>
                  <div className="text-sm text-success/80">Items extraits</div>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {extractionStats.totalErrors}
                  </div>
                  <div className="text-sm text-destructive/80">Erreurs</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    367
                  </div>
                  <div className="text-sm text-primary/80">Items total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reimport Results */}
        {reimportResults && (
          <Card className="border-success/30">
            <CardHeader>
              <CardTitle className="text-success">Résultats de la Ré-importation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {reimportResults.stats?.processed || 0}
                    </div>
                    <div className="text-sm text-primary/80">Items traités</div>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {reimportResults.stats?.success || 0}
                    </div>
                    <div className="text-sm text-success/80">Mis à jour</div>
                  </div>
                  <div className="text-center p-4 bg-destructive/10 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">
                      {reimportResults.stats?.errors || 0}
                    </div>
                    <div className="text-sm text-destructive/80">Erreurs</div>
                  </div>
                </div>
                
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-2">🎉 Contenu mis à jour avec succès :</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-success/80">
                    <div>✅ Compétences Rang A spécifiques</div>
                    <div>✅ Compétences Rang B approfondies</div>
                    <div>✅ Paroles musicales personnalisées</div>
                    <div>✅ Scènes immersives contextualisées</div>
                    <div>✅ Quiz interactifs adaptés</div>
                    <div>✅ Contenus uniques par spécialité</div>
                  </div>
                </div>

                {reimportResults.errors && reimportResults.errors.length > 0 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2">Erreurs rencontrées :</h4>
                    <div className="text-sm text-destructive/80 max-h-32 overflow-y-auto">
                      {reimportResults.errors.map((error: any, index: number) => (
                        <div key={index} className="mb-1">
                          • Item {error.item_code}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      audit.success ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-5 w-5 ${audit.success ? 'text-success' : 'text-destructive'}`} />
                        <span className="font-medium capitalize">Audit {audit.type}</span>
                      </div>
                      <span className={`text-sm ${audit.success ? 'text-success' : 'text-destructive'}`}>
                        {audit.success ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                    {audit.results && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Rapport ID: {audit.reportId}
                      </div>
                    )}
                    {audit.error && (
                      <div className="mt-2 text-sm text-destructive">
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

      {/* Formulaire de credentials sécurisé */}
      {(showCredentialsModal || showCredentialsForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div onClick={(e) => e.stopPropagation()}>
            <SecureCredentialsForm
              onSubmit={(creds) => {
                handleCredentialsSubmit(creds);
                setShowCredentialsModal(false);
              }}
              title="Authentification pour extraction complète"
              description="Saisissez vos identifiants CAS pour lancer l'extraction sécurisée des données EDN"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompleteProcess;