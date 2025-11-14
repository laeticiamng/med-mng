import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_PATHS } from '@/config/routes';

/**
 * Interface pour un item du breadcrumb
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * Mapping des routes vers des labels lisibles
 */
const ROUTE_LABELS: Record<string, string> = {
  [ROUTE_PATHS.home]: 'Accueil',
  [ROUTE_PATHS.ednComplete]: 'EDN Items',
  [ROUTE_PATHS.ecosIndex]: 'ECOS Scénarios',
  [ROUTE_PATHS.dashboard]: 'Dashboard',
  [ROUTE_PATHS.learningDashboard]: 'Learning Analytics',
  [ROUTE_PATHS.audit]: 'Audit',
  [ROUTE_PATHS.store]: 'Boutique',
  [ROUTE_PATHS.community]: 'Communauté',
  [ROUTE_PATHS.studyPlanner]: 'Planificateur',
  [ROUTE_PATHS.chat]: 'Chat IA',
  [ROUTE_PATHS.generator]: 'Générateur',
  [ROUTE_PATHS.settings]: 'Paramètres',
  [ROUTE_PATHS.adminIndex]: 'Administration',
  [ROUTE_PATHS.medMngLibrary]: 'Ma Bibliothèque',
  [ROUTE_PATHS.medMngLogin]: 'Connexion',
  [ROUTE_PATHS.designSystem]: 'Design System',
  [ROUTE_PATHS.statistics]: 'Statistiques',
  [ROUTE_PATHS.achievements]: 'Achievements',
};

/**
 * Hook pour générer les breadcrumbs basés sur la route actuelle
 */
const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();

  return useMemo(() => {
    const pathname = location.pathname;

    // Toujours commencer par Accueil
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', href: ROUTE_PATHS.home }
    ];

    // Trouver la route correspondante et ajouter un label
    const matchedRoute = Object.entries(ROUTE_LABELS).find(([path]) => {
      // Match exact
      if (path === pathname) return true;
      // Match avec paramètres (ex: /edn-complete/:slug)
      if (path.includes(':') && pathname.startsWith(path.split(':')[0])) return true;
      return false;
    });

    if (matchedRoute && matchedRoute[0] !== ROUTE_PATHS.home) {
      // Extraire un sous-label si c'est une page avec param
      const [path, label] = matchedRoute;

      // Ajouter un item parent si c'est une route avec paramètres
      if (path.includes(':') && pathname !== path) {
        const parentLabel = label.split('/')[0]; // Ex: "EDN Items" de "EDN Items / Detail"
        items.push({ label: parentLabel, href: path.split(':')[0] });

        // Extraire le paramètre pour le sous-item
        const param = pathname.split('/').pop();
        if (param && param !== '') {
          items.push({
            label: decodeURIComponent(param),
            current: true
          });
        }
      } else {
        items.push({ label, current: true });
      }
    }

    return items;
  }, [location.pathname]);
};

/**
 * Props pour le composant Breadcrumb
 */
interface BreadcrumbProps {
  /**
   * Items personnalisés (override auto-generation)
   */
  items?: BreadcrumbItem[];

  /**
   * Séparateur personnalisé
   * @default ChevronRight icon
   */
  separator?: React.ReactNode;

  /**
   * Nombre maximal d'items à afficher avant collapse
   * @default undefined (show all)
   */
  maxItems?: number;

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Classe pour chaque item
   */
  itemClassName?: string;

  /**
   * Classe pour les liens
   */
  linkClassName?: string;

  /**
   * Classe pour l'item courant
   */
  currentClassName?: string;
}

/**
 * Composant Breadcrumb Navigation
 *
 * Affiche un chemin de navigation hiérarchique.
 * Génère automatiquement le chemin basé sur la route actuelle.
 *
 * @example
 * // Auto-generated breadcrumbs
 * <Breadcrumb />
 *
 * @example
 * // Custom breadcrumbs
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Products', href: '/products' },
 *   { label: 'Item Detail', current: true }
 * ]} />
 */
export const Breadcrumb = React.forwardRef<HTMLNav, BreadcrumbProps>(
  (
    {
      items: customItems,
      separator = <ChevronRight className="w-4 h-4 opacity-50" />,
      maxItems,
      className,
      itemClassName,
      linkClassName,
      currentClassName,
    },
    ref
  ) => {
    const autoItems = useBreadcrumbs();
    const items = customItems || autoItems;

    // Collapse items si maxItems est défini
    let displayItems = items;
    if (maxItems && items.length > maxItems) {
      displayItems = [
        items[0], // Toujours afficher le premier
        { label: '...', disabled: true }, // Ellipsis
        ...items.slice(-(maxItems - 1)), // Les derniers items
      ];
    }

    // Ne pas afficher le breadcrumb sur la page d'accueil si c'est l'item unique
    if (items.length === 1 && items[0].href === ROUTE_PATHS.home) {
      return null;
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm',
          'bg-background/50 border-b border-border/50',
          'overflow-x-auto',
          className
        )}
      >
        <ol className="flex items-center gap-2 flex-wrap">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isDots = item.label === '...';

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {/* Séparateur (sauf avant le premier item) */}
                {index > 0 && !isDots && (
                  <span className="flex items-center opacity-60">
                    {separator}
                  </span>
                )}

                {/* Item */}
                {isDots ? (
                  <span className={cn(
                    'text-muted-foreground cursor-default',
                    itemClassName
                  )}>
                    {item.label}
                  </span>
                ) : item.current || isLast ? (
                  // Current page (non-cliquable)
                  <span
                    className={cn(
                      'text-foreground font-medium truncate',
                      'hover:text-foreground transition-colors',
                      itemClassName,
                      currentClassName
                    )}
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  // Lien vers une autre page
                  <Link
                    to={item.href}
                    className={cn(
                      'text-muted-foreground hover:text-foreground',
                      'transition-colors truncate',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'rounded px-1',
                      itemClassName,
                      linkClassName
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  // Item sans lien
                  <span className={cn(
                    'text-muted-foreground truncate',
                    itemClassName
                  )}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
