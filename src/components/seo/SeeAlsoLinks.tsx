import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

// Sans « Simulateur d'examen EDN en ligne » ni « Cas cliniques corrigés pour l'EDN » : examens blancs
// et cas cliniques générés retirés (DC7) ; ces deux adresses redirigent vers les fiches officielles.
// Sans « Exemple de cas clinique interactif » (D44) : cas rédigé sans source, redirigé vers /ecos.
const ALL_PILLAR_PAGES = [
  { path: ROUTE_PATHS.seoPreparationEcos, title: 'Préparation ECOS 2027 – Guide complet' },
  { path: ROUTE_PATHS.seoReussirEdn, title: 'Réussir l\'EDN : stratégie et planning' },
  { path: ROUTE_PATHS.seoFichesEcos, title: 'Fiches ECOS interactives gratuites' },
  { path: ROUTE_PATHS.seoErreursFrquentesEcos, title: 'Erreurs fréquentes aux ECOS' },
  { path: ROUTE_PATHS.seoClassementEdnExplique, title: 'Classement EDN expliqué' },
  { path: ROUTE_PATHS.seoRangAvsRangB, title: 'Rang A vs Rang B : que réviser ?' },
  { path: ROUTE_PATHS.seoTravaillerCasCliniques, title: 'Travailler les cas cliniques efficacement' },
];

interface SeeAlsoLinksProps {
  currentPath: string;
  maxLinks?: number;
}

export const SeeAlsoLinks = ({ currentPath, maxLinks = 4 }: SeeAlsoLinksProps) => {
  const relatedPages = ALL_PILLAR_PAGES
    .filter(page => page.path !== currentPath)
    .slice(0, maxLinks);

  return (
    <nav aria-label="Articles connexes" className="mt-12 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">📚 Voir aussi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {relatedPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="group flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {page.title}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </nav>
  );
};
