import { useEffect, type RefObject } from 'react';

/**
 * Pile fixe du bas de l'écran : barre de navigation mobile (< md) et mini-lecteur.
 *
 * Les deux sont `fixed bottom-0` ; leur hauteur varie (statistiques de série affichées ou non,
 * zone sûre des iPhone, panneau déplié du lecteur). Chacun PUBLIE donc sa hauteur mesurée dans une
 * variable CSS de `<html>`, et les autres s'y raccordent :
 *  - le mini-lecteur se pose AU-DESSUS de la barre (sinon il la recouvre et ses liens deviennent
 *    inaccessibles tant qu'un titre joue) ;
 *  - l'application réserve en bas de page la somme des deux hauteurs (sinon le pied de page et la
 *    fin du contenu restent cachés sous elles).
 * Sans barre ni lecteur, les variables sont absentes et les replis valent 0.
 */
export const VAR_BARRE_MOBILE = '--barre-mobile-h';
export const VAR_MINI_LECTEUR = '--mini-lecteur-h';

/** `bottom` du mini-lecteur : directement au-dessus de la barre mobile (0 si elle est absente ou masquée). */
export const BAS_MINI_LECTEUR = `var(${VAR_BARRE_MOBILE}, 0px)`;

/** Marge basse de l'application : place prise par la barre mobile et le mini-lecteur. */
export const MARGE_BASSE_APP = `calc(var(${VAR_BARRE_MOBILE}, 0px) + var(${VAR_MINI_LECTEUR}, 0px))`;

/**
 * Publie la hauteur de `ref` dans la variable CSS `variable` de `<html>`, tant que `actif` est vrai
 * et que l'élément est monté. Suit les changements de taille (ResizeObserver) et la rotation de
 * l'écran ; un élément masqué (`display: none`, ex. barre mobile à partir de `md`) publie 0.
 * La variable est retirée au démontage.
 */
export function usePublierHauteur(
  ref: RefObject<HTMLElement>,
  variable: string,
  actif = true
): void {
  useEffect(() => {
    const racine = document.documentElement;
    const element = ref.current;
    if (!actif || !element) return undefined;

    const publier = () => {
      racine.style.setProperty(
        variable,
        `${Math.ceil(element.getBoundingClientRect().height)}px`
      );
    };
    publier();

    const observateur =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(publier)
        : null;
    observateur?.observe(element);
    window.addEventListener('resize', publier);

    return () => {
      observateur?.disconnect();
      window.removeEventListener('resize', publier);
      racine.style.removeProperty(variable);
    };
  }, [ref, variable, actif]);
}
