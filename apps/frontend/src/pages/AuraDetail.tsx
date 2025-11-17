import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, Target, Trophy } from 'lucide-react';
import { getRarityBgColor, getRarityTextColor } from '@/utils/rarity';

export default function AuraDetail() {
  const { auraId } = useParams<{ auraId: string }>();

  const aura = {
    id: auraId,
    name: 'Aura Sérénité',
    color: 'from-blue-400 to-cyan-300',
    description: 'Une aura apaisante qui reflète votre maîtrise de la méditation et de la pleine conscience',
    rarity: 'rare',
    unlocked: true,
    equipped: true,
    progress: 100,
    requirement: 100,
    owners: 1840,
    totalUsers: 15420,
  };

  return (
    <>
      <Helmet>
        <title>{aura.name} | Aura | Med-Mng</title>
        <meta name="description" content={aura.description} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <nav aria-label="Navigation des auras">
            <Link to={ROUTE_PATHS.auras}>
              <Button
                variant="ghost"
                className="mb-4 text-white hover:bg-white/10"
                aria-label="Retourner à la collection d'auras"
              >
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Retour aux Auras
              </Button>
            </Link>
          </nav>

          <main role="main" aria-labelledby="aura-name">
            <Card className="mb-6 bg-white/10 backdrop-blur border-purple-400" role="region" aria-labelledby="aura-name">
              <CardHeader className="text-center pb-6">
                <div
                  className={`w-48 h-48 rounded-full mx-auto mb-6 bg-gradient-to-br ${aura.color} flex items-center justify-center shadow-2xl`}
                  role="img"
                  aria-label={`Visualisation de l'aura ${aura.name} avec un dégradé ${aura.color.replace('from-', '').replace('to-', ' vers ')}`}
                >
                  <Sparkles className="w-24 h-24 text-white" aria-hidden="true" />
                </div>
                <Badge
                  className={`${getRarityBgColor(aura.rarity)} ${getRarityTextColor(aura.rarity)} mb-4`}
                  aria-label={`Rareté: ${aura.rarity}`}
                >
                  {aura.rarity.toUpperCase()}
                </Badge>
                <CardTitle className="text-4xl mb-2 text-white" id="aura-name">
                  {aura.name}
                </CardTitle>
                <p className="text-purple-200 text-lg" id="aura-description">
                  {aura.description}
                </p>
                {aura.unlocked && (
                  <div className="mt-6 space-x-3">
                    {aura.equipped ? (
                      <Badge
                        className="bg-green-500 text-white text-base px-4 py-2"
                        role="status"
                        aria-label="Cette aura est actuellement équipée"
                      >
                        <Trophy className="w-4 h-4 mr-2 inline" aria-hidden="true" />
                        Actuellement équipée
                      </Badge>
                    ) : (
                      <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700"
                        aria-label={`Équiper l'aura ${aura.name}`}
                      >
                        Équiper cette aura
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
            </Card>

            <section
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
              role="region"
              aria-labelledby="aura-stats-heading"
            >
              <h2 id="aura-stats-heading" className="sr-only">
                Statistiques de l'aura
              </h2>

              <Card
                className="bg-white/10 backdrop-blur border-purple-400/30"
                role="article"
                aria-labelledby="progress-stat"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-purple-200" id="progress-stat">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold text-blue-400 mb-2"
                    aria-label={`Progression: ${aura.progress} sur ${aura.requirement}`}
                  >
                    {aura.progress} / {aura.requirement}
                  </div>
                  <div
                    className="w-full bg-gray-700 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={aura.progress}
                    aria-valuemin={0}
                    aria-valuemax={aura.requirement}
                    aria-label={`Progression de l'aura: ${Math.round((aura.progress / aura.requirement) * 100)}%`}
                  >
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(aura.progress / aura.requirement) * 100}%` }}
                      aria-hidden="true"
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-white/10 backdrop-blur border-purple-400/30"
                role="article"
                aria-labelledby="owners-stat"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-purple-200" id="owners-stat">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    Propriétaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold text-purple-400 mb-1"
                    aria-label={`${aura.owners} propriétaires`}
                  >
                    {aura.owners}
                  </div>
                  <div className="text-sm text-purple-300" aria-label={`Représente ${((aura.owners / aura.totalUsers) * 100).toFixed(1)} pourcent des joueurs`}>
                    {((aura.owners / aura.totalUsers) * 100).toFixed(1)}% des joueurs
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-white/10 backdrop-blur border-purple-400/30"
                role="article"
                aria-labelledby="rarity-stat"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-purple-200" id="rarity-stat">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Rareté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold text-blue-400 mb-1 capitalize"
                    aria-label={`Rareté: ${aura.rarity}`}
                  >
                    {aura.rarity}
                  </div>
                  <div className="text-sm text-purple-300">Aura rare</div>
                </CardContent>
              </Card>
            </section>

            <Card
              className="bg-white/10 backdrop-blur border-purple-400/30"
              role="region"
              aria-labelledby="how-to-obtain-title"
            >
              <CardHeader>
                <CardTitle className="text-white" id="how-to-obtain-title">
                  Comment l'obtenir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-purple-200" id="requirements-intro">
                  Pour débloquer cette aura, vous devez :
                </p>
                <ul
                  className="list-disc list-inside space-y-2 text-purple-300"
                  role="list"
                  aria-labelledby="requirements-intro"
                >
                  <li role="listitem">Compléter 50 sessions de méditation</li>
                  <li role="listitem">Maintenir une série de 30 jours consécutifs</li>
                  <li role="listitem">Atteindre le niveau 10 en Pleine Conscience</li>
                </ul>
                <div
                  className="mt-6 p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg"
                  role="note"
                  aria-label="Effet spécial de l'aura"
                >
                  <p className="text-sm text-purple-100">
                    <Sparkles className="w-4 h-4 inline mr-2" aria-hidden="true" />
                    <strong>Effet spécial :</strong> Cette aura vous donne +10% XP sur toutes
                    les activités liées à la méditation et au bien-être.
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
