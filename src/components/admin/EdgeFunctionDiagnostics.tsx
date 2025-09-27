import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Code,
  Database,
  Zap,
  Settings,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EdgeFunction {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastDeploy: Date;
  lastExecution?: Date;
  executionCount: number;
  errorRate: number;
  avgDuration: number;
  size: string;
  version: string;
}

interface TestResult {
  functionName: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
  statusCode?: number;
}

export const EdgeFunctionDiagnostics: React.FC = () => {
  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(true);
  const [testingFunction, setTestingFunction] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<EdgeFunction | null>(null);
  const [testPayload, setTestPayload] = useState('{"test": true}');

  // Fonctions basées sur le repository GitHub et supabase/functions/README.md
  const edgeFunctions: EdgeFunction[] = [
    {
      name: 'med-mng-api',
      description: 'API principale MED-MNG pour authentification et données utilisateur',
      status: 'active',
      lastDeploy: new Date('2025-09-27'),
      lastExecution: new Date('2025-09-27T10:30:00'),
      executionCount: 1250,
      errorRate: 0.02,
      avgDuration: 180,
      size: '45KB',
      version: '1.2.3'
    },
    {
      name: 'openai-chat',
      description: 'Proxy sécurisé pour l\'IA conversationnelle médicale',
      status: 'active',
      lastDeploy: new Date('2025-09-26'),
      lastExecution: new Date('2025-09-27T10:25:00'),
      executionCount: 890,
      errorRate: 0.01,
      avgDuration: 2400,
      size: '32KB',
      version: '2.1.0'
    },
    {
      name: 'extract-edn-objectifs',
      description: 'Extraction automatisée des objectifs EDN depuis OIC',
      status: 'active',
      lastDeploy: new Date('2025-09-24'),
      lastExecution: new Date('2025-09-27T06:00:00'),
      executionCount: 45,
      errorRate: 0.05,
      avgDuration: 15000,
      size: '78KB',
      version: '3.0.1'
    },
    {
      name: 'oic-readme-extraction',
      description: 'Extraction API-first des 4,872 objectifs EDN (méthode README)',
      status: 'active',
      lastDeploy: new Date('2025-09-25'),
      lastExecution: new Date('2025-09-26T12:00:00'),
      executionCount: 12,
      errorRate: 0.08,
      avgDuration: 45000,
      size: '95KB',
      version: '1.4.0'
    },
    {
      name: 'send-welcome-email',
      description: 'Système d\'emails transactionnels pour nouveaux utilisateurs',
      status: 'active',
      lastDeploy: new Date('2025-09-20'),
      lastExecution: new Date('2025-09-27T09:15:00'),
      executionCount: 340,
      errorRate: 0.003,
      avgDuration: 850,
      size: '28KB',
      version: '1.1.2'
    },
    {
      name: 'puppeteer-oic-extraction',
      description: 'Extraction basée navigateur (Legacy - remplacée par GitHub Actions)',
      status: 'inactive',
      lastDeploy: new Date('2025-08-15'),
      lastExecution: new Date('2025-08-20T14:00:00'),
      executionCount: 8,
      errorRate: 0.25,
      avgDuration: 60000,
      size: '120KB',
      version: '0.9.5'
    },
    {
      name: 'fix-oic-data-quality',
      description: 'Amélioration automatique de la qualité des données OIC',
      status: 'active',
      lastDeploy: new Date('2025-09-22'),
      lastExecution: new Date('2025-09-26T20:00:00'),
      executionCount: 25,
      errorRate: 0.04,
      avgDuration: 8500,
      size: '67KB',
      version: '2.0.0'
    }
  ];

  const testEdgeFunction = async (functionName: string) => {
    setTestingFunction(functionName);
    const startTime = Date.now();

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Créer un payload de test basé sur la fonction
      let payload = {};
      try {
        payload = JSON.parse(testPayload);
      } catch {
        payload = { test: true, timestamp: new Date().toISOString() };
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const duration = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      const result: TestResult = {
        functionName,
        success: response.ok,
        response: responseData,
        duration,
        statusCode: response.status
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Garder les 10 derniers résultats
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        functionName,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        duration
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setTestingFunction(null);
    }
  };

  const getStatusColor = (status: EdgeFunction['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'testing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EdgeFunction['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Square className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Square className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  useEffect(() => {
    // Simuler le chargement des fonctions
    setTimeout(() => {
      setFunctions(edgeFunctions);
      setIsLoadingFunctions(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Diagnostics Edge Functions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des fonctions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fonctions Déployées</h3>
              {isLoadingFunctions ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {functions.map((func) => (
                    <Card 
                      key={func.name} 
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedFunction?.name === func.name ? "ring-2 ring-primary" : ""
                      )}
                      onClick={() => setSelectedFunction(func)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(func.status)}
                            <code className="text-sm font-mono">{func.name}</code>
                          </div>
                          <Badge className={getStatusColor(func.status)}>
                            {func.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {func.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>v{func.version} • {func.size}</span>
                          <span>{func.executionCount} exécutions</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Détails et tests */}
            <div className="space-y-4">
              {selectedFunction ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {selectedFunction.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Statut:</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(selectedFunction.status)}
                            <span>{selectedFunction.status}</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium">Version:</label>
                          <p className="mt-1">{selectedFunction.version}</p>
                        </div>
                        <div>
                          <label className="font-medium">Taille:</label>
                          <p className="mt-1">{selectedFunction.size}</p>
                        </div>
                        <div>
                          <label className="font-medium">Taux d'erreur:</label>
                          <p className="mt-1">{(selectedFunction.errorRate * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                          <label className="font-medium">Durée moyenne:</label>
                          <p className="mt-1">{formatDuration(selectedFunction.avgDuration)}</p>
                        </div>
                        <div>
                          <label className="font-medium">Exécutions:</label>
                          <p className="mt-1">{selectedFunction.executionCount}</p>
                        </div>
                      </div>

                      <div>
                        <label className="font-medium text-sm">Payload de test:</label>
                        <Textarea
                          value={testPayload}
                          onChange={(e) => setTestPayload(e.target.value)}
                          className="mt-1 font-mono text-xs"
                          rows={3}
                          placeholder='{"test": true, "data": "example"}'
                        />
                      </div>

                      <Button
                        onClick={() => testEdgeFunction(selectedFunction.name)}
                        disabled={testingFunction === selectedFunction.name}
                        className="w-full"
                      >
                        {testingFunction === selectedFunction.name ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Test en cours...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Tester la Fonction
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Sélectionnez une fonction pour voir les détails et lancer des tests
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Résultats des tests */}
              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Résultats des Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {testResults.map((result, index) => (
                        <Alert key={index} variant={result.success ? 'default' : 'destructive'}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-xs">{result.functionName}</code>
                                {result.statusCode && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.statusCode}
                                  </Badge>
                                )}
                              </div>
                              <AlertDescription className="text-xs">
                                {result.success ? (
                                  <span className="text-green-600">Test réussi</span>
                                ) : (
                                  <span>{result.error}</span>
                                )}
                              </AlertDescription>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div>{formatDuration(result.duration)}</div>
                              <div>{new Date().toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};