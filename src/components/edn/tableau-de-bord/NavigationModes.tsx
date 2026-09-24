import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ROUTE_PATHS } from '@/config/routes';
import { useIAQuota } from '@/hooks/useIAQuota';
import {
  BarChart3,
  Brain,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Gamepad2,
  History,
  Info,
  Layers,
  Library,
  Music,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Onglets internes de /edn-complete. */
export type OngletEdn = 'items' | 'revision' | 'music' | 'subscription';

interface Entree {
  libelle: string;
  description?: string;
  icon: LucideIcon;
  /** Route à ouvrir, ou onglet interne à afficher. */
  route?: string;
  onglet?: OngletEdn;
}

interface Groupe {
  id: string;
  libelle: string;
  icon: LucideIcon;
  entrees: Entree[];
}

// Toutes les entrées existantes sont conservées, avec les mêmes routes :
// seul leur regroupement change.
const GROUPES: Groupe[] = [
  {
    id: 'reviser',
    libelle: 'Réviser',
    icon: Brain,
    entrees: [
      { libelle: 'Répétition espacée', description: 'Vos révisions prévues', icon: Brain, route: ROUTE_PATHS.srsReview },
      { libelle: 'Flashcards', icon: Layers, route: ROUTE_PATHS.flashcards },
      { libelle: 'Écouter les chansons', icon: Music, onglet: 'music' },
    ],
  },
  {
    id: 'entrainer',
    libelle: "S'entraîner",
    icon: Target,
    entrees: [
      { libelle: 'Examen blanc', icon: Target, route: ROUTE_PATHS.examMode },
      { libelle: 'Cas cliniques', icon: Gamepad2, route: ROUTE_PATHS.clinicalCases },
    ],
  },
  {
    id: 'suivi',
    libelle: 'Mon suivi',
    icon: BarChart3,
    entrees: [
      { libelle: 'Progression et statistiques', icon: BarChart3, route: ROUTE_PATHS.progressDashboard },
      { libelle: 'Plan et historique de révision', icon: History, onglet: 'revision' },
      { libelle: 'Abonnement et crédits', icon: CreditCard, onglet: 'subscription' },
    ],
  },
];

interface NavigationModesProps {
  onglet: OngletEdn;
  onOnglet: (onglet: OngletEdn) => void;
}

export function NavigationModes({ onglet, onOnglet }: NavigationModesProps) {
  const navigate = useNavigate();

  const ouvrir = (e: Entree) => {
    if (e.route) navigate(e.route);
    else if (e.onglet) onOnglet(e.onglet);
  };

  const groupeActif = (g: Groupe) => g.entrees.some((e) => e.onglet && e.onglet === onglet);

  return (
    <nav aria-label="Modes de révision" className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant={onglet === 'items' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-2.5"
        aria-current={onglet === 'items' ? 'page' : undefined}
        onClick={() => onOnglet('items')}
      >
        <Library className="h-4 w-4" aria-hidden="true" />
        Items
      </Button>

      {GROUPES.map((g) => {
        const Icon = g.icon;
        const actif = groupeActif(g);
        return (
          <DropdownMenu key={g.id}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant={actif ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 gap-1.5 px-2.5"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {g.libelle}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              {g.entrees.map((e) => {
                const EIcon = e.icon;
                return (
                  <DropdownMenuItem key={e.libelle} onSelect={() => ouvrir(e)} className="gap-2 py-2">
                    <EIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span>{e.libelle}</span>
                      {e.description && <span className="text-xs text-muted-foreground">{e.description}</span>}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2.5"
        onClick={() => navigate(ROUTE_PATHS.smartStudyPlanner)}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Planning IA
      </Button>
    </nav>
  );
}

/**
 * Solde de crédits IA, affiché seulement s'il vient réellement du serveur
 * (compte connecté) : le « 80 » par défaut du hook n'est jamais montré.
 */
export function CreditsIA({ connecte }: { connecte: boolean }) {
  const { quota, quotaServeur } = useIAQuota();
  if (!connecte || !quotaServeur) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-foreground">{quota}</strong> crédits IA restants
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="À quoi servent les crédits IA ?">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 text-sm">
          <p className="font-medium">Crédits IA</p>
          <p className="mt-1 text-muted-foreground">
            Ils sont décomptés lorsque vous utilisez une fonction qui fait appel à l'IA ou au service musical
            (par exemple la génération d'une chanson ou d'un QCM IA). Consulter les fiches officielles et réviser
            vos items n'en consomme pas.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
