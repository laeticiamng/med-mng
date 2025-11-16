import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Clock, Users, BookOpen, Target, Award, Calendar } from 'lucide-react';

export default function Tutorials() {
  const tutorialCategories = [
    {
      title: 'Premiers Pas',
      icon: BookOpen,
      color: 'blue',
      tutorials: [
        {
          title: 'Guide de démarrage rapide',
          description: 'Découvrez les fonctionnalités essentielles en 5 minutes',
          duration: '5 min',
          views: 2850,
          difficulty: 'Débutant',
        },
        {
          title: 'Personnaliser votre profil',
          description: 'Créez un profil attractif et complet',
          duration: '8 min',
          views: 1920,
          difficulty: 'Débutant',
        },
        {
          title: 'Navigation dans l\'interface',
          description: 'Maîtrisez tous les menus et raccourcis',
          duration: '10 min',
          views: 1650,
          difficulty: 'Débutant',
        },
      ],
    },
    {
      title: 'Productivité',
      icon: Target,
      color: 'purple',
      tutorials: [
        {
          title: 'Utiliser le journal quotidien',
          description: 'Techniques pour tenir un journal efficace',
          duration: '12 min',
          views: 3200,
          difficulty: 'Intermédiaire',
        },
        {
          title: 'Sessions de focus optimales',
          description: 'Maximisez votre concentration avec la technique Pomodoro',
          duration: '15 min',
          views: 2780,
          difficulty: 'Intermédiaire',
        },
        {
          title: 'Planifier vos sessions d\'étude',
          description: 'Créez un planning d\'étude efficace',
          duration: '18 min',
          views: 2340,
          difficulty: 'Intermédiaire',
        },
      ],
    },
    {
      title: 'Gamification',
      icon: Award,
      color: 'green',
      tutorials: [
        {
          title: 'Système de challenges',
          description: 'Comprendre et réussir les challenges quotidiens',
          duration: '10 min',
          views: 4100,
          difficulty: 'Débutant',
        },
        {
          title: 'Grimper dans le leaderboard',
          description: 'Stratégies pour atteindre le top 10',
          duration: '14 min',
          views: 3650,
          difficulty: 'Avancé',
        },
        {
          title: 'Débloquer badges et auras',
          description: 'Guide complet des récompenses disponibles',
          duration: '20 min',
          views: 3980,
          difficulty: 'Intermédiaire',
        },
        {
          title: 'Quêtes et ambitions',
          description: 'Créez et accomplissez vos objectifs à long terme',
          duration: '16 min',
          views: 2560,
          difficulty: 'Avancé',
        },
      ],
    },
    {
      title: 'Communauté',
      icon: Users,
      color: 'orange',
      tutorials: [
        {
          title: 'Créer et partager du contenu',
          description: 'Rédiger des posts engageants pour la communauté',
          duration: '11 min',
          views: 1840,
          difficulty: 'Intermédiaire',
        },
        {
          title: 'Rejoindre une équipe',
          description: 'Collaborez avec d\'autres utilisateurs',
          duration: '9 min',
          views: 1560,
          difficulty: 'Débutant',
        },
        {
          title: 'Suivre et être suivi',
          description: 'Construire votre réseau sur la plateforme',
          duration: '7 min',
          views: 1320,
          difficulty: 'Débutant',
        },
      ],
    },
    {
      title: 'Bien-être',
      icon: Calendar,
      color: 'pink',
      tutorials: [
        {
          title: 'Méditation guidée',
          description: 'Débuter la méditation avec nos sessions',
          duration: '15 min',
          views: 2940,
          difficulty: 'Débutant',
        },
        {
          title: 'Créer des rituels quotidiens',
          description: 'Construire des habitudes saines et durables',
          duration: '13 min',
          views: 2180,
          difficulty: 'Intermédiaire',
        },
        {
          title: 'Suivre votre streak de bien-être',
          description: 'Maintenir votre motivation jour après jour',
          duration: '8 min',
          views: 1890,
          difficulty: 'Débutant',
        },
      ],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return 'bg-green-100 text-green-700';
      case 'Intermédiaire':
        return 'bg-yellow-100 text-yellow-700';
      case 'Avancé':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, { text: string; bg: string; border: string }> = {
      blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
      green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      pink: { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <Helmet>
        <title>Tutoriels & Guides | Med-Mng</title>
        <meta name="description" content="Apprenez à maîtriser Med-Mng avec nos tutoriels vidéo et guides détaillés" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.help}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Centre d'Aide
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tutoriels & Guides
            </h1>
            <p className="text-lg text-gray-600">
              Apprenez à maîtriser toutes les fonctionnalités de Med-Mng
            </p>
          </div>

          {/* Tutorial Categories */}
          <div className="space-y-8">
            {tutorialCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              const colors = getCategoryColor(category.color);

              return (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg} ${colors.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                    <Badge variant="secondary">{category.tutorials.length} tutoriels</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tutorials.map((tutorial, index) => (
                      <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-2 ${colors.border} hover:-translate-y-1`}>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              {tutorial.difficulty}
                            </Badge>
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} ${colors.text}`}>
                              <Play className="w-6 h-6" />
                            </div>
                          </div>
                          <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {tutorial.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {tutorial.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {tutorial.views.toLocaleString()} vues
                            </div>
                          </div>
                          <Button className="w-full" variant="outline">
                            <Play className="w-4 h-4 mr-2" />
                            Voir le tutoriel
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Card */}
          <Card className="mt-12 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">45+</div>
                  <div className="text-gray-600">Tutoriels disponibles</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">10h</div>
                  <div className="text-gray-600">De contenu vidéo</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">Vues totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
