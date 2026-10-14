// Touches du clavier partagées entre la page d'un item EDN et ses composants.

/**
 * Vrai si la touche appartient à l'élément qui a le focus : champ de saisie,
 * onglets ou boutons radio internes à une sous-page (les flèches changent alors
 * de rang ou de style, pas de sous-page), fenêtre ouverte (visionneuse d'image,
 * plein écran des planches : Échap la ferme seulement) ou touche déjà traitée
 * par un composant (diaporama des planches).
 */
export function toucheReserveeALaCible(
  e: Pick<KeyboardEvent, 'target' | 'defaultPrevented'>
): boolean {
  if (e.defaultPrevented) return true;
  const cible = e.target instanceof HTMLElement ? e.target : null;
  if (!cible) return false;
  const balise = cible.tagName;
  if (
    balise === 'INPUT' ||
    balise === 'TEXTAREA' ||
    balise === 'SELECT' ||
    cible.isContentEditable
  )
    return true;
  return Boolean(
    cible.closest(
      '[role="tablist"], [role="radiogroup"], [role="dialog"], [role="slider"], [role="listbox"], [role="combobox"]'
    )
  );
}

/**
 * Vrai si la touche appartient à l'élément focalisé : visionneuse d'image
 * ouverte, ou barre d'espace / Entrée sur un bouton, un lien ou un champ (le
 * diaporama la détournait avec preventDefault : un bouton ne s'activait plus
 * au clavier).
 */
export const toucheReserveeAuControle = (e: KeyboardEvent): boolean => {
  const cible = e.target instanceof Element ? e.target : null;
  if (!cible) return false;
  if (cible.closest('[data-visionneuse]')) return true;
  if (e.key === ' ' || e.key === 'Enter') {
    return Boolean(
      cible.closest(
        'button, a, input, textarea, select, summary, [role="tab"], [role="radio"]'
      )
    );
  }
  return false;
};
