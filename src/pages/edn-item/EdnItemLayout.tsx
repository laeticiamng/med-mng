import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEdnItemComplet } from '@/hooks/useEdnItemComplet';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContexteFicheItemEdn, type ValeurFicheItemEdn } from './EdnItemContext';
import { useAccesPremium } from '@/hooks/useAccesPremium';
import { EncartPremium } from '@/components/offre/EncartPremium';

/**
 * Sous-pages de contenu immersif, réservées aux items d'essai et à
 * MED MNG Premium. Aperçu, Rang A, Rang B (fiches officielles) et Stats
 * restent accessibles à tous.
 *
 * Le verrou est décidé par le serveur : la RPC `mm_contenu_immersif_item`
 * renvoie `{ verrouille: true }` quand l'appelant n'y a pas droit (d'après son
 * JWT), et le contenu sinon. La règle côté client (`useAccesPremium`) ne sert
 * plus que de repli si la RPC est injoignable (erreur réseau).
 */
const SEGMENTS_PREMIUM: Record<string, string> = {
  quiz: 'Le quiz de cet item',
  musique: 'Les paroles de cet item',
  planches: 'Les planches de cet item',
  recit: 'Le récit de cet item',
};
import { ONGLETS_ITEM_EDN, SEGMENT_PAR_DEFAUT, cheminItemEdn } from './ednItemTabs';

/**
 * Route parente d'un item EDN : `/edn-complete/:slug`.
 *
 * Elle remplace l'ancienne modale à neuf onglets (`EdnItemModal`, un seul
 * composant de 816 lignes qui montait les neuf contenus d'un coup). Elle charge
 * les données de l'item une seule fois — la ligne canonique, les récits de
 * l'ancienne table, et les compétences OIC de rang A et de rang B — puis les
 * passe aux sous-pages par contexte. Chaque sous-page est chargée en `lazy`
 * depuis App.tsx : ouvrir l'aperçu ne télécharge plus le quiz, la scène, les
 * planches ni le récit.
 */
