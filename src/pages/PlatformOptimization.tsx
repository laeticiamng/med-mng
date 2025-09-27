import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Database, Code, Layers, PlayCircle, CheckCircle } from 'lucide-react';

// Import des composants d'optimisation
import { PlatformOptimizer } from '@/utils/platform/PlatformOptimizer';
import { ProductionConsoleCleanup } from '@/utils/cleanup/ProductionConsoleCleanup';
import { PageConsolidator } from '@/utils/consolidation/PageConsolidator';
import { RealDuplicateCleanup } from '@/utils/cleanup/RealDuplicateCleanup';
import { DuplicateAnalyzer } from '@/utils/analysis/DuplicateAnalyzer';

export default function PlatformOptimization() {
  const [globalOptimizationScore, setGlobalOptimizationScore] = useState(78);

  const optimizationMetrics = [
    {
      name: 'Performance',
      score: 85,
      status: 'good',
      description: '+35% amélioration attendue'
    },
    {
      name: 'Sécurité',
      score: 72,
      status: 'warning',
      description: '10 warnings à corriger'
    },
    {
      name: 'Code Quality',
      score: 88,
      status: 'good', 
      description: 'Architecture unifiée'
    },
    {
      name: 'Maintenance',
      score: 92,
      status: 'excellent',
      description: 'Doublons supprimés'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Bon</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>Optimisation Plateforme MED-MNG - Analyse et Nettoyage</title>
        <meta name="description" content="Centre d'optimisation complet pour la plateforme MED-MNG avec analyse des doublons, nettoyage automatique et consolidation intelligente." />
      </Helmet>

      {/* Header avec métriques globales */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          🚀 Centre d'Optimisation MED-MNG
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Analyse complète, nettoyage automatique et optimisation intelligente de la plateforme.
        </p>

        {/* Score global et métriques */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="h-5 w-5" />
              Score Global de la Plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(globalOptimizationScore)}`}>
                  {globalOptimizationScore}%
                </div>
                <div className="text-sm text-muted-foreground">Score Global</div>
              </div>
              
              {optimizationMetrics.map((metric, idx) => (
                <div key={idx} className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                  {getStatusBadge(metric.status)}
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs d'optimisation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="platform">Optimiseur</TabsTrigger>
          <TabsTrigger value="console">Console Logs</TabsTrigger>
          <TabsTrigger value="pages">Consolidation</TabsTrigger>
          <TabsTrigger value="duplicates">Doublons</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Console Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-red-600">1378</div>
                  <p className="text-sm text-muted-foreground">
                    Console logs à nettoyer en production
                  </p>
                  <Badge className="bg-red-100 text-red-800">Critique</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Pages Redondantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-orange-600">16</div>
                  <p className="text-sm text-muted-foreground">
                    Pages à consolider
                  </p>
                  <Badge className="bg-orange-100 text-orange-800">Haute</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">✅</div>
                  <p className="text-sm text-muted-foreground">
                    user_privacy_preferences créée
                  </p>
                  <Badge className="bg-green-100 text-green-800">Résolu</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platform">
          <PlatformOptimizer />
        </TabsContent>

        <TabsContent value="console">
          <ProductionConsoleCleanup />
        </TabsContent>

        <TabsContent value="pages">
          <PageConsolidator />
        </TabsContent>

        <TabsContent value="duplicates">
          <RealDuplicateCleanup />
        </TabsContent>

        <TabsContent value="analysis">
          <DuplicateAnalyzer />
        </TabsContent>
      </Tabs>

      {/* Actions rapides */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-green-800">⚡ Actions Rapides d'Optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="justify-start" variant="outline">
              <PlayCircle className="h-4 w-4 mr-2" />
              🧹 Nettoyage Express (5 min)
            </Button>
            <Button className="justify-start" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              📊 Audit Complet (15 min)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}