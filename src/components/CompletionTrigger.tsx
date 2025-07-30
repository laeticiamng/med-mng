import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const CompletionTrigger = () => {
  const [status, setStatus] = useState<string>('Prêt à lancer');
  const [isRunning, setIsRunning] = useState(false);

  const launchCompletion = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setStatus('🚀 Lancement de la completion...');
    
    try {
      console.log('📡 Lancement extraction API-first OIC...');
      
      const { data, error } = await supabase.functions.invoke('extract-oic-api-first', {
        body: { 
          action: 'extract',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('❌ ERREUR:', error);
        setStatus(`❌ Erreur: ${error.message}`);
        return;
      }

      console.log('📊 RÉPONSE:', data);

      if (data?.success) {
        const stats = data.statistics;
        setStatus(`✅ Terminé ! ${stats.competences_inserted}/${stats.competences_extracted} compétences extraites (${stats.success_rate})`);
        
        console.log('🎉 EXTRACTION API-FIRST RÉUSSIE !');
        console.log(`📊 Pages trouvées: ${stats.pages_found}`);
        console.log(`🎯 Compétences extraites: ${stats.competences_extracted}`);
        console.log(`💾 Compétences insérées: ${stats.competences_inserted}`);
        console.log(`📈 Taux: ${stats.success_rate}`);
        
      } else {
        setStatus(`❌ Échec: ${data?.error || 'Erreur inconnue'}`);
        console.error('❌ ÉCHEC:', data);
      }

    } catch (error: any) {
      console.error('💥 ERREUR CRITIQUE:', error);
      setStatus(`💥 Erreur critique: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-lancement au montage du composant
  useEffect(() => {
    launchCompletion();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🎯 Extraction API-first OIC</h3>
      <p className="text-sm mb-3">{status}</p>
      <button 
        onClick={launchCompletion}
        disabled={isRunning}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? '⏳ En cours...' : '🚀 Extraire OIC'}
      </button>
    </div>
  );
};