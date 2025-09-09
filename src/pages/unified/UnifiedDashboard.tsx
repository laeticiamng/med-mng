import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Music, Users, Star, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Temps d\'étude', value: '124h', icon: Clock, color: 'text-blue-500' },
    { label: 'Items EDN', value: '189', icon: BookOpen, color: 'text-green-500' },
    { label: 'Musiques créées', value: '24', icon: Music, color: 'text-purple-500' },
    { label: 'XP Total', value: '8,945', icon: Star, color: 'text-amber-500' }
  ];

  const quickActions = [
    { title: 'Créer Musique', path: '/med-mng/create', icon: Music, color: 'from-purple-500 to-pink-500' },
    { title: 'Explorer EDN', path: '/edn', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { title: 'Communauté', path: '/community', icon: Users, color: 'from-green-500 to-emerald-500' },
    { title: 'Analytics', path: '/analytics', icon: TrendingUp, color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - MED-MNG</title>
        <meta name="description" content="Tableau de bord MED-MNG - Suivez votre progression et accédez à tous vos outils d'apprentissage médical." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="container mx-auto p-6 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold">Tableau de Bord</h1>
            <p className="text-muted-foreground">Bienvenue sur votre espace personnel MED-MNG</p>
          </motion.div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progression Générale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Items EDN', current: 189, total: 367 },
                    { label: 'Musiques créées', current: 24, total: 50 },
                    { label: 'Modules complétés', current: 12, total: 20 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.current}/{item.total}</span>
                      </div>
                      <Progress value={(item.current / item.total) * 100} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => navigate(action.path)}
                      >
                        <div className={`p-2 rounded-full bg-gradient-to-br ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(UnifiedDashboard);