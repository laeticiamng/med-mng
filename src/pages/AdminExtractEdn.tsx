import React, { useState } from 'react';
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
      
      const { data, error } = await supabase.functions.invoke('extract-edn-uness', {
        body: {
          action,
          resumeFromItem: action === 'resume' ? resumeFromItem : 1,
          credentials: {
            username: 'laeticia.moto-ngane@etud.u-picardie.fr',
            password: 'Aiciteal1!'
          }
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-6 w-6" />
              Extraction automatique EDN UNESS
            </CardTitle>
            <CardDescription>
              Extraction des 367 items EDN depuis la plateforme UNESS vers Supabase
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => startExtraction('start')}
                disabled={isExtracting}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isExtracting ? 'Extraction en cours...' : 'Démarrer extraction complète'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => startExtraction('resume')}
                disabled={isExtracting}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reprendre depuis l'item {resumeFromItem}
              </Button>

              <Button 
                variant="secondary"
                onClick={checkExistingData}
                disabled={isExtracting}
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isExtracting && (
          <Card>
            <CardHeader>
              <CardTitle>Progression de l'extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">
                  Extraction en cours... Cela peut prendre plusieurs minutes.
                </p>
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

        {/* Stats */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de l'extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalProcessed}
                  </div>
                  <div className="text-sm text-green-700">Items traités</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.totalErrors}
                  </div>
                  <div className="text-sm text-red-700">Erreurs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.lastProcessedItem}
                  </div>
                  <div className="text-sm text-blue-700">Dernier item</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Information:</strong> L'extraction complète des 367 items peut prendre 
            entre 10-15 minutes. Le processus inclut l'authentification CAS, 
            la navigation automatique et l'extraction du contenu de chaque item.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
};

export default AdminExtractEdn;