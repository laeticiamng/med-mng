import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Users, 
  BookOpen, 
  Music, 
  BarChart3, 
  Brain, 
  Target, 
  Award, 
  Zap,
  ArrowRight,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlatformOverview() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'edn',
      title: 'Items EDN Immersifs',
      description: 'Contenus pédagogiques interactifs avec scènes immersives',
      icon: BookOpen,
      path: '/edn',
      completionRate: 95,
      isPopular: true,
      features: ['367 Items IC', 'Scènes immersives', 'Génération musicale', 'Quiz adaptatifs']
    },
    {
      id: 'music-studio',
      title: 'Studio Musical MED-MNG',
      description: 'Créez des musiques pédagogiques personnalisées',
      icon: Music,
      path: '/med-mng/create',
      completionRate: 88,
      features: ['IA Suno', 'Paroles médicales', 'Styles multiples', 'Export HD']
    },
    {
      id: 'analytics',
      title: 'Analytics Avancées',
      description: 'Analyses détaillées de vos performances',
      icon: BarChart3,
      path: '/analytics',
      completionRate: 92,
      features: ['Métriques temps réel', 'Prédictions IA', 'Rapports PDF']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Plateforme MED-MNG
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Une écosystème complet d'apprentissage médical avec IA, musique pédagogique, 
            contenus immersifs et analytics avancées.
          </p>
          <Button size="lg" onClick={() => navigate('/edn')} className="group">
            Commencer l'apprentissage
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <module.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    {module.isPopular && (
                      <Badge>Populaire</Badge>
                    )}
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                  <Progress value={module.completionRate} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" onClick={() => navigate(module.path)}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Accéder au module
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}