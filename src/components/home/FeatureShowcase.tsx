import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, BookOpen, Users, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumElement, PremiumButton } from '@/components/global/PremiumThemeProvider';
import { PremiumCard } from '@/components/ui/premium-card';

const FeatureShowcase: React.FC = () => {
  const features = [
    {
      icon: Music,
      title: 'IA Musicale',
      description: 'Créez des musiques pédagogiques avec notre IA avancée',
      color: 'from-purple-500 to-pink-500',
      path: '/med-mng/create'
    },
    {
      icon: BookOpen,
      title: 'Items EDN',
      description: '367 items avec contenus immersifs et interactifs',
      color: 'from-blue-500 to-cyan-500',
      path: '/edn'
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Échangez avec 15,000+ étudiants et professionnels',
      color: 'from-green-500 to-emerald-500',
      path: '/community'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Suivez votre progression avec des métriques détaillées',
      color: 'from-amber-500 to-orange-500',
      path: '/analytics'
    }
  ];

  return (
    <section className="medical-section bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="medical-container">
        <PremiumElement className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Fonctionnalités Révolutionnaires
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Excellence Médicale Réinventée
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre écosystème complet d'apprentissage médical avec IA avancée
          </p>
        </PremiumElement>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <PremiumElement
              key={index}
              className="group"
              enableParallax={true}
              parallaxStrength={2}
            >
              <PremiumCard variant="elevated" className="h-full group">
                <Link to={feature.path} className="block h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                    <div>
                      <motion.div 
                        className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                    </div>
                    <PremiumButton variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      Explorer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </PremiumButton>
                  </CardContent>
                </Link>
              </PremiumCard>
            </PremiumElement>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(FeatureShowcase);