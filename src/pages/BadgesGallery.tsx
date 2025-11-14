import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function BadgesGallery() {
  const badges = [
    { id: 1, name: 'Premier Pas', icon: '🎯', description: 'Complétez votre premier challenge', unlocked: true, rarity: 'common', date: '2024-01-15' },
    { id: 2, name: '100 Jours', icon: '🔥', description: '100 jours de suite', unlocked: true, rarity: 'legendary', date: '2024-03-20' },
    { id: 3, name: 'Méditateur Zen', icon: '🧘', description: '50 sessions de méditation', unlocked: true, rarity: 'rare', date: '2024-02-10' },
    { id: 4, name: 'Focus Master', icon: '🎓', description: '100h de focus total', unlocked: true, rarity: 'epic', date: '2024-03-05' },
    { id: 5, name: 'Champion', icon: '👑', description: 'Top 1 du leaderboard', unlocked: false, rarity: 'legendary', progress: 85 },
    { id: 6, name: 'Écrivain', icon: '✍️', description: '100 entrées de journal', unlocked: false, rarity: 'rare', progress: 62 },
    { id: 7, name: 'Social', icon: '💬', description: '50 posts publiés', unlocked: false, rarity: 'common', progress: 34 },
    { id: 8, name: 'Collectionneur', icon: '🏆', description: 'Obtenez 50 badges', unlocked: false, rarity: 'epic', progress: 16 },
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700',
      rare: 'bg-blue-100 text-blue-700',
      epic: 'bg-purple-100 text-purple-700',
      legendary: 'bg-yellow-100 text-yellow-700',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <>
      <Helmet><title>Mes Badges | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Collection de Badges</h1>
          </div>
          <p className="text-lg text-gray-600 mb-8">Débloquez des badges en accomplissant des objectifs</p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{unlockedCount} / {badges.length}</div>
                  <div className="text-gray-600">Badges débloqués</div>
                </div>
                <div className="w-32 h-32 rounded-full border-8 border-yellow-500 flex items-center justify-center text-2xl font-bold text-yellow-600">
                  {Math.round((unlockedCount / badges.length) * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <Link key={badge.id} to={ROUTE_PATHS.badgeDetail.replace(':badgeId', badge.id.toString())}>
                <Card className={`hover:shadow-lg transition-all ${badge.unlocked ? '' : 'opacity-60'}`}>
                  <CardHeader className="text-center pb-3">
                    <div className="text-6xl mb-3">{badge.unlocked ? badge.icon : '🔒'}</div>
                    <Badge className={getRarityColor(badge.rarity)}>{badge.rarity}</Badge>
                    <CardTitle className="text-lg mt-2">{badge.name}</CardTitle>
                    <CardDescription className="text-sm">{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {badge.unlocked ? (
                      <div className="text-center text-sm text-gray-500">Débloqué le {badge.date}</div>
                    ) : (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                        </div>
                        <div className="text-center text-sm text-gray-500">{badge.progress}% complété</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
