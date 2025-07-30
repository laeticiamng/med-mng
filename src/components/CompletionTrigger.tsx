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
      console.log('📡 Test extraction OIC simple...');
      
      const { data, error } = await supabase.functions.invoke('extract-oic-comprehensive', {
        body: { 
          testMode: true
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
        setStatus(`✅ Test réussi ! ${stats.oic_pages_found}/${stats.total_pages} pages OIC trouvées`);
        
        console.log('🎉 TEST API RÉUSSI !');
        console.log(`📊 Pages totales: ${stats.total_pages}`);
        console.log(`🎯 Pages OIC: ${stats.oic_pages_found}`);
        console.log(`📡 API accessible: ${stats.api_accessible}`);
        
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
      <h3 className="font-bold text-sm mb-2">🧪 Test API OIC</h3>
      <p className="text-sm mb-3">{status}</p>
      <button 
        onClick={launchCompletion}
        disabled={isRunning}
        className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
      >
        {isRunning ? '⏳ Test en cours...' : '🧪 Tester API'}
      </button>
    </div>
  );
};