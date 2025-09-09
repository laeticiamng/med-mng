import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  Target, 
  BarChart3,
  Sparkles,
  PlayCircle,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Feature {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  status: 'active' | 'new' | 'premium';
  popularity: number;
  category: string;
}

export const FeatureShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'edn-immersive',
      title: 'Items EDN Immersifs',
      description: 'Explorez les 367 items EDN avec contenus interactifs et scènes immersives',
      path: '/edn',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      status: 'active',
      popularity: 95,
      category: 'Éducation'
    },
    {
      id: 'music-studio',
      title: 'Studio Musical IA',
      description: 'Créez des musiques pédagogiques personnalisées avec intelligence artificielle',
      path: '/med-mng/create',
      icon: Music,
      color: 'from-purple-500 to-purple-600',
      status: 'active',
      popularity: 92,
      category: 'Création'
    },
    {
      id: 'ai-assistant',
      title: 'Assistant IA Médical',
      description: 'Posez vos questions à notre assistant spécialisé en médecine',
      path: '/chat',
      icon: Brain,
      color: 'from-green-500 to-green-600',
      status: 'premium',
      popularity: 88,
      category: 'Intelligence IA'
    },
    {
      id: 'ecos-simulator',
      title: 'Simulateur ECOS',
      description: 'Entraînez-vous avec des simulations d\'examens cliniques réalistes',
      path: '/ecos',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      status: 'active',
      popularity: 85,
      category: 'Simulation'
    },
    {
      id: 'community',
      title: 'Communauté Étudiante',
      description: 'Échangez avec d\'autres étudiants et partagez vos connaissances',
      path: '/community',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      status: 'active',
      popularity: 79,
      category: 'Social'
    },
    {
      id: 'analytics',
      title: 'Analytics Avancées',
      description: 'Analysez vos performances et suivez votre progression détaillée',
      path: '/analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      status: 'new',
      popularity: 87,
      category: 'Analyse'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'premium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    navigate(feature.path);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Fonctionnalités Principales</h2>
        </motion.div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez les outils innovants qui révolutionnent l'apprentissage médical
        </p>
      </div>

      {/* Grille de fonctionnalités */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setHoveredFeature(feature.id)}
            onHoverEnd={() => setHoveredFeature(null)}
          >
            <Card 
              className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
              onClick={() => handleFeatureClick(feature)}
            >
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <Badge className={getStatusColor(feature.status)}>
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Popularity indicator */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{feature.popularity}%</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="text-base mb-4 group-hover:text-foreground transition-colors">
                  {feature.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {feature.category}
                  </Badge>
                  
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ 
                      x: hoveredFeature === feature.id ? 0 : -10,
                      opacity: hoveredFeature === feature.id ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">
              Prêt à explorer toutes ces fonctionnalités ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Commencez votre parcours d'apprentissage médical révolutionnaire dès maintenant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/quickstart')} size="lg">
                <PlayCircle className="h-4 w-4 mr-2" />
                Guide de démarrage
              </Button>
              <Button onClick={() => navigate('/platform-complete')} variant="outline" size="lg">
                Toutes les fonctionnalités
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};