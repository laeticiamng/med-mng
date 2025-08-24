import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, TrendingUp, BarChart3, FileCheck, Search, Filter, RefreshCw, Download, Eye, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentCompletenessAudit } from '@/components/audit/ContentCompletenessAudit';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { Helmet } from 'react-helmet-async';

export default function AuditCompleteness() {
  const spacing = useResponsiveSpacing();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auditStats = {
    totalItems: 367,
    completeItems: 341,
    incompleteItems: 26,
    completionRate: 92.9,
    lastUpdate: '2024-01-24 10:30:00',
    criticalIssues: 3,
    warnings: 15,
    info: 8
  };

  const completionCategories = [
    {
      name: 'Contenu Textuel',
      total: 367,
      completed: 361,
      percentage: 98.4,
      status: 'excellent',
      issues: ['2 items manquent de description', '4 titres à réviser']
    },
    {
      name: 'Paroles Musicales',
      total: 367,
      completed: 298,
      percentage: 81.2,
      status: 'good',
      issues: ['69 items sans paroles Rang B', '12 paroles à compléter']
    },
    {
      name: 'Compétences OIC',
      total: 367,
      completed: 354,
      percentage: 96.5,
      status: 'excellent',
      issues: ['13 items avec compétences partielles']
    },
    {
      name: 'Tableaux Récap',
      total: 367,
      completed: 289,
      percentage: 78.7,
      status: 'warning',
      issues: ['78 tableaux incomplets', '45 nécessitent validation']
    },
    {
      name: 'QCM/Questions',
      total: 367,
      completed: 234,
      percentage: 63.8,
      status: 'critical',
      issues: ['133 items sans QCM', '67 questions à réviser']
    },
    {
      name: 'Images/Visuels',
      total: 367,
      completed: 178,
      percentage: 48.5,
      status: 'critical',
      issues: ['189 items sans visuels', '23 images à optimiser']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileCheck className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un délai de rafraîchissement
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Audit de Complétude | MED MNG</title>
        <meta name="description" content="Analyse complète de la complétude des contenus EDN. Suivi détaillé des items, métriques et rapports d'audit en temps réel." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Éléments de fond */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-300/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className={`relative z-10 container mx-auto ${spacing.container}`}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white/80">
                Dernière mise à jour: {new Date(auditStats.lastUpdate).toLocaleString('fr-FR')}
              </Badge>
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-xl">
              <FileCheck className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              📊 Audit de Complétude
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analyse détaillée de la complétude des 367 items EDN. 
              Suivi en temps réel des contenus, métriques de qualité et rapports d'audit complets.
            </p>
          </div>

          {/* Vue d'ensemble */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Taux Général
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">{auditStats.completionRate}%</div>
                <Progress value={auditStats.completionRate} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">{auditStats.completeItems}/{auditStats.totalItems} items complets</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Problèmes Critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">{auditStats.criticalIssues}</div>
                <p className="text-sm text-gray-500">Nécessitent attention immédiate</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Avertissements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{auditStats.warnings}</div>
                <p className="text-sm text-gray-500">À traiter prochainement</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Items Traités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">{auditStats.completeItems}</div>
                <p className="text-sm text-gray-500">Sur {auditStats.totalItems} au total</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filtres et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par item, catégorie ou problème..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les items</SelectItem>
                    <SelectItem value="critical">Problèmes critiques</SelectItem>
                    <SelectItem value="warning">Avertissements</SelectItem>
                    <SelectItem value="completed">Complets</SelectItem>
                    <SelectItem value="incomplete">Incomplets</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analyse par catégorie */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Analyse par Catégorie
              </CardTitle>
              <CardDescription>
                Détail de la complétude par type de contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {completionCategories.map((category, index) => (
                  <div key={category.name} className={`p-4 rounded-lg border bg-white/50 animate-fade-in`}
                       style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(category.status)}
                        <div>
                          <h4 className="font-semibold text-gray-800">{category.name}</h4>
                          <p className="text-sm text-gray-500">{category.completed}/{category.total} éléments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-800">{category.percentage}%</span>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={category.percentage} className="h-3 mb-3" />
                    
                    <div className="space-y-1">
                      {category.issues.map((issue, i) => (
                        <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interface d'audit détaillée */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Audit Détaillé
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rapports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Résumé Exécutif</CardTitle>
                  <CardDescription>
                    Aperçu global de l'état de complétude des contenus EDN
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
                      <div className="text-sm text-gray-600">Contenu prêt pour production</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">15%</div>
                      <div className="text-sm text-gray-600">Nécessite révision mineure</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600 mb-2">7%</div>
                      <div className="text-sm text-gray-600">Nécessite attention urgente</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-indigo-600" />
                    Interface d'Audit Complète
                  </CardTitle>
                  <CardDescription>
                    Analyse détaillée item par item avec outils de correction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentCompletenessAudit />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Rapports et Historique</CardTitle>
                  <CardDescription>
                    Évolution de la complétude et rapports générés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: '2024-01-24', type: 'Rapport Hebdomadaire', completion: '92.9%', issues: 26 },
                      { date: '2024-01-17', type: 'Rapport Hebdomadaire', completion: '91.2%', issues: 32 },
                      { date: '2024-01-10', type: 'Rapport Hebdomadaire', completion: '89.8%', issues: 37 },
                      { date: '2024-01-03', type: 'Rapport Mensuel', completion: '88.4%', issues: 42 }
                    ].map((report, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{report.type}</div>
                          <div className="text-sm text-gray-500">{report.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{report.completion}</div>
                          <div className="text-sm text-gray-500">{report.issues} problèmes</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}