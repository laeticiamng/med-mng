import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedFeaturesGrid } from '@/components/modules/AdvancedFeaturesGrid';
import { CompletionDashboard } from '@/components/modules/CompletionDashboard';
import { 
  Globe, Sparkles, Target, TrendingUp, Activity, Users, 
  BarChart3, Settings, Home, ArrowRight, Zap, Trophy, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UniversalPlatform: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('features');

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe },
    { id: 'core', name: 'Core', icon: Target },
    { id: 'medical', name: 'Médical', icon: Activity },
    { id: 'ai', name: 'IA', icon: Sparkles },
    { id: 'community', name: 'Communauté', icon: Users },
    { id: 'premium', name: 'Premium', icon: Star }
  ];

  const platformStats = [
    { icon: Target, value: '30', label: 'Modules Actifs', color: 'text-blue-400' },
    { icon: Users, value: '10K+', label: 'Utilisateurs', color: 'text-green-400' },
    { icon: TrendingUp, value: '95%', label: 'Satisfaction', color: 'text-yellow-400' },
    { icon: Trophy, value: '24/7', label: 'Disponibilité', color: 'text-purple-400' }
  ];

  return (
    <>
      <Helmet>
        <title>Plateforme Universelle MED-MNG - Écosystème Complet</title>
        <meta name="description" content="Accédez à l'écosystème complet MED-MNG avec tous les modules, fonctionnalités et outils d'apprentissage médical." />
        <meta name="keywords" content="médecine, plateforme, IA, apprentissage, modules, fonctionnalités" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform')}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Vue Plateforme
              </Button>
            </div>

            <div>
              <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
                <Globe className="w-4 h-4 mr-2" />
                Plateforme Universelle
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
                MED-MNG Universe
              </h1>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Explorez l'écosystème complet de MED-MNG : modules avancés, outils IA, 
                analytics en temps réel et communauté active. Tout ce dont vous avez besoin 
                pour révolutionner votre apprentissage médical.
              </p>
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {platformStats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                <TabsTrigger value="features" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fonctionnalités
                </TabsTrigger>
                <TabsTrigger value="completion" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Complétude
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2"
                    >
                      <category.icon className="w-4 h-4" />
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Features Grid */}
                <AdvancedFeaturesGrid selectedCategory={selectedCategory} />
              </TabsContent>

              {/* Completion Tab */}
              <TabsContent value="completion">
                <CompletionDashboard />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Préférences Utilisateur',
                      description: 'Personnaliser votre expérience d\'apprentissage',
                      icon: Settings,
                      action: () => navigate('/settings')
                    },
                    {
                      title: 'Gestion des Données',
                      description: 'Contrôler vos données et votre confidentialité',
                      icon: Activity,
                      action: () => navigate('/privacy')
                    },
                    {
                      title: 'Support & Aide',
                      description: 'Obtenir de l\'aide et contacter le support',
                      icon: Users,
                      action: () => navigate('/help')
                    }
                  ].map((setting, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={setting.action}
                      >
                        <CardHeader className="text-center">
                          <setting.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <CardTitle className="text-lg">{setting.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-center mb-4">
                            {setting.description}
                          </p>
                          <Button className="w-full" variant="outline">
                            Configurer
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Global Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">Prêt à Explorer l'Univers MED-MNG ?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Commencez votre voyage d'apprentissage révolutionnaire avec notre écosystème complet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')} 
                className="gap-2 px-8 py-4 text-lg"
              >
                <Zap className="w-5 h-5" />
                Commencer Maintenant
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/edn')} 
                className="gap-2 px-8 py-4 text-lg"
              >
                <Target className="w-5 h-5" />
                Explorer EDN
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/generator')} 
                className="gap-2 px-8 py-4 text-lg"
              >
                <Sparkles className="w-5 h-5" />
                Créer avec IA
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UniversalPlatform;