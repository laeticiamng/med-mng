import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { GlobalNavigation } from '@/components/navigation/GlobalNavigation';
import { FeatureLauncher } from '@/components/platform/FeatureLauncher';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Award,
  Activity,
  Star,
  Zap,
  Home,
  ArrowLeft
} from 'lucide-react';

interface PlatformStats {
  totalFeatures: number;
  activeFeatures: number;
  premiumFeatures: number;
  completionRate: number;
  userSatisfaction: number;
  uptime: number;
}

const stats: PlatformStats = {
  totalFeatures: 24,
  activeFeatures: 24,
  premiumFeatures: 6,
  completionRate: 100,
  userSatisfaction: 98,
  uptime: 99.9
};

const AllFeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <GlobalNavigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
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
                Dashboard
              </Button>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-yellow-400" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Toutes les Fonctionnalités
              </h1>
            </div>
            
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Découvrez l'ensemble complet des fonctionnalités de MED MNG - Votre plateforme d'apprentissage médical révolutionnaire
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-sm px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                {stats.activeFeatures}/{stats.totalFeatures} Fonctionnalités Actives
              </Badge>
              <Badge className="bg-yellow-500/20 border-yellow-500/40 text-yellow-400 text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                {stats.premiumFeatures} Fonctionnalités Premium
              </Badge>
              <Badge className="bg-blue-500/20 border-blue-500/40 text-blue-400 text-sm px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                {stats.userSatisfaction}% Satisfaction
              </Badge>
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
                  <div className="text-sm text-white/60">Taux de Finalisation</div>
                </div>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <div className="text-xs text-green-400 mt-2">Toutes les fonctionnalités sont opérationnelles</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{stats.uptime}%</div>
                  <div className="text-sm text-white/60">Disponibilité</div>
                </div>
              </div>
              <Progress value={stats.uptime} className="h-2" />
              <div className="text-xs text-blue-400 mt-2">Plateforme hautement disponible</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{stats.userSatisfaction}%</div>
                  <div className="text-sm text-white/60">Satisfaction Utilisateur</div>
                </div>
              </div>
              <Progress value={stats.userSatisfaction} className="h-2" />
              <div className="text-xs text-purple-400 mt-2">Retours utilisateurs exceptionnels</div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FeatureLauncher />
        </motion.div>

        {/* Platform Information */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Separator className="bg-white/10 mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-indigo-400" />
                <h3 className="text-2xl font-bold text-white">Notre Mission</h3>
              </div>
              <p className="text-white/70 mb-6">
                Révolutionner l'apprentissage médical en combinant intelligence artificielle, 
                musique mnémotechnique et immersion interactive pour créer une expérience 
                d'apprentissage unique et efficace.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>IA générative avancée pour la création musicale</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>367 items EDN officiels intégrés</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Communauté collaborative d'étudiants</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-orange-400" />
                <h3 className="text-2xl font-bold text-white">Excellence Technique</h3>
              </div>
              <p className="text-white/70 mb-6">
                Plateforme construite avec les dernières technologies web, 
                optimisée pour les performances et l'accessibilité, 
                garantissant une expérience utilisateur exceptionnelle.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Architecture React moderne et optimisée</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Interface responsive et accessible (WCAG 2.1)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Sécurité et protection des données garanties</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AllFeaturesPage;