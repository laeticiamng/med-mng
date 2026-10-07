import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BADGE_DEFINITIONS, useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Award, Flame, RefreshCw } from 'lucide-react';
import React, { useEffect } from 'react';

/**
 * CONSTAT (audit du 07.10.2026, MM-A10) : ce panneau affichait
 *  - un onglet « Classement » : la requête user_activity_log tous comptes
 *    confondus ne renvoie que les lignes du compte (RLS propriétaire), et à
 *    défaut un classement fictif (« Marie D. 3 240 XP », « Jean M. »…) ;
 *  - des « Défis quotidiens » et « Succès » dont les récompenses (+100 XP,
 *    « Badge Rare + 200 XP », « Titre Spécial ») n'étaient attribuées nulle part
 *    et dont la progression était calculée au hasard (activités / 20) ;
 *  - 25 badges dont 6 impossibles à obtenir (assistant IA retiré, partage,
 *    publications, week-ends, cas cliniques notés).
 * Il ne montre plus que le niveau réel et les badges atteignables
 * (BADGE_DEFINITIONS, filtrée dans useGamification).
 */

const getLevelTitle = (level: number): string => {
  if (level < 5) return 'Débutant';
  if (level < 10) return 'Apprenti';
  if (level < 20) return 'Étudiant';
  if (level < 30) return 'Avancé';
  if (level < 50) return 'Expert';
  return 'Maître';
};

const couleurRarete: Record<string, string> = {
  common: 'bg-muted',
  rare: 'bg-primary/10',
  epic: 'bg-accent',
  legendary: 'bg-warning/10',
};

export const GamificationPanel: React.FC = () => {
  const { stats, loading, loadStats } = useGamification();

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) void loadStats(user.id);
    });
  }, [loadStats]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" aria-hidden="true" />
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const niveau = stats?.level || 1;
  const xp = stats?.totalPoints || 0;
  const xpRestant = stats?.xpToNextLevel ?? 0;
  const obtenus = new Set((stats?.badges ?? []).map((b) => b.id));
  const nbObtenus = BADGE_DEFINITIONS.filter((b) => obtenus.has(b.id)).length;

  return (
    <div className="space-y-6">
      {/* Niveau et XP */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Flame className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Niveau {niveau}</h2>
                <p className="text-primary font-medium">{getLevelTitle(niveau)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Total</p>
              <p className="text-xl font-bold text-foreground">{xp.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-muted-foreground">Série : {stats?.currentStreak || 0} jour(s) de suite</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression vers le niveau {niveau + 1}</span>
              <span>{xp}/{xp + xpRestant} XP</span>
            </div>
            <Progress value={xp + xpRestant > 0 ? (xp / (xp + xpRestant)) * 100 : 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Badges atteignables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" aria-hidden="true" />
            Badges ({nbObtenus}/{BADGE_DEFINITIONS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGE_DEFINITIONS.map((badge) => {
              const obtenu = obtenus.has(badge.id);
              return (
                <li
                  key={badge.id}
                  className={`p-4 border rounded-lg text-center ${obtenu ? 'bg-card shadow-sm' : 'bg-muted opacity-60'}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl ${couleurRarete[badge.rarity] ?? 'bg-muted'}`}
                    aria-hidden="true"
                  >
                    {badge.icon}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <Badge variant={obtenu ? 'secondary' : 'outline'} className="text-xs">
                    {obtenu ? 'Obtenu' : 'À débloquer'}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
