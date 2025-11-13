import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'error' | 'success';
  message: string;
  data?: any;
}

export default function EdnDebug() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    immersiveCount: 0,
    completeCount: 0,
    hasRLS: false,
    policies: [] as any[]
  });

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    setLogs(prev => [...prev, { 
      timestamp: new Date().toLocaleTimeString(), 
      level, 
      message, 
      data 
    }]);
  };

  const testDatabase = async () => {
    setLogs([]);
    setLoading(true);
    
    try {
      // Test 1: Connexion Supabase
      addLog('info', '🔌 Test de connexion Supabase...');
      const { data: { session } } = await supabase.auth.getSession();
      addLog('success', `Connexion: ${session ? '✅ Authentifié' : '⚠️ Non authentifié (anonyme)'}`, { session });

      // Test 2: Comptage des données immersive
      addLog('info', '📊 Comptage edn_items_immersive...');
      const { count: immersiveCount, error: immersiveCountError } = await supabase
        .from('edn_items_immersive')
        .select('*', { count: 'exact', head: true });
      
      if (immersiveCountError) {
        addLog('error', '❌ Erreur comptage immersive', immersiveCountError);
      } else {
        addLog('success', `✅ ${immersiveCount} items dans edn_items_immersive`);
        setStats(prev => ({ ...prev, immersiveCount: immersiveCount || 0 }));
      }

      // Test 3: Comptage des données complete
      addLog('info', '📊 Comptage edn_items_complete...');
      const { count: completeCount, error: completeCountError } = await supabase
        .from('edn_items_complete')
        .select('*', { count: 'exact', head: true });
      
      if (completeCountError) {
        addLog('error', '❌ Erreur comptage complete', completeCountError);
      } else {
        addLog('success', `✅ ${completeCount} items dans edn_items_complete`);
        setStats(prev => ({ ...prev, completeCount: completeCount || 0 }));
      }

      // Test 4: Lecture de 5 items immersive
      addLog('info', '📖 Lecture de 5 items immersive...');
      const { data: immersiveData, error: immersiveError } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title')
        .limit(5);
      
      if (immersiveError) {
        addLog('error', '❌ Erreur lecture immersive', immersiveError);
      } else {
        addLog('success', `✅ Lecture réussie: ${immersiveData?.length || 0} items`, immersiveData);
      }

      // Test 5: Lecture de 5 items complete
      addLog('info', '📖 Lecture de 5 items complete...');
      const { data: completeData, error: completeError } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, completeness_score')
        .limit(5);
      
      if (completeError) {
        addLog('error', '❌ Erreur lecture complete', completeError);
      } else {
        addLog('success', `✅ Lecture réussie: ${completeData?.length || 0} items`, completeData);
      }

      // Test 6: Test de pagination
      addLog('info', '📄 Test de pagination (range 0-49)...');
      const { data: paginatedData, error: paginationError } = await supabase
        .from('edn_items_immersive')
        .select('item_code')
        .range(0, 49)
        .order('item_code');
      
      if (paginationError) {
        addLog('error', '❌ Erreur pagination', paginationError);
      } else {
        addLog('success', `✅ Pagination OK: ${paginatedData?.length || 0} items`, 
          paginatedData?.slice(0, 5));
      }

      // Test 7: Test de jointure simulée
      addLog('info', '🔗 Test de jointure simulée...');
      if (immersiveData && immersiveData.length > 0) {
        const codes = immersiveData.map(item => item.item_code);
        const { data: joinData, error: joinError } = await supabase
          .from('edn_items_complete')
          .select('item_code, title, completeness_score')
          .in('item_code', codes);
        
        if (joinError) {
          addLog('error', '❌ Erreur jointure', joinError);
        } else {
          addLog('success', `✅ Jointure OK: ${joinData?.length || 0} items matchés`, joinData);
        }
      }

      addLog('success', '✅ Tous les tests terminés!');
    } catch (error) {
      addLog('error', '💥 Erreur critique', error);
      console.error('[DEBUG] Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDatabase();
  }, []);

  const getLevelIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'error': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Page de Débogage EDN</h1>
            <p className="text-muted-foreground">Diagnostic complet de la base de données</p>
          </div>
          <Button onClick={testDatabase} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Relancer les tests
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Items Immersive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.immersiveCount}</div>
              <p className="text-xs text-muted-foreground">
                Scènes immersives disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Items Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completeCount}</div>
              <p className="text-xs text-muted-foreground">
                Fiches complètes disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">État RLS</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stats.hasRLS ? "default" : "destructive"}>
                {stats.hasRLS ? "✅ Activé" : "⚠️ À vérifier"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Row Level Security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Logs de diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun log pour le moment. Lancez les tests.
                </p>
              ) : (
                logs.map((log, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono opacity-60">
                            {log.timestamp}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer hover:underline">
                              Voir les détails
                            </summary>
                            <pre className="mt-2 text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
