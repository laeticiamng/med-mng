/**
 * 🌟 PREMIUM FEATURES - MED-MNG v3.0
 * Composant showcasing toutes les fonctionnalités premium
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Shield, 
  Brain, 
  Activity,
  Users,
  BarChart3,
  Smartphone,
  Globe,
  Eye,
  Clock,
  Database,
  Lock,
  Star,
  CheckCircle,
  ArrowRight,
  Crown,
  Sparkles
} from 'lucide-react';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'performance' | 'security' | 'ai' | 'analytics' | 'accessibility' | 'mobile';
  status: 'active' | 'beta' | 'coming-soon';
  impact: 'high' | 'medium' | 'low';
  benefits: string[];
}

export const PremiumFeatures: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'ultra-performance',
      name: 'Ultra Performance Engine',
      description: 'Optimisations automatiques avec Web Vitals monitoring 24/7',
      icon: <Zap className="h-6 w-6" />,
      category: 'performance',
      status: 'active',
      impact: 'high',
      benefits: [
        'Chargement 60% plus rapide',
        'Core Web Vitals optimisés',
        'Bundle splitting intelligent',
        'Cache LRU avancé'
      ]
    },
    {
      id: 'enterprise-security',
      name: 'Enterprise Security Suite',
      description: 'Sécurité maximale avec chiffrement bout-en-bout et audit continu',
      icon: <Shield className="h-6 w-6" />,
      category: 'security',
      status: 'active',
      impact: 'high',
      benefits: [
        'Chiffrement AES-256',
        'Audit sécurité automatique',
        '2FA obligatoire',
        'Scanner vulnérabilités'
      ]
    },
    {
      id: 'ai-assistant',
      name: 'Assistant IA Médical',
      description: 'IA spécialisée en médecine avec analyse prédictive',
      icon: <Brain className="h-6 w-6" />,
      category: 'ai',
      status: 'beta',
      impact: 'high',
      benefits: [
        'Diagnostic assisté',
        'Analyse prédictive',
        'Recommandations personnalisées',
        'Apprentissage continu'
      ]
    },
    {
      id: 'real-time-analytics',
      name: 'Analytics Temps Réel',
      description: 'Tableaux de bord avancés avec KPI médicaux en temps réel',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'analytics',
      status: 'active',
      impact: 'high',
      benefits: [
        'Métriques temps réel',
        'Rapports automatisés',
        'Alertes intelligentes',
        'Export multi-format'
      ]
    },
    {
      id: 'universal-accessibility',
      name: 'Accessibilité Universelle',
      description: 'Conformité WCAG 2.1 AAA avec support multi-handicaps',
      icon: <Eye className="h-6 w-6" />,
      category: 'accessibility',
      status: 'active',
      impact: 'high',
      benefits: [
        'WCAG 2.1 AAA compliant',
        'Support lecteurs d\'écran',
        'Navigation vocale',
        'Contraste adaptatif'
      ]
    },
    {
      id: 'native-mobile',
      name: 'App Mobile Native',
      description: 'Application native iOS/Android avec synchronisation complète',
      icon: <Smartphone className="h-6 w-6" />,
      category: 'mobile',
      status: 'coming-soon',
      impact: 'medium',
      benefits: [
        'App native iOS/Android',
        'Mode hors ligne',
        'Notifications push',
        'Synchronisation cloud'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes', icon: <Star className="h-4 w-4" /> },
    { id: 'performance', name: 'Performance', icon: <Zap className="h-4 w-4" /> },
    { id: 'security', name: 'Sécurité', icon: <Shield className="h-4 w-4" /> },
    { id: 'ai', name: 'Intelligence IA', icon: <Brain className="h-4 w-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'accessibility', name: 'Accessibilité', icon: <Eye className="h-4 w-4" /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone className="h-4 w-4" /> }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? premiumFeatures 
    : premiumFeatures.filter(feature => feature.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'beta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'beta': return 'Bêta';
      case 'coming-soon': return 'Bientôt';
      default: return 'Inconnu';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-white font-medium">
          <Crown className="h-5 w-5" />
          MED-MNG Premium Features
          <Sparkles className="h-5 w-5" />
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Fonctionnalités Premium
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez toutes les fonctionnalités avancées qui font de MED-MNG 
          la plateforme médicale la plus puissante du marché.
        </p>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Grille des fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(feature.status)}>
                    {getStatusText(feature.status)}
                  </Badge>
                  <Badge variant="outline" className={getImpactColor(feature.impact)}>
                    Impact {feature.impact}
                  </Badge>
                </div>
              </div>
              
              <div>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {feature.description}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Avantages clés:</h4>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {feature.status === 'active' && (
                  <Button className="w-full group-hover:bg-primary/90" size="sm">
                    Utiliser maintenant
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                )}
                
                {feature.status === 'beta' && (
                  <Button variant="outline" className="w-full" size="sm">
                    Rejoindre la bêta
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                )}
                
                {feature.status === 'coming-soon' && (
                  <Button variant="ghost" className="w-full" size="sm" disabled>
                    Bientôt disponible
                    <Clock className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
            
            {/* Gradient overlay pour l'effet premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* Stats Premium */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Garanti</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-muted-foreground">Support Premium</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600">AAA</div>
              <div className="text-sm text-muted-foreground">Accessibilité WCAG</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Premium */}
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Offre Limitée Premium
            </div>
            
            <h2 className="text-2xl font-bold">
              Prêt à transformer votre pratique médicale ?
            </h2>
            
            <p className="text-white/90 max-w-md mx-auto">
              Rejoignez les milliers de professionnels qui utilisent déjà 
              MED-MNG Premium pour optimiser leur travail quotidien.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" className="text-primary">
                Essai gratuit 30 jours
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Voir les tarifs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};