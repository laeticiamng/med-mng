import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock } from 'lucide-react';
import { getRarityBgColor, getRarityTextColor } from '@/utils/rarity';

export default function AurasCollection() {
  const auras = [
    { id: 1, name: 'Aura Sérénité', color: 'from-blue-400 to-cyan-300', description: 'Calme et méditation', unlocked: true, equipped: true, rarity: 'rare' },
    { id: 2, name: 'Aura Flamme', color: 'from-orange-500 to-red-400', description: 'Motivation intense', unlocked: true, equipped: false, rarity: 'epic' },
    { id: 3, name: 'Aura Forêt', color: 'from-green-500 to-emerald-400', description: 'Nature et croissance', unlocked: true, equipped: false, rarity: 'rare' },
    { id: 4, name: 'Aura Cosmos', color: 'from-purple-600 to-pink-500', description: 'Mystère et sagesse', unlocked: false, rarity: 'legendary', progress: 75 },
    { id: 5, name: 'Aura Or', color: 'from-yellow-400 to-amber-300', description: 'Excellence et réussite', unlocked: false, rarity: 'legendary', progress: 40 },
    { id: 6, name: 'Aura Arc-en-ciel', color: 'from-red-400 via-yellow-300 to-blue-400', description: 'Diversité et harmonie', unlocked: false, rarity: 'mythic', progress: 12 },
  ];

  const unlockedCount = auras.filter(a => a.unlocked).length;

  return (
    <>
      <Helmet>
        <title>Collection d'Auras | Med-Mng</title>
        <meta name="description" content="Débloquez des auras magiques pour personnaliser votre profil" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="mb-8" role="banner">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-10 h-10 text-purple-300" aria-hidden="true" />
              <h1 className="text-4xl font-bold text-white" id="collection-title">
                Collection d'Auras
              </h1>
            </div>
            <p className="text-lg text-purple-200" id="collection-description">
              Débloquez des auras magiques pour personnaliser votre profil
            </p>
          </header>

          <Card
            className="mb-8 bg-white/10 backdrop-blur border-purple-500/30"
            role="region"
            aria-labelledby="progress-summary"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-3xl font-bold text-white mb-1"
                    id="progress-summary"
                    aria-label={`${unlockedCount} auras débloquées sur ${auras.length}`}
                  >
                    {unlockedCount} / {auras.length}
                  </div>
                  <div className="text-purple-200">Auras débloquées</div>
                </div>
                <div className="text-white text-lg">
                  <span id="equipped-aura-label">Aura équipée:</span>
                  <Badge
                    className="bg-blue-500 text-white ml-2"
                    role="status"
                    aria-labelledby="equipped-aura-label"
                  >
                    Sérénité
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <main
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="main"
            aria-labelledby="collection-title"
          >
            <h2 className="sr-only">Liste des auras disponibles</h2>
            {auras.map((aura) => (
              <Link
                key={aura.id}
                to={ROUTE_PATHS.auraDetail.replace(':auraId', aura.id.toString())}
                aria-label={`Voir les détails de l'aura ${aura.name} - ${aura.unlocked ? 'Débloquée' : `${aura.progress}% complété`}`}
              >
                <Card
                  className={`hover:shadow-2xl transition-all border-2 ${aura.unlocked ? 'border-purple-400' : 'border-gray-600 opacity-70'} bg-white/10 backdrop-blur`}
                  role="article"
                  aria-labelledby={`aura-name-${aura.id}`}
                >
                  <CardHeader className="text-center pb-3">
                    <div
                      className={`w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br ${aura.color} ${aura.unlocked ? '' : 'grayscale'} flex items-center justify-center shadow-lg`}
                      role="img"
                      aria-label={aura.unlocked ? `Aura ${aura.name} débloquée` : `Aura ${aura.name} verrouillée`}
                    >
                      {aura.unlocked ? (
                        <Sparkles className="w-16 h-16 text-white" aria-hidden="true" />
                      ) : (
                        <Lock className="w-16 h-16 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <Badge
                      className={`${getRarityBgColor(aura.rarity)} ${getRarityTextColor(aura.rarity)}`}
                      aria-label={`Rareté: ${aura.rarity}`}
                    >
                      {aura.rarity}
                    </Badge>
                    <CardTitle className="text-lg mt-2 text-white" id={`aura-name-${aura.id}`}>
                      {aura.name}
                    </CardTitle>
                    <CardDescription className="text-purple-200 text-sm">
                      {aura.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aura.unlocked ? (
                      aura.equipped ? (
                        <div className="text-center">
                          <Badge
                            className="bg-green-500 text-white"
                            role="status"
                            aria-label="Cette aura est actuellement équipée"
                          >
                            Équipée
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-purple-200">
                          Cliquez pour équiper
                        </div>
                      )
                    ) : (
                      <div>
                        <div
                          className="w-full bg-gray-700 rounded-full h-2 mb-2"
                          role="progressbar"
                          aria-valuenow={aura.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progression pour débloquer ${aura.name}: ${aura.progress}%`}
                        >
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${aura.progress}%` }}
                            aria-hidden="true"
                          ></div>
                        </div>
                        <div className="text-center text-sm text-purple-200" aria-hidden="true">
                          {aura.progress}% complété
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}
