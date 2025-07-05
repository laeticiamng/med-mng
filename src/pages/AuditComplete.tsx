import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuditDashboard } from '@/components/audit/AuditDashboard';
import { AuditGeneral } from '@/components/edn/audit/AuditGeneral';
import { AuditComprehensif } from '@/components/edn/audit/AuditComprehensif';
import { AuditIC1 } from '@/components/edn/audit/AuditIC1';
import { AuditIC1Completeness } from '@/components/audit/AuditIC1Completeness';
import { AuditIC2Completeness } from '@/components/edn/audit/AuditIC2Completeness';
import { AuditIC3 } from '@/components/edn/audit/AuditIC3';
import { AuditIC4 } from '@/components/edn/audit/AuditIC4';
import { AuditIC5 } from '@/components/edn/audit/AuditIC5';
import { AuditComparatif } from '@/components/edn/audit/AuditComparatif';
import { TranslatedText } from '@/components/TranslatedText';
import { 
  FileText, 
  TrendingUp, 
  Download, 
  ArrowLeft, 
  Award, 
  BarChart3, 
  Database, 
  Target, 
  BookOpen, 
  Users, 
  Shield,
  Brain,
  Heart,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AuditComplete = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleExportReport = () => {
    console.log('Export du rapport complet d\'audit');
    // Logique d'export à implémenter
  };

  const auditSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Award,
      badge: 'Principal',
      badgeVariant: 'default' as const,
      description: 'Vue d\'ensemble générale'
    },
    {
      id: 'comprehensif',
      label: 'Audit Complet',
      icon: Database,
      badge: 'Détaillé',
      badgeVariant: 'secondary' as const,
      description: 'Analyse exhaustive'
    },
    {
      id: 'general',
      label: 'Vue Générale',
      icon: BarChart3,
      badge: 'Synthèse',
      badgeVariant: 'outline' as const,
      description: 'Résumé global'
    },
    {
      id: 'ic1-detail',
      label: 'IC-1 Détaillé',
      icon: Users,
      badge: 'Relationnel',
      badgeVariant: 'destructive' as const,
      description: 'Relation médecin-patient'
    },
    {
      id: 'ic1-completeness',
      label: 'IC-1 Complétude',
      icon: Heart,
      badge: 'Complétude',
      badgeVariant: 'secondary' as const,
      description: 'Analyse de complétude IC-1'
    },
    {
      id: 'ic2',
      label: 'IC-2',
      icon: Shield,
      badge: 'Éthique',
      badgeVariant: 'default' as const,
      description: 'Valeurs professionnelles'
    },
    {
      id: 'ic3',
      label: 'IC-3',
      icon: Brain,
      badge: 'Raisonnement',
      badgeVariant: 'outline' as const,
      description: 'Raisonnement clinique'
    },
    {
      id: 'ic4',
      label: 'IC-4',
      icon: Target,
      badge: 'Qualité',
      badgeVariant: 'secondary' as const,
      description: 'Qualité et sécurité'
    },
    {
      id: 'ic5',
      label: 'IC-5',
      icon: Stethoscope,
      badge: 'Pratique',
      badgeVariant: 'default' as const,
      description: 'Pratique clinique'
    },
    {
      id: 'comparatif',
      label: 'Analyse Comparative',
      icon: TrendingUp,
      badge: 'Comparaison',
      badgeVariant: 'outline' as const,
      description: 'Comparaison inter-items'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/edn" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">
                <TranslatedText text="Retour aux items EDN" />
              </span>
            </Link>
            <div className="h-6 border-l border-gray-300" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <TranslatedText text="Audit Complet de la Plateforme" />
              </h1>
              <p className="text-lg text-gray-600">
                <TranslatedText text="Analyse approfondie de tous les items EDN et modules" />
              </p>
            </div>
          </div>
          
          <Button onClick={handleExportReport} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span><TranslatedText text="Exporter rapport" /></span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Items Total</p>
                <p className="text-2xl font-bold">367</p>
              </div>
              <Database className="h-8 w-8 text-blue-200" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Modules Auditables</p>
                <p className="text-2xl font-bold">10</p>
              </div>
              <Award className="h-8 w-8 text-green-200" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Analyses Disponibles</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Couverture IC</p>
                <p className="text-2xl font-bold">IC-1 à IC-5</p>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Main Audit Interface */}
        <Card className="p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                <TranslatedText text="Modules d'Audit Disponibles" />
              </h2>
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-2">
                {auditSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <TabsTrigger 
                      key={section.id}
                      value={section.id} 
                      className="flex flex-col items-center space-y-1 text-xs h-16 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium leading-tight text-center">{section.label}</span>
                      <Badge variant={section.badgeVariant} className="text-xs scale-75">
                        {section.badge}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Contents */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Dashboard Principal</h3>
                <p className="text-gray-600">Vue d'ensemble de l'audit avec métriques et indicateurs clés</p>
              </div>
              <AuditDashboard />
            </TabsContent>
            
            <TabsContent value="comprehensif" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Audit Compréhensif</h3>
                <p className="text-gray-600">Analyse détaillée et exhaustive de tous les composants</p>
              </div>
              <AuditComprehensif />
            </TabsContent>
            
            <TabsContent value="general" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Vue Générale</h3>
                <p className="text-gray-600">Synthèse globale des performances et de la complétude</p>
              </div>
              <AuditGeneral />
            </TabsContent>
            
            <TabsContent value="ic1-detail" className="mt-6">
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-700 mb-2">IC-1 : Relation médecin-malade</h3>
                <p className="text-red-600">Audit détaillé des compétences relationnelles et communicationnelles</p>
              </div>
              <AuditIC1 />
            </TabsContent>

            <TabsContent value="ic1-completeness" className="mt-6">
              <div className="bg-pink-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-pink-700 mb-2">IC-1 : Analyse de Complétude</h3>
                <p className="text-pink-600">Vérification de la complétude des données IC-1</p>
              </div>
              <AuditIC1Completeness />
            </TabsContent>
            
            <TabsContent value="ic2" className="mt-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">IC-2 : Valeurs professionnelles</h3>
                <p className="text-blue-600">Audit des valeurs éthiques et déontologiques</p>
              </div>
              <AuditIC2Completeness />
            </TabsContent>
            
            <TabsContent value="ic3" className="mt-6">
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">IC-3 : Raisonnement et décision</h3>
                <p className="text-purple-600">Analyse du raisonnement clinique et de la prise de décision</p>
              </div>
              <AuditIC3 />
            </TabsContent>
            
            <TabsContent value="ic4" className="mt-6">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-green-700 mb-2">IC-4 : Qualité et sécurité des soins</h3>
                <p className="text-green-600">Évaluation de la qualité et de la sécurité des pratiques</p>
              </div>
              <AuditIC4 />
            </TabsContent>
            
            <TabsContent value="ic5" className="mt-6">
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">IC-5 : Pratique clinique</h3>
                <p className="text-yellow-600">Audit des compétences pratiques et techniques</p>
              </div>
              <AuditIC5 />
            </TabsContent>
            
            <TabsContent value="comparatif" className="mt-6">
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Analyse Comparative</h3>
                <p className="text-indigo-600">Comparaison inter-items et analyse des tendances</p>
              </div>
              <AuditComparatif />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            <TranslatedText text="Système d'audit unifié - Plateforme MED MNG" /> • 
            <span className="ml-2">Version 2.0</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditComplete;