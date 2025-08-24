import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, TestTube, Play, CheckCircle, XCircle, Clock, AlertTriangle, Download, FileText, Zap, Cpu, Code, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { EdnExtractionTest } from '@/components/test/EdnExtractionTest';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { Helmet } from 'react-helmet-async';

export default function TestExtraction() {
  const spacing = useResponsiveSpacing();
  const [activeTest, setActiveTest] = useState('main');

  const testSuites = [
    {
      id: 'extraction',
      name: 'Extraction UNESS',
      description: 'Test complet de l\'extraction des données LISA 2025',
      status: 'running',
      progress: 75,
      tests: 28,
      passed: 21,
      failed: 2,
      skipped: 5
    },
    {
      id: 'validation',
      name: 'Validation Données',
      description: 'Vérification de l\'intégrité des données extraites',
      status: 'completed',
      progress: 100,
      tests: 15,
      passed: 15,
      failed: 0,
      skipped: 0
    },
    {
      id: 'performance',
      name: 'Tests Performance',
      description: 'Analyse des performances d\'extraction',
      status: 'pending',
      progress: 0,
      tests: 10,
      passed: 0,
      failed: 0,
      skipped: 10
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Test d'Extraction UNESS | MED MNG</title>
        <meta name="description" content="Interface de test pour l'extraction complète des données UNESS LISA 2025. Validation et performance en temps réel." />
      </Helmet>

      <ConsistentBackground variant="light">
        <div className={`container mx-auto px-4 py-8 ${spacing.container}`}>
          <PageHeader
            title="🧪 Test d'Extraction UNESS"
            subtitle="Interface de test pour la nouvelle fonction d'extraction complète des données UNESS LISA 2025. Validation automatisée, tests de performance et monitoring en temps réel."
            icon={TestTube}
            showBackButton
            backTo="/"
            badge={{
              text: "Environnement de test",
              variant: "outline"
            }}
          />

          {/* Dashboard des tests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {testSuites.map((suite, index) => (
              <Card key={suite.id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-in ${
                      activeTest === suite.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setActiveTest(suite.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(suite.status)}
                      {suite.name}
                    </CardTitle>
                    <Badge className={getStatusColor(suite.status)}>
                      {suite.status}
                    </Badge>
                  </div>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-medium">{suite.progress}%</span>
                    </div>
                    <Progress value={suite.progress} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-semibold text-green-600">{suite.passed}</div>
                        <div className="text-gray-500">Réussis</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{suite.failed}</div>
                        <div className="text-gray-500">Échecs</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-600">{suite.skipped}</div>
                        <div className="text-gray-500">Ignorés</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interface de test principale */}
          <Tabs defaultValue="extraction" value={activeTest} onValueChange={setActiveTest} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="main" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Test Principal
              </TabsTrigger>
              <TabsTrigger value="extraction" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Extraction
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Validation
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-indigo-600" />
                    Interface de Test Principale
                  </CardTitle>
                  <CardDescription>
                    Exécution des tests d'extraction UNESS avec monitoring en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EdnExtractionTest />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extraction" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Tests d'Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Connexion UNESS API', status: 'success', time: '0.3s' },
                      { name: 'Extraction Items EDN', status: 'running', time: '2.1s' },
                      { name: 'Parsing Compétences OIC', status: 'pending', time: '--' },
                      { name: 'Validation Structure', status: 'pending', time: '--' }
                    ].map((test, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{test.time}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-purple-600" />
                      Logs en Temps Réel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                      <div>[2024-01-24 10:30:15] Démarrage extraction UNESS...</div>
                      <div>[2024-01-24 10:30:16] ✓ Connexion API établie</div>
                      <div>[2024-01-24 10:30:17] → Extraction 367 items EDN</div>
                      <div>[2024-01-24 10:30:18] → Parsing compétences OIC</div>
                      <div className="animate-pulse">[2024-01-24 10:30:19] → En cours...</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Résultats de Validation
                  </CardTitle>
                  <CardDescription>
                    Vérification complète de l'intégrité des données extraites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Items EDN', value: '367/367', status: 'success' },
                      { label: 'Compétences OIC', value: '1247/1250', status: 'warning' },
                      { label: 'Relations', value: '98.5%', status: 'success' },
                      { label: 'Intégrité', value: '99.9%', status: 'success' }
                    ].map((metric, i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          metric.status === 'success' ? 'text-green-600' : 
                          metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {metric.value}
                        </div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-orange-600" />
                      Métriques Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Temps d\'extraction moyen', value: '2.3s', trend: 'down' },
                      { label: 'Mémoire utilisée', value: '45 MB', trend: 'stable' },
                      { label: 'Taux de réussite', value: '99.2%', trend: 'up' },
                      { label: 'Throughput', value: '150 items/s', trend: 'up' }
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{metric.value}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            metric.trend === 'up' ? 'bg-green-500' :
                            metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-red-600" />
                      Debugging
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger les logs
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Rapport détaillé
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Optimiser
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ConsistentBackground>
    </>
  );
}