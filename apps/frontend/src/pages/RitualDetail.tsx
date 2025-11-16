import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Clock, Calendar, Flame, TrendingUp } from 'lucide-react';

export default function RitualDetail() {
  const { ritualId } = useParams<{ ritualId: string }>();

  const ritual = {
    id: ritualId,
    name: 'Méditation matinale',
    icon: '🧘',
    description: 'Session de méditation guidée pour commencer la journée en pleine conscience',
    time: '07:00',
    duration: '10 min',
    streak: 45,
    totalDays: 120,
    active: true,
    category: 'Mindfulness',
    reminderEnabled: true,
  };

  const weekHistory = [true, true, true, true, true, false, true];
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const stats = [
    { label: 'Série Actuelle', value: ritual.streak, unit: 'jours', icon: Flame, color: 'text-orange-600' },
    { label: 'Total Complété', value: ritual.totalDays, unit: 'fois', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Taux Réussite', value: '92', unit: '%', icon: TrendingUp, color: 'text-blue-600' },
  ];

  return (
    <>
      <Helmet>
        <title>{ritual.name} | Med-Mng</title>
        <meta name="description" content={ritual.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.wellnessRituals}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Rituels
            </Button>
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{ritual.icon}</div>
                  <div>
                    <CardTitle className="text-3xl mb-2">{ritual.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{ritual.category}</Badge>
                      {ritual.active && <Badge variant="secondary">Actif</Badge>}
                    </div>
                    <p className="text-gray-600">{ritual.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {ritual.time}
                </span>
                <span>·</span>
                <span>{ritual.duration}</span>
                <span>·</span>
                <span>Rappel {ritual.reminderEnabled ? 'activé' : 'désactivé'}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}<span className="text-lg text-gray-500 ml-1">{stat.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Cette Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{day}</div>
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                        weekHistory[index]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {weekHistory[index] ? '✓' : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
