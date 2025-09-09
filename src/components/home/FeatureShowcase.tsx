import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, BookOpen, Users, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <motion.div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Fonctionnalités Révolutionnaires
          </Badge>
          <h2 className="text-4xl font-bold mb-6">Excellence Médicale Réinventée</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre écosystème complet d'apprentissage médical avec IA avancée
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                <Link to={feature.path} className="block h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                    <div>
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Explorer
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(FeatureShowcase);