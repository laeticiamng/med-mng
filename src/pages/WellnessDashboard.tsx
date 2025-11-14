import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Flame, Calendar, Trophy, TrendingUp, Sparkles } from 'lucide-react';

export default function WellnessDashboard() {
  const stats = [
    { label: 'Série Actuelle', value: '45', unit: 'jours', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'Rituals Actifs', value: '8', unit: 'rituels', icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Score Bien-être', value: '87', unit: '/100', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
    { label: 'Jours Total', value: '156', unit: 'jours', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  ];

  return (
    <>
      <Helmet>
        <title>Bien-être | Med-Mng</title>
        <meta name="description" content="Suivez votre bien-être et vos rituels quotidiens" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord Bien-être</h1>
          <p className="text-lg text-gray-600 mb-8">Cultivez vos habitudes saines au quotidien</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="pb-3">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-3xl">
                      {stat.value}<span className="text-base text-gray-500 ml-1">{stat.unit}</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Streak Card */}
            <Link to={ROUTE_PATHS.wellnessStreak}>
              <Card className="hover:shadow-lg transition-all duration-200 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-6 h-6 text-orange-600" />
                      Série de Jours
                    </CardTitle>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <CardDescription>Maintenez votre motivation jour après jour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-6xl font-bold text-orange-600 mb-2">45</div>
                    <div className="text-gray-600">jours consécutifs</div>
                  </div>
                  <Button className="w-full">Voir les détails</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Rituals Card */}
            <Link to={ROUTE_PATHS.wellnessRituals}>
              <Card className="hover:shadow-lg transition-all duration-200 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      Mes Rituels
                    </CardTitle>
                    <Badge variant="secondary">8 actifs</Badge>
                  </div>
                  <CardDescription>Gérez vos habitudes quotidiennes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {['Méditation matinale', 'Journal gratitude', 'Lecture 20 min', 'Étirements'].map((ritual, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                        <span className="text-sm text-gray-700">{ritual}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">Gérer les rituels</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
