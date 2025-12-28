import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle, AlertTriangle, Database, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SyncTablesPanel = ({ onComplete }: { onComplete?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [lyricsResult, setLyricsResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      setLoading(true);
      setProgress(10);
      setResult(null);

      toast({
        title: "🔄 Synchronisation des tables",
        description: "Copie des données OIC vers edn_items_complete...",
      });

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('sync-edn-tables', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setProgress(100);

      setResult({
        success: true,
        itemsSynced: data?.synced || 0,
        itemsProcessed: data?.total_processed || 0,
        errors: data?.errors || []
      });

      toast({
        title: "✅ Synchronisation terminée !",
        description: `${data?.synced || 0} items synchronisés avec succès`,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      toast({
        title: "❌ Erreur",
        description: "La synchronisation a échoué",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Générer les paroles manquantes via update-edn-unique-content
  const handleGenerateLyrics = async () => {
    try {
      setLyricsLoading(true);
      setLyricsResult(null);

      toast({
        title: "🎵 Génération des paroles",
        description: "Création des paroles Rang A, B et A+B depuis les compétences OIC...",
      });

      const { data, error } = await supabase.functions.invoke('update-edn-unique-content', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setLyricsResult({
        success: true,
        updated: data?.successCount || data?.updated || 0,
        processed: data?.processedCount || data?.total_processed || 0,
        errors: data?.errors || []
      });

      toast({
        title: "✅ Paroles générées !",
        description: `${data?.successCount || data?.updated || 0} items mis à jour avec paroles`,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('❌ Erreur génération paroles:', error);
      setLyricsResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      toast({
        title: "❌ Erreur",
        description: "La génération des paroles a échoué",
        variant: "destructive"
      });
    } finally {
      setLyricsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Synchronisation des tables EDN
            </CardTitle>
            <CardDescription>
              Copier les données OIC de edn_items_immersive vers edn_items_complete
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Synchronisation
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Cette action va :</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Copier les tableaux Rang A et B depuis edn_items_immersive</li>
                <li>Synchroniser les compteurs de compétences OIC</li>
                <li>Mettre à jour tous les 367 items de edn_items_complete</li>
                <li>Résoudre les incohérences entre les deux tables</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-center gap-4 p-4 bg-background rounded-lg border">
          <div className="text-center">
            <Database className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">edn_items_immersive</p>
            <p className="text-xs text-muted-foreground">Source (OIC complètes)</p>
          </div>
          <ArrowRight className="h-6 w-6 text-primary" />
          <div className="text-center">
            <Database className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">edn_items_complete</p>
            <p className="text-xs text-muted-foreground">Destination (à synchroniser)</p>
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Synchronisation en cours... {progress}%
            </p>
          </div>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {result.success ? (
                <div className="space-y-1">
                  <p className="font-medium">✅ Synchronisation réussie !</p>
                  <p className="text-sm">
                    {result.itemsSynced}/{result.itemsProcessed} items mis à jour
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {result.errors.length} erreurs détectées
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">❌ Échec de la synchronisation</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={handleSync}
            disabled={loading || lyricsLoading}
            className="w-full"
            size="lg"
            variant="default"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Synchronisation...' : 'Synchroniser tables'}
          </Button>
          
          <Button 
            onClick={handleGenerateLyrics}
            disabled={loading || lyricsLoading}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            <Zap className={`h-4 w-4 mr-2 ${lyricsLoading ? 'animate-pulse' : ''}`} />
            {lyricsLoading ? 'Génération paroles...' : 'Générer paroles OIC'}
          </Button>
        </div>

        {lyricsResult && (
          <Alert variant={lyricsResult.success ? "default" : "destructive"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {lyricsResult.success ? (
                <div className="space-y-1">
                  <p className="font-medium">🎵 Paroles générées !</p>
                  <p className="text-sm">
                    {lyricsResult.updated}/{lyricsResult.processed} items avec paroles A/B/AB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">❌ Échec génération paroles</p>
                  <p className="text-sm">{lyricsResult.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="p-2 bg-success/10 rounded border border-success/20">
            <div className="font-bold text-lg text-success">Source</div>
            <div className="text-success">edn_items_immersive</div>
          </div>
          <div className="p-2 bg-primary/10 rounded border border-primary/20">
            <div className="font-bold text-lg text-primary">Destination</div>
            <div className="text-primary">edn_items_complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
