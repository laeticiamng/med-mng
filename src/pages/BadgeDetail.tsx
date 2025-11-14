import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Calendar, Target } from 'lucide-react';

export default function BadgeDetail() {
  const { badgeId } = useParams<{ badgeId: string }>();

  const badge = {
    id: badgeId,
    name: '100 Jours',
    icon: '🔥',
    description: 'Maintenez une série de 100 jours consécutifs d\'activité sur la plateforme',
    rarity: 'legendary',
    unlocked: true,
    unlockedAt: '2024-03-20',
    progress: 100,
    requirement: 100,
    owners: 248,
    totalUsers: 15420,
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
      rare: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      epic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      legendary: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const colors = getRarityColor(badge.rarity);

  return (
    <>
      <Helmet><title>{badge.name} | Badge | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.badges}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Badges
            </Button>
          </Link>

          <Card className={`mb-6 ${colors.border} border-2`}>
            <CardHeader className="text-center pb-6">
              <div className="text-8xl mb-4">{badge.unlocked ? badge.icon : '🔒'}</div>
              <Badge className={`${colors.bg} ${colors.text} mb-4`}>{badge.rarity.toUpperCase()}</Badge>
              <CardTitle className="text-3xl mb-2">{badge.name}</CardTitle>
              <p className="text-gray-600 text-lg">{badge.description}</p>
              {badge.unlocked && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  <Trophy className="w-4 h-4" />
                  Débloqué le {badge.unlockedAt}
                </div>
              )}
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {badge.progress} / {badge.requirement}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  Propriétaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">{badge.owners}</div>
                <div className="text-sm text-gray-500">
                  {((badge.owners / badge.totalUsers) * 100).toFixed(1)}% des utilisateurs
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Rareté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${colors.text} mb-1 capitalize`}>
                  {badge.rarity}
                </div>
                <div className="text-sm text-gray-500">Badge légendaire</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comment l'obtenir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">Pour débloquer ce badge, vous devez :</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Vous connecter à la plateforme chaque jour pendant 100 jours consécutifs</li>
                <li>Compléter au moins une activité par jour (challenge, session, journal, etc.)</li>
                <li>Ne manquer aucun jour, sinon la série repart à zéro</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <strong>Conseil :</strong> Activez les rappels quotidiens dans vos paramètres
                  pour ne jamais manquer un jour !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
