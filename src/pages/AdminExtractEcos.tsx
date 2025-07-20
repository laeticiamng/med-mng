import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Play, Pause, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminExtractEcos = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeFromSD, setResumeFromSD] = useState(1);

  const startExtraction = async (action: 'start' | 'resume' = 'start') => {
    setIsExtracting(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log(`🚀 Lancement de l'extraction ECOS - Action: ${action}`);
      
      const { data, error } = await supabase.functions.invoke('extract-ecos-uness', {
        body: {
          action,
          resumeFromSD: action === 'resume' ? resumeFromSD : 1,
          credentials: {
            username: 'laeticia.moto-ngane@etud.u-picardie.fr',
            password: 'Aiciteal1!'
          }
        }
      });

      if (error) {
        console.error('❌ Erreur extraction ECOS:', error);
        setError(error.message);
        toast.error('Erreur lors de l\'extraction ECOS');
        return;
      }

      console.log('✅ Extraction ECOS terminée:', data);
      setStats(data.stats);
      setProgress(100);
      toast.success(`Extraction ECOS terminée! ${data.stats?.totalProcessed || 0} situations traitées`);

    } catch (error: any) {
      console.error('💥 Erreur critique ECOS:', error);
      setError(error.message);
      toast.error('Erreur critique lors de l\'extraction ECOS');
    } finally {
      setIsExtracting(false);
    }
  };

  const checkExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('ecos_situations_uness')
        .select('sd_id, intitule_sd, date_import')
        .order('sd_id');

      if (error) throw error;

      console.log(`📊 ${data?.length || 0} situations ECOS déjà en base`);
      toast.info(`${data?.length || 0} situations ECOS trouvées en base`);
      
      return data;
    } catch (error: any) {
      console.error('Erreur vérification données ECOS:', error);
      toast.error('Erreur lors de la vérification des données ECOS');
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
              Extraction automatique ECOS UNESS
            </CardTitle>
            <CardDescription>
              Extraction des situations de départ ECOS depuis la plateforme UNESS vers Supabase
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
                {isExtracting ? 'Extraction en cours...' : 'Démarrer extraction complète ECOS'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => startExtraction('resume')}
                disabled={isExtracting}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reprendre depuis la situation {resumeFromSD}
              </Button>

              <Button 
                variant="secondary"
                onClick={checkExistingData}
                disabled={isExtracting}
              >
                Vérifier données ECOS existantes
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="resumeSD" className="text-sm font-medium">
                Reprendre depuis la situation:
              </label>
              <input
                id="resumeSD"
                type="number"
                min="1"
                max="400"
                value={resumeFromSD}
                onChange={(e) => setResumeFromSD(parseInt(e.target.value) || 1)}
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
              <CardTitle>Progression de l'extraction ECOS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">
                  Extraction des situations ECOS en cours... Cela peut prendre plusieurs minutes.
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
              <CardTitle>Résultats de l'extraction ECOS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalProcessed}
                  </div>
                  <div className="text-sm text-green-700">Situations traitées</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.totalErrors}
                  </div>
                  <div className="text-sm text-red-700">Erreurs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.lastProcessedSituation}
                  </div>
                  <div className="text-sm text-blue-700">Dernière situation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Information:</strong> L'extraction complète des situations ECOS peut prendre 
            entre 15-20 minutes. Le processus inclut l'authentification CAS, 
            la navigation automatique et l'extraction du contenu de chaque situation.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
};

export default AdminExtractEcos;