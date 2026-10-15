import { TranslatedText } from '@/components/TranslatedText';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { usePublierHauteur, VAR_BARRE_MOBILE } from '@/hooks/usePublierHauteur';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { User as UtilisateurSupabase } from '@supabase/supabase-js';
import { BookOpen, CreditCard, Flame, Home, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  /** Page courante (`page`), section qui contient la page courante (`true`) ou autre (rien). */
  current?: 'page' | 'true';
}

/** Lien de la barre : un vrai lien (clic droit, nouvel onglet, historique), jamais un onglet. */
const BottomNavItem: React.FC<BottomNavItemProps> = ({
  icon,
  label,
  to,
  current,
}) => {
  const isActive = Boolean(current);
  return (
    <Link
      to={to}
      aria-current={current}
      className={cn(
        'relative flex flex-col items-center justify-center p-2 transition-all duration-200 min-h-[64px] flex-1',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:scale-95',
        isActive
          ? 'text-primary bg-primary/5'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <div
        className={cn(
          'transition-all duration-200 mb-1',
          isActive && 'transform scale-110'
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-xs font-medium transition-all duration-200',
          isActive && 'font-semibold'
        )}
      >
        <TranslatedText text={label} />
      </span>
      {isActive && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
        />
      )}
    </Link>
  );
};

/**
 * Barre de navigation basse des mobiles (< md). Montée par `MedMngLayout` et, depuis le
 * 15.10.2026, par les pages d'entrée EDN (`/edn-complete`, fiches d'item) via App.tsx.
 *
 * Elle publie sa hauteur (`--barre-mobile-h`) : le mini-lecteur se pose au-dessus d'elle et
 * l'application réserve la place en bas de page (voir `usePublierHauteur`).
 */
export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { stats } = useGamification();
  const [user, setUser] = useState<UtilisateurSupabase | null>(null);
  const navRef = useRef<HTMLElement>(null);
  usePublierHauteur(navRef, VAR_BARRE_MOBILE);

  useEffect(() => {
    // Affichage seulement : session locale, sans requête réseau (auth/v1/user).
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data?.session?.user ?? null));
  }, []);

  const isActive = (path: string) =>
    path === ROUTE_PATHS.home
      ? location.pathname === path
      : location.pathname.startsWith(path);
  const current = (path: string): BottomNavItemProps['current'] =>
    location.pathname === path ? 'page' : isActive(path) ? 'true' : undefined;

  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Accueil',
      path: ROUTE_PATHS.home,
    },
    // Entrées cœur : l'ancien « Créer » / « Bibliothèque » menait à un catalogue vide.
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Items',
      path: ROUTE_PATHS.ednComplete,
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Tarifs',
      path: ROUTE_PATHS.medMngPricing,
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Profil',
      path: ROUTE_PATHS.medMngProfile,
    },
  ];

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card border-t border-border shadow-lg"
      aria-label="Navigation principale mobile"
    >
      {/* Mini gamification stats bar */}
      {user && stats && (
        <div className="flex items-center justify-center gap-4 py-1 bg-muted/50 border-b border-border text-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-medium">{stats.currentStreak}</span>
              </TooltipTrigger>
              <TooltipContent>Jours de suite</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">Niv. {stats.level}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary font-medium">
            {stats.totalPoints} XP
          </span>
        </div>
      )}

      <ul className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <li key={item.path} className="flex flex-1">
            <BottomNavItem
              icon={item.icon}
              label={item.label}
              to={item.path}
              current={current(item.path)}
            />
          </li>
        ))}
      </ul>

      {/* Safe area padding for iPhone with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </nav>
  );
};
