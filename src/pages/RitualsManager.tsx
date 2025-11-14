import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Sparkles, Clock, Calendar, TrendingUp } from 'lucide-react';

export default function RitualsManager() {
  const rituals = [
    { id: 1, name: 'Méditation matinale', time: '07:00', duration: '10 min', streak: 45, active: true, icon: '🧘' },
    { id: 2, name: 'Journal gratitude', time: '21:00', duration: '5 min', streak: 38, active: true, icon: '📝' },
    { id: 3, name: 'Lecture inspirante', time: '22:00', duration: '20 min', streak: 28, active: true, icon: '📚' },
    { id: 4, name: 'Étirements', time: '07:30', duration: '5 min', streak: 21, active: true, icon: '🧘‍♀️' },
    { id: 5, name: 'Hydratation', time: '08:00', duration: '1 min', streak: 67, active: true, icon: '💧' },
    { id: 6, name: 'Marche en nature', time: '18:00', duration: '30 min', streak: 15, active: false, icon: '🚶' },
  ];

  return (
    <>
      <Helmet>
        <title>Mes Rituels | Med-Mng</title>
        <meta name="description" content="Gérez vos habitudes et rituels quotidiens" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={ROUTE_PATHS.wellness}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Bien-être
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Rituels</h1>
              <p className="text-lg text-gray-600">Construisez des habitudes saines et durables</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Rituel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Rituels Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600 mb-1">5</div>
                <div className="text-gray-600 text-sm">sur 6 rituels</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Temps Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 mb-1">71</div>
                <div className="text-gray-600 text-sm">minutes/jour</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Taux de Réussite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-1">92%</div>
                <div className="text-gray-600 text-sm">cette semaine</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Liste des Rituels
              </CardTitle>
              <CardDescription>Activez ou désactivez vos rituels quotidiens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rituals.map((ritual) => (
                  <Link key={ritual.id} to={ROUTE_PATHS.ritualDetail.replace(':ritualId', ritual.id.toString())}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-4xl">{ritual.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900">{ritual.name}</h3>
                                {ritual.active && <Badge variant="secondary">Actif</Badge>}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {ritual.time} · {ritual.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-orange-600" />
                                  {ritual.streak} jours de suite
                                </span>
                              </div>
                            </div>
                          </div>
                          <Switch checked={ritual.active} onClick={(e) => e.preventDefault()} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
