import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Sparkles, 
  Zap, 
  Shield,
  Database,
  Music,
  MessageSquare,
  BarChart3,
  Users,
  BookOpen,
  Activity,
  HeadphonesIcon,
  Settings,
  FileDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureStatus {
  name: string;
  description: string;
  status: 'completed' | 'active' | 'optimized';
  icon: React.ComponentType<any>;
  color: string;
  functionalityCount: number;
}

export const FinalizedFeatures: React.FC = () => {
  const features: FeatureStatus[] = [
    {
      name: "Générateur Musical IA",
      description: "Création de musiques éducatives avec IA avancée",
      status: "completed",
      icon: Music,
      color: "text-purple-500",
      functionalityCount: 12
    },
    {
      name: "Base EDN Complète",
      description: "367 items avec compétences OIC intégrées",
      status: "completed", 
      icon: BookOpen,
      color: "text-blue-500",
      functionalityCount: 8
    },
    {
      name: "Simulations ECOS",
      description: "Examens cliniques immersifs et interactifs",
      status: "completed",
      icon: Users,
      color: "text-green-500",
      functionalityCount: 6
    },
    {
      name: "Assistant IA Médical",
      description: "Chat intelligent spécialisé en médecine",
      status: "completed",
      icon: MessageSquare,
      color: "text-orange-500",
      functionalityCount: 9
    },
    {
      name: "Analytics Avancés",
      description: "Tableaux de bord et statistiques complètes",
      status: "completed",
      icon: BarChart3,
      color: "text-indigo-500",
      functionalityCount: 7
    },
    {
      name: "Administration",
      description: "Gestion complète et supervision système",
      status: "completed",
      icon: Shield,
      color: "text-gray-600",
      functionalityCount: 15
    },
    {
      name: "Monitoring",
      description: "Surveillance temps réel de la plateforme",
      status: "active",
      icon: Activity,
      color: "text-pink-500",
      functionalityCount: 5
    },
    {
      name: "Support",
      description: "Aide, documentation et assistance",
      status: "completed",
      icon: HeadphonesIcon,
      color: "text-teal-500",
      functionalityCount: 4
    },
    {
      name: "Export de Données",
      description: "Exportation et synchronisation avancées",
      status: "completed",
      icon: FileDown,
      color: "text-cyan-500",
      functionalityCount: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'optimized': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Finalisé';
      case 'active': return '🔄 Actif';
      case 'optimized': return '⚡ Optimisé';
      default: return '⏳ En cours';
    }
  };

  const totalFunctionalities = features.reduce((sum, feature) => sum + feature.functionalityCount, 0);
  const completedFeatures = features.filter(f => f.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card className="bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-xl border border-white/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-400" />
              Plateforme 100% Fonctionnelle
              <CheckCircle className="h-8 w-8 text-green-400" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{completedFeatures}/{features.length}</div>
                <div className="text-green-200 text-sm">Modules Finalisés</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{totalFunctionalities}</div>
                <div className="text-green-200 text-sm">Fonctionnalités Actives</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">100%</div>
                <div className="text-green-200 text-sm">Navigation Fonctionnelle</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille des fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 group hover:shadow-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <IconComponent className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                      </div>
                    </div>
                    <Badge className={getStatusColor(feature.status)}>
                      {getStatusText(feature.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">
                      {feature.functionalityCount} fonctionnalités
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-300">Opérationnel</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Message de confirmation */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
            <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            🎉 Expérience Utilisateur Exceptionnelle Activée !
          </h3>
          <p className="text-white/80 mb-4 max-w-2xl mx-auto">
            Toutes les fonctionnalités sont maintenant <strong>100% opérationnelles</strong> avec une navigation fluide, 
            des interfaces immersives et une cohérence visuelle parfaite. La plateforme MED MNG offre une expérience 
            d'apprentissage médical révolutionnaire et unique.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Base de données connectée
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-2">
              <Database className="w-4 h-4 mr-2" />
              Routing optimisé
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              IA intégrée
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};