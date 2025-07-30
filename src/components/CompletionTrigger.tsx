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
      console.log('📡 Invocation complete-edn-with-oic...');
      
      const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
        body: { 
          action: 'complete',
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
        setStatus(`✅ Terminé ! ${stats.items_completed}/${stats.items_processed} items enrichis (${stats.completion_rate})`);
        
        console.log('🎉 COMPLETION RÉUSSIE !');
        console.log(`📊 Items traités: ${stats.items_processed}`);
        console.log(`✅ Items enrichis: ${stats.items_completed}`);
        console.log(`📈 Taux: ${stats.completion_rate}`);
        
        if (data.details?.length > 0) {
          console.log('📋 Exemples enrichis:');
          data.details.slice(0, 5).forEach((item: any) => {
            console.log(`${item.item_code}: ${item.total_before} → ${item.total_after} (+${item.total_after - item.total_before})`);
          });
        }
        
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
      <h3 className="font-bold text-sm mb-2">🎯 Completion EDN-OIC</h3>
      <p className="text-sm mb-3">{status}</p>
      <button 
        onClick={launchCompletion}
        disabled={isRunning}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? '⏳ En cours...' : '🚀 Relancer'}
      </button>
    </div>
  );
};