export default function EdnItemLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const {
    item, contenu, loading, error, introuvable,
    contenuVerrouille, chargementContenu, etatContenu,
  } = useEdnItemComplet(slug);
  const { peutVoirItem, chargement: chargementAcces } = useAccesPremium();

  // Un seul chargement des compétences OIC pour les neuf sous-pages.
  const { competences: competencesRangA, loading: chargementRangA } = useOicCompetences(item?.item_code || '', 'A');
  const { competences: competencesRangB, loading: chargementRangB } = useOicCompetences(item?.item_code || '', 'B');

  const segmentCourant = useMemo(() => {
    const morceaux = location.pathname.split('/').filter(Boolean);
    return morceaux[morceaux.length - 1] || SEGMENT_PAR_DEFAUT;
  }, [location.pathname]);

  const allerAOnglet = useCallback(
    (segment: string) => {
      if (slug) navigate(cheminItemEdn(slug, segment));
    },
    [navigate, slug]
  );

  // Navigation clavier gauche/droite entre les sous-pages, reprise de la
  // modale. Nouveau : on ignore les frappes émises depuis un champ de saisie —
  // dans la modale, une flèche tapée dans les notes personnelles ou dans le
  // quiz changeait d'onglet.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible) {
        const balise = cible.tagName;
        if (balise === 'INPUT' || balise === 'TEXTAREA' || balise === 'SELECT' || cible.isContentEditable) return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const index = ONGLETS_ITEM_EDN.findIndex((o) => o.segment === segmentCourant);
      if (index < 0) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (index > 0) {
          e.preventDefault();
          allerAOnglet(ONGLETS_ITEM_EDN[index - 1].segment);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (index < ONGLETS_ITEM_EDN.length - 1) {
          e.preventDefault();
          allerAOnglet(ONGLETS_ITEM_EDN[index + 1].segment);
        }
      } else if (e.key === 'Escape') {
        navigate('/edn-complete');
      }
    };

    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [segmentCourant, allerAOnglet, navigate]);

  // Chaque sous-page repart en haut de page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [segmentCourant]);

  if (loading && !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item || introuvable || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/5 to-primary/5 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle>{introuvable ? 'Item introuvable' : 'Chargement impossible'}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {introuvable
                ? <>Aucun item EDN ne correspond à « {slug} ».</>
                : <>Une erreur est survenue lors du chargement de l'item{error ? ` (${error})` : ''}.</>}
            </p>
            <Button onClick={() => navigate('/edn-complete')}>Revenir aux 367 items</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const numeroItem = parseInt(item.item_code.replace('IC-', '') || '0', 10) || 0;

  const valeurContexte: ValeurFicheItemEdn = {
    item,
    contenu: contenu!,
    competencesRangA,
    competencesRangB,
    chargementRangA,
    chargementRangB,
    contenuVerrouille,
    chargementContenu,
    numeroItem,
    slugUrl: slug || item.slug || item.item_code.toLowerCase(),
    slugCanonique: item.slug || item.item_code.toLowerCase(),
  };

  return (
    <ContexteFicheItemEdn.Provider value={valeurContexte}>
      <div className="min-h-screen bg-gradient-to-br from-accent/5 to-primary/5 flex flex-col">
        {/* En-tête de l'item */}
        <header className={`bg-gradient-to-r from-accent to-primary text-primary-foreground ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="container mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/edn-complete')}
              className="text-primary-foreground hover:bg-background/20 mb-3 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tous les items
            </Button>

            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
              <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-background/20 rounded-lg flex items-center justify-center shrink-0`}>
                <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{numeroItem}</span>
              </div>
              <div className="min-w-0">
                <h1 className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold mb-1`}>
                  {isMobile ? item.item_code : `${item.item_code}: ${item.title}`}
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                  {item.subtitle || `Item de connaissance EDN ${item.item_code}`}
                </p>
              </div>
            </div>

            {!isMobile && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {ONGLETS_ITEM_EDN.slice(1).map((onglet) => {
                  const Icone = onglet.icone;
                  return (
                    <Badge key={onglet.segment} className="bg-background/20 text-primary-foreground border-background/20">
                      <Icone className="h-3 w-3 mr-1" />
                      {onglet.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Navigation entre les sous-pages : de vrais liens, donc historique du
            navigateur et ouverture dans un nouvel onglet possibles. */}
        <nav aria-label="Sections de l'item" className="border-b bg-background/80 backdrop-blur-sm sticky top-16 z-30">
          <div className="container mx-auto overflow-x-auto hide-scrollbar">
            <div className={`flex ${isMobile ? 'gap-1 py-3 px-2 min-w-max' : 'gap-0'}`}>
              {ONGLETS_ITEM_EDN.map((onglet) => {
                const Icone = onglet.icone;
                return (
                  <NavLink
                    key={onglet.segment}
                    to={cheminItemEdn(valeurContexte.slugUrl, onglet.segment)}
                    title={onglet.labelLong}
                    className={({ isActive }) =>
                      isMobile
                        ? `flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[68px] transition-all duration-200 active:scale-95 ${
                            isActive ? 'bg-accent text-accent-foreground shadow-md' : 'bg-background/80 text-muted-foreground hover:bg-muted'
                          }`
                        : `flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                            isActive ? 'border-accent bg-accent/10 text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`
                    }
                  >
                    <Icone className="h-4 w-4" />
                    <span className={isMobile ? 'text-xs font-medium' : ''}>{onglet.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 flex-1">
          {(() => {
            const contenuPremium = SEGMENTS_PREMIUM[segmentCourant];
            if (!contenuPremium) return <Outlet />;

            // Le serveur n'a pas encore répondu : on n'affiche ni le contenu
            // ni l'encart, pour ne jamais montrer l'un puis l'autre.
            if (chargementContenu || (etatContenu === 'erreur' && chargementAcces)) {
              return <div className="h-64 bg-muted rounded-xl animate-pulse" aria-busy="true" />;
            }

            // Réponse du serveur : verrouillé. En cas d'erreur réseau sur la
            // RPC, on retombe sur la règle côté client (item d'essai ou abonné).
            const verrouille = contenuVerrouille
              || (etatContenu === 'erreur' && !peutVoirItem(item.item_code));
            if (verrouille) return <EncartPremium contenu={contenuPremium} />;

            return <Outlet />;
          })()}
        </main>
      </div>
    </ContexteFicheItemEdn.Provider>
  );
}
