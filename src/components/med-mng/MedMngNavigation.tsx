import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { Brain, Flame, Heart, ListMusic, Music, Star, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * Barre de section « Mon espace » des pages /med-mng/* (bibliothèque,
 * progression, favoris, profil).
 *
 * CONSTAT (audit 04.10.2026) : cette barre reproduisait une seconde en-tête
 * complète sous l'en-tête du site — deuxième logo « Med MNG », deuxième
 * « Accueil », déconnexion en double — et son bouton « Bibliothèque » menait à
 * la bibliothèque des items alors que « Ma bibliothèque » désigne les chansons.
 * Elle devient une barre de section, comme « Avancer sur l'EDN » : un titre et
 * les liens propres à l'espace personnel (l'accueil, les items EDN, le compte
 * et la déconnexion restent dans l'en-tête du site).
 */
const LIENS = [
  { path: ROUTE_PATHS.medMngMusicLibrary, label: 'Ma bibliothèque', icon: ListMusic },
  { path: ROUTE_PATHS.progressDashboard, label: 'Progression', icon: Brain },
  { path: ROUTE_PATHS.medMngFavorites, label: 'Favoris', icon: Heart },
  { path: ROUTE_PATHS.medMngProfile, label: 'Profil', icon: User },
] as const;

export const MedMngNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);

  const estActif = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/80" aria-label="Mon espace">
      <div className="container mx-auto flex flex-col gap-2 px-3 py-2 sm:px-4 md:flex-row md:items-center md:justify-between lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary" aria-hidden="true">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground sm:text-lg">Mon espace</span>
          {gamificationStats && (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Badge variant="outline" className="gap-1 py-1 border-warning/30 bg-warning/5" title="Jours de suite">
                <Flame className="h-3 w-3 text-warning" aria-hidden="true" />
                {gamificationStats.currentStreak}
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 border-primary/30 bg-primary/5" title="Niveau">
                <Star className="h-3 w-3 text-primary" aria-hidden="true" />
                Nv.{gamificationStats.level}
              </Badge>
            </div>
          )}
        </div>

        <ul className="-mx-1 flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {LIENS.map(({ path, label, icon: Icone }) => {
            const actif = estActif(path);
            return (
              <li key={path} className="shrink-0">
                <Link
                  to={path}
                  aria-current={actif ? 'page' : undefined}
                  onClick={() =>
                    logActivity({
                      activity_type: 'study',
                      count: 1,
                      metadata: { component: 'navigation', action: 'click', destination: label },
                    })
                  }
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    actif ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icone className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
