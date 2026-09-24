import { supabase } from '@/integrations/supabase/client';

/**
 * Paroles d'un item EDN, produites à partir de SES compétences OIC officielles.
 *
 * Ce fichier ne fabrique plus rien lui-même. Avant, il assemblait des gabarits :
 * les 367 items recevaient les mêmes phrases (« Item 3, on va tout retenir »,
 * « Du rang A jusqu'au rang B », « Formation complète, ensemble on tremble »),
 * et 75,9 % des lignes de rang A étaient présentes 367 fois à l'identique.
 * Une chanson qui ne transporte aucune connaissance ne fait rien mémoriser.
 *
 * La génération se fait désormais dans la fonction serveur
 * `generer-paroles-item`, qui :
 *   - ne lit que les 4872 vraies compétences (`OIC-nnn-nn-A|B`), jamais les
 *     734 fausses lignes `IC-<n>` ;
 *   - donne au modèle le texte exact des compétences à faire retenir ;
 *   - REFUSE la sortie si elle retombe dans le remplissage ou si moins de 70 %
 *     des compétences sont réellement chantées, et redemande jusqu'à 3 fois ;
 *   - préfère ne rien rendre plutôt que rendre une chanson creuse.
 *
 * Les deux surfaces — la fiche d'un item et le générateur autonome (/generator)
 * — passent par ici, donc par exactement la même chaîne.
 */

export interface EchecParoles {
  code: 'aucune_competence' | 'qualite_insuffisante' | 'erreur';
  message: string;
  motifs?: string[];
}

export class ErreurParoles extends Error {
  code: EchecParoles['code'];
  motifs?: string[];
  constructor(echec: EchecParoles) {
    super(echec.message);
    this.name = 'ErreurParoles';
    this.code = echec.code;
    this.motifs = echec.motifs;
  }
}

async function demanderParoles(itemCode: string, rang: 'A' | 'B' | 'AB'): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke('generer-paroles-item', {
    body: { itemCode, rang },
  });

  // supabase-js ne lève pas sur une réponse d'erreur : l'information est dans
  // `error` (ou dans le corps). On ne l'avale pas, on la remonte telle quelle.
  if (error) {
    const corps = (error as { context?: { body?: unknown } })?.context?.body;
    let detail: Record<string, unknown> | null = null;
    try {
      detail = typeof corps === 'string' ? JSON.parse(corps) : (corps as Record<string, unknown>) ?? null;
    } catch {
      detail = null;
    }
    if (detail?.error === 'aucune_competence') {
      throw new ErreurParoles({ code: 'aucune_competence', message: String(detail.message ?? error.message) });
    }
    if (detail?.error === 'qualite_insuffisante') {
      throw new ErreurParoles({
        code: 'qualite_insuffisante',
        message: String(detail.message ?? 'Les paroles produites ne portaient pas le contenu de l’item.'),
        motifs: Array.isArray(detail.motifs) ? (detail.motifs as string[]) : undefined,
      });
    }
    throw new ErreurParoles({ code: 'erreur', message: error.message });
  }

  const paroles = (data as { paroles?: unknown })?.paroles;
  if (!Array.isArray(paroles) || paroles.length === 0) {
    throw new ErreurParoles({ code: 'erreur', message: 'La génération n’a renvoyé aucune parole.' });
  }
  return paroles as string[];
}

/** Paroles du rang demandé (A ou B). */
export async function generateComprehensiveLyrics(itemCode: string, rang: 'A' | 'B'): Promise<string[]> {
  return demanderParoles(itemCode, rang);
}

/** Paroles de l'item entier : rang A puis rang B. */
export async function generateMixedLyrics(itemCode: string): Promise<string[]> {
  return demanderParoles(itemCode, 'AB');
}
