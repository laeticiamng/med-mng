import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Play, Pause, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminExtractEdn = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeFromItem, setResumeFromItem] = useState(1);

  const startExtraction = async (action: 'start' | 'resume' = 'start') => {
    setIsExtracting(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log(`🚀 Lancement de l'extraction EDN - Action: ${action}`);
      
      // ✅ SÉCURISÉ: Les credentials sont gérés côté serveur dans l'edge function
      // Aucun credential n'est envoyé depuis le frontend
      const { data, error } = await supabase.functions.invoke('secure-edn-extraction', {
        body: {
          action,
          resumeFromItem: action === 'resume' ? resumeFromItem : 1,
        }
      });

      if (error) {
        console.error('❌ Erreur extraction:', error);
        setError(error.message);
        toast.error('Erreur lors de l\'extraction');
        return;
      }

      console.log('✅ Extraction terminée:', data);
      setStats(data.stats);
      setProgress(100);
      toast.success(`Extraction terminée! ${data.stats?.totalProcessed || 0} items traités`);

    } catch (error: any) {
      console.error('💥 Erreur critique:', error);
      setError(error.message);
      toast.error('Erreur critique lors de l\'extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const checkExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, updated_at')
        .order('item_code');

      if (error) throw error;

      console.log(`📊 ${data?.length || 0} items EDN déjà en base`);
      toast.info(`${data?.length || 0} items EDN trouvés en base`);
      
      return data;
    } catch (error: any) {
      console.error('Erreur vérification données:', error);
      toast.error('Erreur lors de la vérification des données');
    }
  };

  return (
    <>
      <Helmet>
        <title>Extraction EDN UNESS - Admin - Med-Mng</title>
        <meta name="description" content="Extraction automatique des items EDN depuis la plateforme UNESS" />
      </Helmet>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">

          {/* Header */}
          <Card role="region" aria-labelledby="edn-extraction-title">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" id="edn-extraction-title">
                <Download className="h-6 w-6" aria-hidden="true" />
                Extraction automatique EDN UNESS
              </CardTitle>
              <CardDescription id="edn-extraction-description">
                Extraction des 367 items EDN depuis la plateforme UNESS vers Supabase
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Actions */}
          <Card role="region" aria-labelledby="actions-title">
            <CardHeader>
              <CardTitle id="actions-title">Actions disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex flex-wrap gap-3" role="group" aria-label="Actions d'extraction">
                <Button
                  onClick={() => startExtraction('start')}
                  disabled={isExtracting}
                  className="flex items-center gap-2"
                  aria-label="Démarrer l'extraction complète des 367 items EDN"
                  aria-busy={isExtracting}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {isExtracting ? 'Extraction en cours...' : 'Démarrer extraction complète'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => startExtraction('resume')}
                  disabled={isExtracting}
                  className="flex items-center gap-2"
                  aria-label={`Reprendre l'extraction depuis l'item ${resumeFromItem}`}
                  aria-busy={isExtracting}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Reprendre depuis l'item {resumeFromItem}
                </Button>

                <Button
                  variant="secondary"
                  onClick={checkExistingData}
                  disabled={isExtracting}
                  aria-label="Vérifier les données EDN existantes dans la base"
                >
                  Vérifier données existantes
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="resumeItem" className="text-sm font-medium">
                  Reprendre depuis l'item:
                </label>
                <input
                  id="resumeItem"
                  type="number"
                  min="1"
                  max="367"
                  value={resumeFromItem}
                  onChange={(e) => setResumeFromItem(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border rounded text-sm"
                  disabled={isExtracting}
                  aria-label="Numéro de l'item de départ pour la reprise"
                  aria-valuemin={1}
                  aria-valuemax={367}
                  aria-valuenow={resumeFromItem}
                />
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {isExtracting && (
            <Card role="status" aria-live="polite" aria-atomic="true">
              <CardHeader>
                <CardTitle id="progress-title">Progression de l'extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress
                    value={progress}
                    className="w-full"
                    aria-labelledby="progress-title"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                  <p className="text-sm text-gray-600" role="status">
                    Extraction en cours... Cela peut prendre plusieurs minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                <strong>Erreur:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          {stats && (
            <Card role="region" aria-labelledby="stats-title" aria-live="polite">
              <CardHeader>
                <CardTitle id="stats-title">Résultats de l'extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="list">
                  <div className="text-center p-4 bg-green-50 rounded-lg" role="listitem">
                    <div
                      className="text-2xl font-bold text-green-600"
                      aria-label={`${stats.totalProcessed} items traités avec succès`}
                    >
                      {stats.totalProcessed}
                    </div>
                    <div className="text-sm text-green-700">Items traités</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg" role="listitem">
                    <div
                      className="text-2xl font-bold text-red-600"
                      aria-label={`${stats.totalErrors} erreurs rencontrées`}
                    >
                      {stats.totalErrors}
                    </div>
                    <div className="text-sm text-red-700">Erreurs</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg" role="listitem">
                    <div
                      className="text-2xl font-bold text-blue-600"
                      aria-label={`Dernier item traité: numéro ${stats.lastProcessedItem}`}
                    >
                      {stats.lastProcessedItem}
                    </div>
                    <div className="text-sm text-blue-700">Dernier item</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Alert role="note">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Information:</strong> L'extraction complète des 367 items peut prendre
              entre 10-15 minutes. Le processus inclut l'authentification CAS,
              la navigation automatique et l'extraction du contenu de chaque item.
            </AlertDescription>
          </Alert>

        </div>
      </div>
    </>
  );
};

export default AdminExtractEdn;