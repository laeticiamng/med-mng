import { createContext, useContext } from 'react';
import type { EdnItemBrut, EdnItemContenu } from '@/hooks/useEdnItemComplet';
import type { OicCompetence } from '@/hooks/useOicCompetences';

/**
 * Données de l'item partagées par la route parente `/edn-complete/:slug` avec
 * ses neuf sous-pages. Elles sont chargées UNE SEULE FOIS dans
 * `EdnItemLayout` : aucune sous-page ne refait de requête.
 *
 * `item` et `contenu` reproduisent exactement les deux objets que l'ancienne
 * modale manipulait (`finalItem` et `completeItemData`), pour que chaque écran
 * affiche la même chose qu'avant le découpage.
 */
export interface ValeurFicheItemEdn {
  item: EdnItemBrut;
  contenu: EdnItemContenu;
  competencesRangA: OicCompetence[];
  competencesRangB: OicCompetence[];
  chargementRangA: boolean;
  chargementRangB: boolean;
  /**
   * Contenu immersif (paroles, quiz, planches, récit) refusé par le serveur :
   * l'item n'est pas un item d'essai et l'utilisateur n'est pas abonné
   * Premium. Les sous-pages remplacent alors ce contenu par `EncartPremium`.
   */
  contenuVerrouille: boolean;
  /** La RPC de contenu immersif n'a pas encore répondu. */
  chargementContenu: boolean;
  numeroItem: number;
  /** Le `:slug` tel qu'il figure dans l'URL (slug ou code item, toute casse). */
  slugUrl: string;
  /** Le slug de la table canonique, utilisé pour les balises canoniques. */
  slugCanonique: string;
}

export const ContexteFicheItemEdn = createContext<ValeurFicheItemEdn | null>(null);

export function useFicheItemEdn(): ValeurFicheItemEdn {
  const valeur = useContext(ContexteFicheItemEdn);
  if (!valeur) {
    throw new Error("useFicheItemEdn doit être utilisé dans une sous-page de /edn-complete/:slug");
  }
  return valeur;
}
