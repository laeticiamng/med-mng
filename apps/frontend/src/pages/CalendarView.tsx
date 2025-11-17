import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

/**
 * CalendarView - Vue calendrier pour planification d'étude
 * TODO: Implémenter intégration calendrier complète avec événements, deadlines, et sessions
 */
export default function CalendarView() {
  const navigate = useNavigate();

  // Données d'exemple pour la roadmap
  const upcomingFeatures = [
    {
      title: 'Planification de sessions d\'étude',
      description: 'Créer et gérer vos sessions d\'étude quotidiennes',
      priority: 'high',
      icon: Clock,
    },
    {
      title: 'Suivi des objectifs',
      description: 'Définir et suivre vos objectifs d\'apprentissage',
      priority: 'high',
      icon: Target,
    },
    {
      title: 'Analyse de progression',
      description: 'Visualiser votre progression au fil du temps',
      priority: 'medium',
      icon: TrendingUp,
    },
    {
      title: 'Rappels et notifications',
      description: 'Recevoir des rappels pour vos sessions planifiées',
      priority: 'medium',
      icon: Calendar,
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      high: { variant: 'destructive', label: 'Haute priorité' },
      medium: { variant: 'secondary', label: 'Priorité moyenne' },
      low: { variant: 'outline', label: 'Priorité basse' },
    };
    return variants[priority] || variants.low;
  };

  return (
    <>
      <Helmet>
        <title>Calendrier - Bientôt disponible | Med-Mng</title>
        <meta name="description" content="La fonctionnalité calendrier arrive bientôt pour vous aider à organiser vos sessions d'étude" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header avec navigation */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-4 mb-2">
              <Calendar className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Calendrier</h1>
                <p className="text-gray-600 mt-1">Organisez votre apprentissage</p>
              </div>
            </div>
          </div>

          {/* Message principal */}
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calendar className="h-6 w-6" />
                Fonctionnalité en développement
              </CardTitle>
              <CardDescription className="text-blue-700">
                Nous travaillons actuellement sur une expérience calendrier complète pour vous aider
                à organiser vos sessions d'étude et atteindre vos objectifs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/dashboard')}>
                  Accéder au tableau de bord
                </Button>
                <Button variant="outline" onClick={() => navigate('/edn-complete')}>
                  Commencer à étudier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités à venir */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités prévues</CardTitle>
              <CardDescription>
                Voici ce qui sera disponible dans le calendrier Med-Mng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingFeatures.map((feature, index) => {
                const Icon = feature.icon;
                const badge = getPriorityBadge(feature.priority);

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Timeline estimée */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Timeline de développement</CardTitle>
              <CardDescription>Estimation de disponibilité des fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">Q1 2025</div>
                  <div className="flex-1 p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-900 font-medium">Version initiale du calendrier</p>
                    <p className="text-xs text-green-700 mt-1">Planification de base et affichage des sessions</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">Q2 2025</div>
                  <div className="flex-1 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">Fonctionnalités avancées</p>
                    <p className="text-xs text-blue-700 mt-1">Rappels, notifications et intégration avec challenges</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">Q3 2025</div>
                  <div className="flex-1 p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-sm text-purple-900 font-medium">Analyse et insights</p>
                    <p className="text-xs text-purple-700 mt-1">Statistiques de productivité et recommandations IA</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer d'information */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              💡 Astuce: En attendant, utilisez le{' '}
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:underline font-medium"
              >
                tableau de bord
              </button>
              {' '}pour suivre votre progression quotidienne.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
