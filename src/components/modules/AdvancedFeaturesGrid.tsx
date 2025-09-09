import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Music, BookOpen, Users, BarChart3, Heart, Shield, Zap, 
  Target, Trophy, PlayCircle, CheckCircle, ArrowRight, Sparkles,
  TrendingUp, Activity, Settings, HelpCircle, Search, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  category: 'core' | 'medical' | 'ai' | 'community' | 'premium';
  status: 'active' | 'beta' | 'new' | 'coming-soon';
  completion: number;
  highlights: string[];
  bgGradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    id: 'edn-immersive',
    title: 'Items EDN Immersifs',
    description: 'Expérience d\'apprentissage révolutionnaire avec scènes 3D et contenus interactifs',
    icon: BookOpen,
    path: '/edn',
    category: 'medical',
    status: 'active',
    completion: 100,
    highlights: ['367 Items', 'Scènes 3D', 'Quiz Adaptatifs', 'Progression Intelligente'],
    bgGradient: 'from-blue-500/10 to-cyan-600/10',
    iconColor: 'text-blue-400'
  },
  {
    id: 'ai-music-generator',
    title: 'Générateur Musical IA',
    description: 'Créez des musiques pédagogiques personnalisées avec l\'IA Suno avancée',
    icon: Music,
    path: '/generator',
    category: 'ai',
    status: 'active',
    completion: 95,
    highlights: ['IA Suno', 'Paroles Médicales', 'Export HD', 'Styles Multiples'],
    bgGradient: 'from-purple-500/10 to-pink-600/10',
    iconColor: 'text-purple-400'
  },
  {
    id: 'medical-assistant',
    title: 'Assistant Médical IA',
    description: 'Chat intelligent spécialisé avec base de connaissances médicales complète',
    icon: Brain,
    path: '/chat',
    category: 'ai',
    status: 'beta',
    completion: 85,
    highlights: ['Chat Médical', 'Diagnostic Aide', 'Références', 'Multi-langue'],
    bgGradient: 'from-green-500/10 to-emerald-600/10',
    iconColor: 'text-green-400'
  },
  {
    id: 'analytics-suite',
    title: 'Suite Analytics Pro',
    description: 'Analyses avancées avec prédictions IA et insights personnalisés',
    icon: BarChart3,
    path: '/analytics',
    category: 'premium',
    status: 'active',
    completion: 92,
    highlights: ['Prédictions IA', 'Rapports PDF', 'Métriques Temps Réel', 'Insights'],
    bgGradient: 'from-orange-500/10 to-red-600/10',
    iconColor: 'text-orange-400'
  },
  {
    id: 'community-hub',
    title: 'Hub Communautaire',
    description: 'Espace collaboratif avec forums, mentorat et événements',
    icon: Users,
    path: '/community',
    category: 'community',
    status: 'active',
    completion: 88,
    highlights: ['Forums Actifs', 'Mentorat', 'Événements', 'Partage'],
    bgGradient: 'from-teal-500/10 to-blue-600/10',
    iconColor: 'text-teal-400'
  },
  {
    id: 'meditation-center',
    title: 'Centre de Méditation',
    description: 'Séances guidées pour la gestion du stress et la concentration',
    icon: Heart,
    path: '/meditation',
    category: 'premium',
    status: 'new',
    completion: 75,
    highlights: ['Séances Guidées', 'Relaxation', 'Focus', 'Bien-être'],
    bgGradient: 'from-pink-500/10 to-rose-600/10',
    iconColor: 'text-pink-400'
  },
  {
    id: 'security-monitor',
    title: 'Moniteur Sécurité',
    description: 'Surveillance avancée et protection des données personnelles',
    icon: Shield,
    path: '/system-health',
    category: 'core',
    status: 'active',
    completion: 100,
    highlights: ['Chiffrement', 'Audit', 'Conformité', 'Protection'],
    bgGradient: 'from-yellow-500/10 to-amber-600/10',
    iconColor: 'text-yellow-400'
  },
  {
    id: 'performance-optimizer',
    title: 'Optimiseur Performance',
    description: 'Système intelligent d\'optimisation des performances d\'apprentissage',
    icon: Zap,
    path: '/monitoring',
    category: 'premium',
    status: 'beta',
    completion: 80,
    highlights: ['Optimisation IA', 'Vitesse', 'Efficacité', 'Suivi'],
    bgGradient: 'from-indigo-500/10 to-purple-600/10',
    iconColor: 'text-indigo-400'
  }
];

interface AdvancedFeaturesGridProps {
  selectedCategory?: string;
  showOnlyActive?: boolean;
}

export const AdvancedFeaturesGrid: React.FC<AdvancedFeaturesGridProps> = ({
  selectedCategory = 'all',
  showOnlyActive = false
}) => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const filteredFeatures = features.filter(feature => {
    if (showOnlyActive && feature.status !== 'active') return false;
    if (selectedCategory === 'all') return true;
    return feature.category === selectedCategory;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'active': 'bg-green-500/10 text-green-400 border-green-500/20',
      'beta': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'new': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'coming-soon': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return styles[status as keyof typeof styles] || styles['active'];
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      'core': 'bg-slate-500/10 text-slate-400',
      'medical': 'bg-blue-500/10 text-blue-400',
      'ai': 'bg-purple-500/10 text-purple-400',
      'community': 'bg-green-500/10 text-green-400',
      'premium': 'bg-orange-500/10 text-orange-400'
    };
    return styles[category as keyof typeof styles] || styles['core'];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {filteredFeatures.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onHoverStart={() => setHoveredFeature(feature.id)}
          onHoverEnd={() => setHoveredFeature(null)}
          className="h-full"
        >
          <Card 
            className={cn(
              "h-full transition-all duration-300 cursor-pointer group border-0 shadow-lg",
              "bg-gradient-to-br", feature.bgGradient,
              hoveredFeature === feature.id && "shadow-2xl"
            )}
            onClick={() => navigate(feature.path)}
          >
            <CardHeader className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-sm flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className={cn("w-7 h-7", feature.iconColor)} />
                </motion.div>
                <div className="flex flex-col gap-2">
                  <Badge className={cn("text-xs", getStatusBadge(feature.status))}>
                    {feature.status}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-xs", getCategoryBadge(feature.category))}>
                    {feature.category}
                  </Badge>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Complétude</span>
                  <span className="font-semibold">{feature.completion}%</span>
                </div>
                <Progress 
                  value={feature.completion} 
                  className="h-2 bg-background/30"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Points forts</h4>
                <div className="grid grid-cols-2 gap-1">
                  {feature.highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-background/30 backdrop-blur-sm border-0"
                      >
                        {highlight}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  variant="outline"
                  disabled={feature.status === 'coming-soon'}
                >
                  {feature.status === 'coming-soon' ? (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Bientôt disponible
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Découvrir
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Empty State */}
      {filteredFeatures.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full text-center py-12"
        >
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Aucune fonctionnalité trouvée</h3>
          <p className="text-muted-foreground">
            Essayez de changer les filtres ou explorez toutes les catégories
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedFeaturesGrid;