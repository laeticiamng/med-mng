import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, Target, Trophy } from 'lucide-react';

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

  const getRarityColor = (rarity: string) => {
    const colors = {
      rare: { bg: 'bg-blue-100', text: 'text-blue-700' },
      epic: { bg: 'bg-purple-100', text: 'text-purple-700' },
      legendary: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      mythic: { bg: 'bg-pink-100', text: 'text-pink-700' },
    };
    return colors[rarity as keyof typeof colors] || colors.rare;
  };

  const colors = getRarityColor(aura.rarity);

  return (
    <>
      <Helmet><title>{aura.name} | Aura | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.auras}>
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Auras
            </Button>
          </Link>

          <Card className="mb-6 bg-white/10 backdrop-blur border-purple-400">
            <CardHeader className="text-center pb-6">
              <div className={`w-48 h-48 rounded-full mx-auto mb-6 bg-gradient-to-br ${aura.color} flex items-center justify-center shadow-2xl`}>
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <Badge className={`${colors.bg} ${colors.text} mb-4`}>{aura.rarity.toUpperCase()}</Badge>
              <CardTitle className="text-4xl mb-2 text-white">{aura.name}</CardTitle>
              <p className="text-purple-200 text-lg">{aura.description}</p>
              {aura.unlocked && (
                <div className="mt-6 space-x-3">
                  {aura.equipped ? (
                    <Badge className="bg-green-500 text-white text-base px-4 py-2">
                      <Trophy className="w-4 h-4 mr-2 inline" />
                      Actuellement équipée
                    </Badge>
                  ) : (
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                      Équiper cette aura
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white/10 backdrop-blur border-purple-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-purple-200">
                  <Target className="w-4 h-4" />
                  Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {aura.progress} / {aura.requirement}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(aura.progress / aura.requirement) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-purple-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-purple-200">
                  <Users className="w-4 h-4" />
                  Propriétaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400 mb-1">{aura.owners}</div>
                <div className="text-sm text-purple-300">
                  {((aura.owners / aura.totalUsers) * 100).toFixed(1)}% des joueurs
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-purple-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-purple-200">
                  <Sparkles className="w-4 h-4" />
                  Rareté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400 mb-1 capitalize">
                  {aura.rarity}
                </div>
                <div className="text-sm text-purple-300">Aura rare</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-white">Comment l'obtenir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-purple-200">Pour débloquer cette aura, vous devez :</p>
              <ul className="list-disc list-inside space-y-2 text-purple-300">
                <li>Compléter 50 sessions de méditation</li>
                <li>Maintenir une série de 30 jours consécutifs</li>
                <li>Atteindre le niveau 10 en Pleine Conscience</li>
              </ul>
              <div className="mt-6 p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                <p className="text-sm text-purple-100">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  <strong>Effet spécial :</strong> Cette aura vous donne +10% XP sur toutes
                  les activités liées à la méditation et au bien-être.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
