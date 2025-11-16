import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, ArrowLeft, Calendar, Trophy, TrendingUp } from 'lucide-react';

export default function WellnessStreak() {
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const streakHistory = Array.from({ length: 49 }, (_, i) => ({
    day: i + 1,
    completed: Math.random() > 0.2,
  }));

  return (
    <>
      <Helmet>
        <title>Série de Jours | Med-Mng</title>
        <meta name="description" content="Maintenez votre motivation avec votre série quotidienne" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={ROUTE_PATHS.wellness}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Bien-être
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Série de Jours</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Flame className="w-6 h-6 text-orange-600" />
                  Série Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-orange-600 mb-1">45</div>
                <div className="text-orange-900">jours consécutifs</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Record Personnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-yellow-600 mb-1">87</div>
                <div className="text-gray-600">jours maximum</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-green-600 mb-1">156</div>
                <div className="text-gray-600">jours au total</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Historique des 7 Dernières Semaines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center text-xs text-gray-500 font-medium">{day}</div>
                ))}
                {streakHistory.map((entry) => (
                  <div
                    key={entry.day}
                    className={`aspect-square rounded ${
                      entry.completed
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    } transition-colors cursor-pointer`}
                    title={entry.completed ? `Jour ${entry.day} ✓` : `Jour ${entry.day} ✗`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span>Complété</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-200"></div>
                  <span>Manqué</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <h3 className="font-semibold text-gray-900 mb-2">Prochaine récompense</h3>
              <p className="text-gray-600 mb-4">Plus que 5 jours pour atteindre 50 jours et débloquer le badge "Champion 50"!</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
