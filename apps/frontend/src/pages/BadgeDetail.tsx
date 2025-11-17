import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Calendar, Target } from 'lucide-react';
import { getRarityBgColor, getRarityTextColor, getRarityBorderColor } from '@/utils/rarity';

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

  return (
    <>
      <Helmet>
        <title>{badge.name} | Badge | Med-Mng</title>
        <meta name="description" content={badge.description} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <nav aria-label="Navigation des badges">
            <Link to={ROUTE_PATHS.badges}>
              <Button variant="ghost" className="mb-4" aria-label="Retourner à la collection de badges">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Retour aux Badges
              </Button>
            </Link>
          </nav>

          <main role="main" aria-labelledby="badge-name">
            <Card
              className={`mb-6 ${getRarityBorderColor(badge.rarity)} border-2`}
              role="region"
              aria-labelledby="badge-name"
            >
              <CardHeader className="text-center pb-6">
                <div
                  className="text-8xl mb-4"
                  role="img"
                  aria-label={badge.unlocked ? `Badge ${badge.name} représenté par ${badge.icon}` : 'Badge verrouillé'}
                >
                  {badge.unlocked ? badge.icon : '🔒'}
                </div>
                <Badge
                  className={`${getRarityBgColor(badge.rarity)} ${getRarityTextColor(badge.rarity)} mb-4`}
                  aria-label={`Rareté: ${badge.rarity}`}
                >
                  {badge.rarity.toUpperCase()}
                </Badge>
                <CardTitle className="text-3xl mb-2" id="badge-name">
                  {badge.name}
                </CardTitle>
                <p className="text-gray-600 text-lg" id="badge-description">
                  {badge.description}
                </p>
                {badge.unlocked && (
                  <div
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full"
                    role="status"
                    aria-label={`Badge débloqué le ${badge.unlockedAt}`}
                  >
                    <Trophy className="w-4 h-4" aria-hidden="true" />
                    Débloqué le {badge.unlockedAt}
                  </div>
                )}
              </CardHeader>
            </Card>

            <section
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
              role="region"
              aria-labelledby="badge-stats-heading"
            >
              <h2 id="badge-stats-heading" className="sr-only">
                Statistiques du badge
              </h2>

              <Card role="article" aria-labelledby="progress-stat">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-600" id="progress-stat">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold text-blue-600 mb-2"
                    aria-label={`Progression: ${badge.progress} sur ${badge.requirement}`}
                  >
                    {badge.progress} / {badge.requirement}
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={badge.progress}
                    aria-valuemin={0}
                    aria-valuemax={badge.requirement}
                    aria-label={`Progression du badge: ${Math.round((badge.progress / badge.requirement) * 100)}%`}
                  >
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                      aria-hidden="true"
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card role="article" aria-labelledby="owners-stat">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-600" id="owners-stat">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    Propriétaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold text-purple-600 mb-1"
                    aria-label={`${badge.owners} propriétaires`}
                  >
                    {badge.owners}
                  </div>
                  <div className="text-sm text-gray-500" aria-label={`Représente ${((badge.owners / badge.totalUsers) * 100).toFixed(1)} pourcent des utilisateurs`}>
                    {((badge.owners / badge.totalUsers) * 100).toFixed(1)}% des utilisateurs
                  </div>
                </CardContent>
              </Card>

              <Card role="article" aria-labelledby="rarity-stat">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-600" id="rarity-stat">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Rareté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${getRarityTextColor(badge.rarity)} mb-1 capitalize`}
                    aria-label={`Rareté: ${badge.rarity}`}
                  >
                    {badge.rarity}
                  </div>
                  <div className="text-sm text-gray-500">Badge légendaire</div>
                </CardContent>
              </Card>
            </section>

            <Card role="region" aria-labelledby="how-to-obtain-title">
              <CardHeader>
                <CardTitle id="how-to-obtain-title">Comment l'obtenir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700" id="requirements-intro">
                  Pour débloquer ce badge, vous devez :
                </p>
                <ul
                  className="list-disc list-inside space-y-2 text-gray-600"
                  role="list"
                  aria-labelledby="requirements-intro"
                >
                  <li role="listitem">
                    Vous connecter à la plateforme chaque jour pendant 100 jours consécutifs
                  </li>
                  <li role="listitem">
                    Compléter au moins une activité par jour (challenge, session, journal, etc.)
                  </li>
                  <li role="listitem">
                    Ne manquer aucun jour, sinon la série repart à zéro
                  </li>
                </ul>
                <div
                  className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  role="note"
                  aria-label="Conseil pour obtenir ce badge"
                >
                  <p className="text-sm text-blue-900">
                    <span role="img" aria-label="Ampoule">💡</span>
                    <strong>Conseil :</strong> Activez les rappels quotidiens dans vos paramètres
                    pour ne jamais manquer un jour !
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}
