import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MasterNavigationHub } from '@/components/platform/MasterNavigationHub';
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
  PlayCircle,
  ArrowLeft,
  Home
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header avec navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour Accueil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard Principal
              </Button>
            </div>
            
            <Badge className="bg-green-500/20 border-green-500/40 text-green-400">
              Navigation Master Activée
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-6">
              Plateforme MED-MNG
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Écosystème complet d'apprentissage médical avec IA, musique pédagogique, 
              contenus immersifs et analytics avancées. Toutes les fonctionnalités en un seul endroit.
            </p>
          </div>
        </motion.div>

        {/* Hub de navigation principal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MasterNavigationHub />
        </motion.div>

        {/* Stats de la plateforme */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">367</div>
              <div className="text-white/60">Items EDN</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">24</div>
              <div className="text-white/60">Fonctionnalités</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-white/60">Fonctionnel</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">AI</div>
              <div className="text-white/60">Powered</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}