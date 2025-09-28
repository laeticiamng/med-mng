import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const OicExtraction = () => {
  const [logs, setLogs] = useState<Array<{time: string, message: string, type: string}>>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    extracted: 0,
    total: 4872,
    progress: 0,
    status: 'idle'
  });

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') => {
    const newLog = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const baseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  };

  const callEdgeFunction = async (action: string, additionalData = {}) => {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...additionalData })
    });
    return await response.json();
  };

  const startExtraction = async () => {
    setIsExtracting(true);
    addLog('🧪 ÉTAPE 1: Test d\'insertion des données...', 'info');
    
    try {
      // 1. Test d'insertion
      const testResult = await callEdgeFunction('insert_test_data');
      addLog(`✅ Test d'insertion: ${testResult.success ? 'Réussi' : 'Échoué'}`, testResult.success ? 'success' : 'error');
      
      if (!testResult.success) {
        addLog(`❌ Erreur: ${testResult.error}`, 'error');
        setIsExtracting(false);
        return;
      }

      addLog('🚀 ÉTAPE 2: Lancement de l\'extraction complète...', 'info');
      
      // 2. Lancer l'extraction complète
      const extractionResult = await callEdgeFunction('start');
      addLog(`🎯 Extraction lancée avec session: ${extractionResult.session_id}`, 'success');
      
      if (extractionResult.session_id) {
        setSessionId(extractionResult.session_id);
        addLog('⏰ Monitoring du progrès...', 'info');
        
        // 3. Monitor le progrès
        monitorProgress(extractionResult.session_id);
      }
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
      setIsExtracting(false);
    }
  };

  const monitorProgress = async (sessionId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 60 minutes max
    
    const checkProgress = async () => {
      try {
        const status = await callEdgeFunction('status', { session_id: sessionId });
        const progressPercent = ((status.items_extracted / status.total_expected) * 100).toFixed(1);
        
        setStats({
          extracted: status.items_extracted,
          total: status.total_expected,
          progress: parseFloat(progressPercent),
          status: status.status
        });
        
        addLog(`📈 Progrès: ${status.items_extracted}/${status.total_expected} (${progressPercent}%) - Status: ${status.status}`, 'progress');
        
        if (status.status === 'termine') {
          addLog('🎉 EXTRACTION TERMINÉE !', 'success');
          await generateFinalReport();
          setIsExtracting(false);
          return;
        } else if (status.status === 'erreur') {
          addLog(`❌ ERREUR: ${status.error_message}`, 'error');
          setIsExtracting(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 30000); // Check every 30 seconds
        } else {
          addLog('⏰ Timeout atteint - Arrêt du monitoring', 'error');
          setIsExtracting(false);
        }
        
      } catch (error) {
        addLog(`❌ Erreur monitoring: ${error.message}`, 'error');
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 30000);
        } else {
          setIsExtracting(false);
        }
      }
    };
    
    checkProgress();
  };

  const generateFinalReport = async () => {
    addLog('📊 GÉNÉRATION DU RAPPORT FINAL...', 'info');
    
    try {
      const report = await callEdgeFunction('rapport');
      
      addLog('🎯 RAPPORT FINAL D\'EXTRACTION OIC', 'success');
      addLog(`✅ Compétences extraites: ${report.total_competences_extraites}`, 'success');
      addLog(`🎯 Compétences attendues: ${report.total_competences_attendues}`, 'success');
      addLog(`📈 Completude globale: ${report.completude_globale}%`, 'success');
      
      // Vérification SQL finale
      const { count } = await supabase
        .from('oic_competences')
        .select('*', { count: 'exact', head: true });
      
      addLog(`🔍 COUNT(*) FROM oic_competences: ${count}`, 'success');
      
    } catch (error) {
      addLog(`❌ Erreur rapport: ${error.message}`, 'error');
    }
  };

  const checkCurrentCount = async () => {
    try {
      const { count } = await supabase
        .from('oic_competences')
        .select('*', { count: 'exact', head: true });
      addLog(`📊 Compétences actuellement en base: ${count || 0}`, 'info');
    } catch (error) {
      addLog(`❌ Erreur count: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    checkCurrentCount();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Extraction OIC - 4,872 Compétences
            <Badge variant={isExtracting ? "destructive" : "secondary"}>
              {isExtracting ? 'En cours' : 'Prêt'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={startExtraction} 
              disabled={isExtracting}
              className="flex-1"
            >
              {isExtracting ? 'Extraction en cours...' : 'Démarrer l\'extraction'}
            </Button>
            <Button 
              onClick={checkCurrentCount} 
              variant="outline"
            >
              Vérifier count actuel
            </Button>
          </div>
          
          {stats.status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progrès: {stats.extracted}/{stats.total}</span>
                <span>{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs en temps réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto bg-black text-green-400 p-4 rounded font-mono text-sm space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'progress' ? 'text-yellow-400' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
              `}>
                [{log.time}] {log.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OicExtraction;