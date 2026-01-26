import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Database, RefreshCw, Zap } from 'lucide-react';
import { useState } from 'react';

export const OICRegenerationPanel = ({ onComplete }: { onComplete?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setProgress(10);
      setResult(null);

      toast({
        title: "🚀 Régénération des compétences OIC",
        description: "Chargement des vraies compétences depuis backup_oic_competences...",
      });

      setProgress(30);

      // Appeler la fonction Edge avec authentification
      const { data, error } = await supabase.functions.invoke('regenerate-all-oic-content', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setProgress(70);

      console.log('✅ Régénération OIC terminée:', data);

      const { error: transformError } = await supabase.functions.invoke('transform-edn-sections', {
        body: {}
      });

      if (transformError) {
        throw transformError;
      }

      setProgress(100);

      setResult({
        success: true,
        itemsUpdated: data?.updated || 0,
        itemsProcessed: data?.total_processed || 0,
        errors: data?.errors || []
      });

      toast({
        title: "✅ Régénération terminée !",
        description: `${data?.updated || 0} items mis à jour avec compétences OIC réelles`,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('❌ Erreur régénération:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      toast({
        title: "❌ Erreur",
        description: "La régénération a échoué",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Régénération Compétences OIC
            </CardTitle>
            <CardDescription>
              Remplacer le contenu générique par les vraies compétences OIC depuis backup_oic_competences
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Action Critique
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Cette action va :</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Récupérer les 4,872 compétences OIC authentiques (Rang A + B)</li>
                <li>Regénérer les tableaux pour tous les 367 items</li>
                <li>Filtrer les compétences de qualité (intitulé ≥15 chars, description ≥20 chars)</li>
                <li>Transformer automatiquement en sections structurées</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Régénération en cours... {progress}%
            </p>
          </div>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {result.success ? (
                <div className="space-y-1">
                  <p className="font-medium">✅ Régénération réussie !</p>
                  <p className="text-sm">
                    {result.itemsUpdated}/{result.itemsProcessed} items mis à jour
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {result.errors.length} erreurs détectées
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">❌ Échec de la régénération</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleRegenerate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Régénération en cours...' : 'Régénérer avec compétences OIC réelles'}
        </Button>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="p-2 bg-muted rounded">
            <div className="font-bold text-lg">4,872</div>
            <div className="text-muted-foreground">Compétences OIC</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="font-bold text-lg">367</div>
            <div className="text-muted-foreground">Items EDN</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="font-bold text-lg">100%</div>
            <div className="text-muted-foreground">Objectif</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
