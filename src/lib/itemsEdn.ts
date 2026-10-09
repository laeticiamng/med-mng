/**
 * Items EDN dans Med MNG Create : ordre officiel et recherche.
 *
 * La base renvoie les items triés par `item_code` (texte) : IC-1, IC-10,
 * IC-100… Le programme officiel les numérote de 1 à 367 ; l'ordre affiché
 * doit être numérique (IC-1, IC-2, …, IC-367).
 */

export interface ItemEdnRecherchable {
  item_code: string;
  title: string;
  subtitle?: string;
}

/** Numéro officiel d'un item (« IC-12 », « ic-012 », « 12 ») ; null si illisible. */
export const numeroItem = (code: string | null | undefined): number | null => {
  const m = /^(?:ic-?)?0*(\d{1,3})$/i.exec(String(code ?? '').trim());
  return m ? parseInt(m[1], 10) : null;
};

/** Copie triée dans l'ordre officiel (numérique), les codes illisibles en dernier. */
export const trierItemsParNumero = <T extends { item_code: string }>(
  items: readonly T[]
): T[] =>
  [...items].sort((a, b) => {
    const na = numeroItem(a.item_code) ?? Number.MAX_SAFE_INTEGER;
    const nb = numeroItem(b.item_code) ?? Number.MAX_SAFE_INTEGER;
    return na - nb || a.item_code.localeCompare(b.item_code);
  });

/** Minuscules sans accents, pour une recherche tolérante (« infarctus » = « Infarctus »). */
export const normaliserTexte = (texte: string): string =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Recherche par numéro (« 12 », « IC-12 »), titre ou mot-clé (sous-titre).
 * - un numéro seul renvoie d'abord l'item exact, puis ceux qui commencent par
 *   ce numéro (« 12 » → IC-12, IC-120…IC-129), dans l'ordre officiel ;
 * - sinon, chaque mot doit apparaître dans le titre ou le sous-titre ; les
 *   correspondances en début de titre passent devant.
 * Sans requête : tous les items, dans l'ordre officiel.
 */
export const rechercherItems = <T extends ItemEdnRecherchable>(
  items: readonly T[],
  requete: string
): T[] => {
  const tries = trierItemsParNumero(items);
  const q = normaliserTexte(requete);
  if (!q) return tries;

  const numero = numeroItem(q.replace(/\s/g, ''));
  if (numero !== null) {
    const chiffres = String(numero);
    const exact = tries.filter((i) => numeroItem(i.item_code) === numero);
    const prefixe = tries.filter(
      (i) =>
        numeroItem(i.item_code) !== numero &&
        String(numeroItem(i.item_code) ?? '').startsWith(chiffres)
    );
    return [...exact, ...prefixe];
  }

  const mots = q.split(' ').filter(Boolean);
  const scores = new Map<T, number>();
  for (const item of tries) {
    const titre = normaliserTexte(item.title);
    const sousTitre = normaliserTexte(item.subtitle ?? '');
    const tout = `${titre} ${sousTitre}`;
    if (!mots.every((m) => tout.includes(m))) continue;
    let score = 0;
    if (titre.startsWith(q)) score -= 3;
    else if (titre.includes(q)) score -= 2;
    else if (mots.every((m) => titre.includes(m))) score -= 1;
    scores.set(item, score);
  }
  return [...scores.keys()].sort(
    (a, b) => (scores.get(a) ?? 0) - (scores.get(b) ?? 0)
  );
};
