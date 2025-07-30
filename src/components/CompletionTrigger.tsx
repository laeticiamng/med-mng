import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const CompletionTrigger = () => {
  const [status, setStatus] = useState<string>('Prêt à lancer');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-4), message]); // Garder les 5 derniers logs
  };

  const launchCompletion = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog('🚀 Démarrage du test...');
      setStatus('🚀 Lancement de la completion...');
      
      // Vérifier la configuration Supabase d'abord
      const { data: { session } } = await supabase.auth.getSession();
      addLog(`🔐 Session: ${session ? 'Connecté' : 'Anonyme'}`);
      
      addLog('📡 Appel Edge Function test-connectivity...');
      
      const { data, error } = await supabase.functions.invoke('test-connectivity', {
        body: { 
          action: 'test',
          timestamp: new Date().toISOString()
        }
      });

      addLog(`📨 Réponse reçue: ${data ? 'OK' : 'NULL'}`);
      
      if (error) {
        addLog(`❌ ERREUR: ${error.message}`);
        setStatus(`❌ Erreur: ${error.message}`);
        return;
      }

      addLog(`📊 Data: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data?.success) {
        const stats = data.statistics;
        const message = `✅ Test réussi ! ${stats.oic_pages_found}/${stats.total_pages} pages OIC trouvées`;
        addLog(message);
        setStatus(message);
        
        addLog('🎉 TEST API RÉUSSI !');
        addLog(`📊 Pages totales: ${stats.total_pages}`);
        addLog(`🎯 Pages OIC: ${stats.oic_pages_found}`);
        addLog(`📡 API accessible: ${stats.api_accessible}`);
        
      } else {
        const errorMsg = `❌ Échec: ${data?.error || 'Erreur inconnue'}`;
        addLog(errorMsg);
        setStatus(errorMsg);
      }
      
    } catch (error: any) {
      const errorMsg = `💥 Erreur critique: ${error.message}`;
      addLog(errorMsg);
      setStatus(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    launchCompletion();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🧪 Test API OIC</h3>
      <p className="text-sm mb-3">{status}</p>
      
      {/* Logs détaillés */}
      {logs.length > 0 && (
        <div className="mb-3 p-2 bg-gray-100 rounded text-xs max-h-20 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      )}
      
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