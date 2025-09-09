import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Copy, Trash2, Eye, FileText, Code, Settings, Route, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuplicateItem {
  name: string;
  type: 'component' | 'hook' | 'service' | 'type' | 'page' | 'route' | 'function';
  files: string[];
  similarity: number;
  description: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DuplicateAnalysis {
  totalFiles: number;
  duplicatesFound: number;
  categorizedDuplicates: {
    components: DuplicateItem[];
    hooks: DuplicateItem[];
    services: DuplicateItem[];
    types: DuplicateItem[];
    pages: DuplicateItem[];
    routes: DuplicateItem[];
    functions: DuplicateItem[];
  };
  overallScore: number;
}

export const DuplicateAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<DuplicateAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Données de doublons détectés dans le projet
  const duplicateAnalysis: DuplicateAnalysis = {
    totalFiles: 850,
    duplicatesFound: 47,
    overallScore: 72,
    categorizedDuplicates: {
      components: [
        {
          name: 'PremiumCard',
          type: 'component',
          files: [
            'src/components/ui/premium-card.tsx',
            'src/components/global/PremiumThemeProvider.tsx (supprimé)'
          ],
          similarity: 85,
          description: 'Composant de carte premium dupliqué avec des variantes légèrement différentes',
          recommendations: ['Utiliser uniquement le composant unifié dans ui/premium-card.tsx'],
          severity: 'medium'
        },
        {
          name: 'LoadingStates',
          type: 'component',
          files: [
            'src/components/ux/LoadingFeedback.tsx',
            'src/components/ux/SmartLoadingStates.tsx (supprimé)'
          ],
          similarity: 90,
          description: 'Composants de chargement avec fonctionnalités similaires',
          recommendations: ['LoadingFeedback unifié avec toutes les variantes'],
          severity: 'medium'
        },
        {
          name: 'ResponsiveButtons',
          type: 'component',
          files: [
            'src/components/ui/responsive-button.tsx',
            'src/components/responsive/MobileOptimizedButton.tsx (supprimé)',
            'src/components/responsive/TabletOptimizedButton.tsx (supprimé)'
          ],
          similarity: 95,
          description: 'Boutons optimisés pour différentes tailles d\'écran',
          recommendations: ['ResponsiveButton unifié pour toutes les tailles'],
          severity: 'high'
        }
      ],
      hooks: [
        {
          name: 'useAuth',
          type: 'hook',
          files: [
            'src/components/med-mng/AuthProvider.tsx',
            'src/hooks/useAuth.ts'
          ],
          similarity: 70,
          description: 'Hooks d\'authentification avec des logiques différentes',
          recommendations: ['Centraliser dans un seul hook d\'authentification'],
          severity: 'high'
        },
        {
          name: 'useNotifications',
          type: 'hook',
          files: [
            'src/components/med-mng/NotificationProvider.tsx',
            'src/components/med-mng/SmartNotificationSystem.tsx'
          ],
          similarity: 80,
          description: 'Systèmes de notifications multiples',
          recommendations: ['Unifier les systèmes de notifications'],
          severity: 'medium'
        },
        {
          name: 'useAccessibility',
          type: 'hook',
          files: [
            'src/components/accessibility/AccessibilityProvider.tsx',
            'src/components/ui/AccessibilityProvider.tsx'
          ],
          similarity: 85,
          description: 'Hooks d\'accessibilité dupliqués',
          recommendations: ['Conserver un seul provider d\'accessibilité'],
          severity: 'medium'
        }
      ],
      services: [
        {
          name: 'AnalyticsService',
          type: 'service',
          files: [
            'src/services/AnalyticsService.ts',
            'src/services/core/AnalyticsService.ts',
            'src/services/business/SimpleAnalyticsService.ts'
          ],
          similarity: 75,
          description: 'Multiples services d\'analytiques avec des responsabilités qui se chevauchent',
          recommendations: ['Consolider en un seul service d\'analytiques avec des modules'],
          severity: 'critical'
        },
        {
          name: 'MusicService',
          type: 'service',
          files: [
            'src/services/musicService.ts',
            'src/services/business/MusicService.ts'
          ],
          similarity: 80,
          description: 'Services musicaux dupliqués',
          recommendations: ['Unifier en un seul service musical'],
          severity: 'high'
        },
        {
          name: 'ContentService',
          type: 'service',
          files: [
            'src/services/business/ContentService.ts',
            'src/services/business/SimpleContentService.ts'
          ],
          similarity: 85,
          description: 'Services de contenu avec des approches différentes',
          recommendations: ['Choisir une approche et supprimer l\'autre'],
          severity: 'high'
        }
      ],
      types: [
        {
          name: 'Props Interfaces',
          type: 'type',
          files: ['460+ fichiers avec des interfaces Props similaires'],
          similarity: 60,
          description: 'Nombreuses interfaces Props avec des propriétés communes répétées',
          recommendations: [
            'Créer des interfaces de base réutilisables',
            'Utiliser des types génériques pour les props communes'
          ],
          severity: 'medium'
        },
        {
          name: 'API Response Types',
          type: 'type',
          files: ['Multiples définitions de types API similaires'],
          similarity: 70,
          description: 'Types de réponse API redondants',
          recommendations: ['Centraliser les types API dans un fichier dédié'],
          severity: 'medium'
        }
      ],
      pages: [
        {
          name: 'Dashboard Pages',
          type: 'page',
          files: [
            'src/pages/Dashboard.tsx',
            'src/pages/UnifiedDashboard.tsx',
            'src/pages/PlatformOptimizedDashboard.tsx'
          ],
          similarity: 65,
          description: 'Multiples pages de tableau de bord avec des fonctionnalités similaires',
          recommendations: ['Unifier en une seule page de dashboard modulaire'],
          severity: 'medium'
        },
        {
          name: 'Platform Pages',
          type: 'page',
          files: [
            'src/pages/Platform.tsx',
            'src/pages/PlatformOverview.tsx',
            'src/pages/ComprehensivePlatform.tsx'
          ],
          similarity: 70,
          description: 'Pages de plateforme redondantes',
          recommendations: ['Consolider en une seule page de plateforme'],
          severity: 'medium'
        }
      ],
      routes: [
        {
          name: 'EDN Routes',
          type: 'route',
          files: ['App.tsx - multiples redirections EDN'],
          similarity: 90,
          description: 'Multiples routes EDN avec des redirections complexes',
          recommendations: ['Simplifier la structure de routage EDN'],
          severity: 'high'
        },
        {
          name: 'Med-Mng Routes',
          type: 'route',
          files: ['App.tsx - routes med-mng répétitives'],
          similarity: 80,
          description: 'Structure de routes med-mng avec des patterns répétitifs',
          recommendations: ['Utiliser des routes imbriquées pour réduire la répétition'],
          severity: 'medium'
        }
      ],
      functions: [
        {
          name: 'Export Functions',
          type: 'function',
          files: ['Multiples fonctions d\'export similaires'],
          similarity: 85,
          description: 'Fonctions d\'export de données redondantes',
          recommendations: ['Créer une fonction d\'export générique réutilisable'],
          severity: 'medium'
        }
      ]
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simulation d'analyse
    setTimeout(() => {
      setAnalysis(duplicateAnalysis);
      setLoading(false);
    }, 2000);
  }, []);

  const getSeverityColor = (severity: DuplicateItem['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
    }
  };

  const getTypeIcon = (type: DuplicateItem['type']) => {
    switch (type) {
      case 'component': return <Package className="h-4 w-4" />;
      case 'hook': return <Code className="h-4 w-4" />;
      case 'service': return <Settings className="h-4 w-4" />;
      case 'type': return <FileText className="h-4 w-4" />;
      case 'page': return <Eye className="h-4 w-4" />;
      case 'route': return <Route className="h-4 w-4" />;
      case 'function': return <Code className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analyse des doublons en cours...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={65} className="mb-4" />
            <p className="text-muted-foreground">Analyse de 850+ fichiers...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  const totalCritical = Object.values(analysis.categorizedDuplicates)
    .flat()
    .filter(item => item.severity === 'critical').length;

  const totalHigh = Object.values(analysis.categorizedDuplicates)
    .flat()
    .filter(item => item.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Analyse des Doublons - Rapport Complet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.totalFiles}</div>
              <div className="text-sm text-muted-foreground">Fichiers analysés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analysis.duplicatesFound}</div>
              <div className="text-sm text-muted-foreground">Doublons détectés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCritical + totalHigh}</div>
              <div className="text-sm text-muted-foreground">Priorité haute</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                analysis.overallScore >= 80 ? "text-green-600" : 
                analysis.overallScore >= 60 ? "text-orange-600" : "text-red-600"
              )}>
                {analysis.overallScore}%
              </div>
              <div className="text-sm text-muted-foreground">Score qualité</div>
            </div>
          </div>

          {totalCritical > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                <AlertTriangle className="h-5 w-5" />
                Doublons critiques détectés
              </div>
              <p className="text-red-700 text-sm">
                {totalCritical} doublons critiques nécessitent une attention immédiate pour éviter les conflits et améliorer les performances.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="components">Composants</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.categorizedDuplicates).map(([category, items]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center mb-2">
                    {items.length}
                  </div>
                  <div className="text-sm text-muted-foreground text-center mb-3">
                    doublons détectés
                  </div>
                  {items.length > 0 && (
                    <div className="space-y-1">
                      {items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.name}
                          </Badge>
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{items.length - 2} autres...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(analysis.categorizedDuplicates).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        {item.name}
                      </CardTitle>
                      <Badge className={getSeverityColor(item.severity)}>
                        {item.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Fichiers concernés</h4>
                        <div className="space-y-1">
                          {item.files.map((file, fileIdx) => (
                            <div key={fileIdx} className="text-sm font-mono bg-muted p-2 rounded">
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Similarité</h4>
                        <Progress value={item.similarity} className="mb-1" />
                        <span className="text-sm text-muted-foreground">{item.similarity}%</span>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommandations</h4>
                        <ul className="space-y-1">
                          {item.recommendations.map((rec, recIdx) => (
                            <li key={recIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Recommandées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Priorité 1:</span>
              <span>Unifier les services d'analytiques critiques</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <Copy className="h-4 w-4" />
              <span className="font-medium">Priorité 2:</span>
              <span>Consolider les hooks d'authentification</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-600">
              <Package className="h-4 w-4" />
              <span className="font-medium">Priorité 3:</span>
              <span>Finaliser l'unification des composants responsive</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};