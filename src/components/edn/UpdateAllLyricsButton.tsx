import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Music, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UpdateStats {
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

export const UpdateAllLyricsButton: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [currentStats, setCurrentStats] = useState<UpdateStats | null>(null);
  const { toast } = useToast();

  const updateAllLyrics = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setCurrentStats(null);
    
    toast({
      title: "🎵 Mise à jour globale des paroles",
      description: "Mise à jour de toutes les paroles suite aux nouvelles compétences OIC...",
      duration: 5000
    });

    try {
      // Étape 1: Paroles Rang A
      setUpdateProgress(10);
      const { data: statsA, error: errorA } = await supabase.functions.invoke('generate-lyrics-bulk', {
        body: { rang: 'A' }
      });

      if (errorA) throw new Error(`Erreur Rang A: ${errorA.message}`);
      
      setUpdateProgress(35);
      toast({
        title: "✅ Rang A terminé",
        description: `Rang A: ${statsA.stats.success}/${statsA.stats.processed} items mis à jour`,
      });

      // Étape 2: Paroles Rang B
      const { data: statsB, error: errorB } = await supabase.functions.invoke('generate-lyrics-bulk', {
        body: { rang: 'B' }
      });

      if (errorB) throw new Error(`Erreur Rang B: ${errorB.message}`);
      
      setUpdateProgress(70);
      toast({
        title: "✅ Rang B terminé",
        description: `Rang B: ${statsB.stats.success}/${statsB.stats.processed} items mis à jour`,
      });

      // Étape 3: Paroles Rang A+B
      const { data: statsAB, error: errorAB } = await supabase.functions.invoke('generate-lyrics-bulk', {
        body: { rang: 'AB' }
      });

      if (errorAB) throw new Error(`Erreur Rang A+B: ${errorAB.message}`);
      
      setUpdateProgress(100);

      // Statistiques finales
      const finalStats: UpdateStats = {
        processed: statsA.stats.processed + statsB.stats.processed + statsAB.stats.processed,
        success: statsA.stats.success + statsB.stats.success + statsAB.stats.success,
        failed: statsA.stats.failed + statsB.stats.failed + statsAB.stats.failed,
        errors: [...(statsA.stats.errors || []), ...(statsB.stats.errors || []), ...(statsAB.stats.errors || [])]
      };

      setCurrentStats(finalStats);

      toast({
        title: "🎉 Mise à jour terminée !",
        description: `Toutes les paroles mises à jour! Total: ${finalStats.success} succès / ${finalStats.processed} traités`,
        duration: 15000
      });

      // Recharger après quelques secondes
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Erreur mise à jour paroles:', error);
      toast({
        title: "❌ Erreur",
        description: `Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`,
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <Music className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-orange-900">
              Mise à jour des paroles EDN
            </CardTitle>
            <CardDescription className="text-orange-700">
              Suite aux mises à jour des compétences OIC
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Contenu mis à jour
          </h4>
          <p className="text-sm text-orange-800 leading-relaxed">
            Les compétences OIC ont été synchronisées pour tous les items. 
            Cette action va régénérer toutes les paroles musicales (Rang A, Rang B, et Rang A+B) 
            en se basant sur les nouveaux contenus de connaissances.
          </p>
        </div>

        {isUpdating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">Progression</span>
              <span className="text-orange-900 font-medium">{updateProgress}%</span>
            </div>
            <Progress value={updateProgress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded text-center ${updateProgress > 30 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Rang A
              </div>
              <div className={`p-2 rounded text-center ${updateProgress > 65 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Rang B
              </div>
              <div className={`p-2 rounded text-center ${updateProgress === 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Rang A+B
              </div>
            </div>
          </div>
        )}

        {currentStats && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Résultats</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentStats.processed}</div>
                <div className="text-blue-700">Traités</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentStats.success}</div>
                <div className="text-green-700">Succès</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{currentStats.failed}</div>
                <div className="text-red-700">Erreurs</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={updateAllLyrics}
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
          size="lg"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Mise à jour en cours... ({updateProgress}%)
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Mettre à jour toutes les paroles
            </>
          )}
        </Button>
        
        <p className="text-xs text-orange-600 text-center">
          Cette opération peut prendre 10-15 minutes pour traiter les 367 items
        </p>
      </CardContent>
    </Card>
  );
};