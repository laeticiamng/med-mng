import { BarChart3, BookOpen, Brain, FileText, Image, Music, Users, type LucideIcon } from 'lucide-react';

/**
 * Les neuf écrans d'un item EDN, un par sous-page routée.
 *
 * `segment` est le morceau d'URL (`/edn-complete/:slug/<segment>`).
 * `ongletLegacy` est l'identifiant utilisé par l'ancienne modale à onglets
 * (`EdnItemModal`) : `EdnItemCard` l'envoie encore via `onOpen('music')` /
 * `onOpen('quiz')`, et d'anciens liens ou favoris peuvent le contenir.
 *
 * Les libellés « Planches de compétences » et « Parcours narré des compétences »
 * sont ceux affichés par BdGallery et RomanNarratif : ce ne sont ni une bande
 * dessinée ni un roman, mais deux présentations des compétences OIC de l'item.
 */
export interface OngletItemEdn {
  segment: string;
  ongletLegacy: string;
  label: string;
  labelLong: string;
  icone: LucideIcon;
  /** Titre de document de la sous-page (complété par le code de l'item). */
  titreDocument: string;
  description: string;
}

export const ONGLETS_ITEM_EDN: OngletItemEdn[] = [
  {
    segment: 'apercu',
    ongletLegacy: 'overview',
    label: 'Aperçu',
    labelLong: 'Aperçu général',
    icone: BookOpen,
    titreDocument: 'Aperçu',
    description: "Aperçu de l'item EDN : compétences UNESS (OIC) de rang A et de rang B, contenus disponibles, notes personnelles et export PDF.",
  },
  {
    segment: 'rang-a',
    ongletLegacy: 'rang-a',
    label: 'Rang A',
    labelLong: 'Compétences de rang A',
    icone: BookOpen,
    titreDocument: 'Rang A',
    description: "Compétences officielles de rang A de l'item EDN, issues du référentiel UNESS.",
  },
  {
    segment: 'rang-b',
    ongletLegacy: 'rang-b',
    label: 'Rang B',
    labelLong: 'Compétences de rang B',
    icone: Brain,
    titreDocument: 'Rang B',
    description: "Compétences officielles de rang B de l'item EDN, issues du référentiel UNESS.",
  },
  {
    segment: 'quiz',
    ongletLegacy: 'quiz',
    label: 'Quiz',
    labelLong: 'Quiz',
    icone: Brain,
    titreDocument: 'Quiz',
    description: "Quiz de l'item EDN : QCM, QRU et questions ouvertes construits sur les compétences OIC.",
  },
  {
    segment: 'stats',
    ongletLegacy: 'stats',
    label: 'Stats',
    labelLong: 'Statistiques',
    icone: BarChart3,
    titreDocument: 'Statistiques',
    description: "Progression sur l'item EDN : historique des quiz, heatmap d'activité et validation des compétences.",
  },
  {
    segment: 'musique',
    ongletLegacy: 'music',
    label: 'Musique',
    labelLong: 'Paroles musicales',
    icone: Music,
    titreDocument: 'Musique',
    description: "Paroles mnémotechniques de l'item EDN, par rang A, rang B et fusion A+B.",
  },
  {
    segment: 'scene',
    ongletLegacy: 'scene',
    label: 'Scène',
    labelLong: 'Scène clinique',
    icone: Users,
    titreDocument: 'Scène clinique',
    description: "Scène clinique immersive de l'item EDN.",
  },
  {
    segment: 'planches',
    ongletLegacy: 'bd',
    label: 'Planches',
    labelLong: 'Planches de compétences',
    icone: Image,
    titreDocument: 'Planches de compétences',
    description: "Planches de compétences de l'item EDN : les compétences OIC présentées en diaporama illustré.",
  },
  {
    segment: 'recit',
    ongletLegacy: 'roman',
    label: 'Récit',
    labelLong: 'Parcours narré des compétences',
    icone: FileText,
    titreDocument: 'Parcours narré des compétences',
    description: "Parcours narré des compétences de l'item EDN : mise en situation construite à partir des compétences OIC.",
  },
];

export const SEGMENT_PAR_DEFAUT = 'apercu';

const PAR_SEGMENT = new Map(ONGLETS_ITEM_EDN.map((o) => [o.segment, o]));
const PAR_ONGLET_LEGACY = new Map(ONGLETS_ITEM_EDN.map((o) => [o.ongletLegacy, o]));

export const ongletParSegment = (segment?: string | null): OngletItemEdn | undefined =>
  segment ? PAR_SEGMENT.get(segment) : undefined;

/** « music » -> « musique », « bd » -> « planches », etc. */
export const segmentDepuisOngletLegacy = (onglet?: string | null): string =>
  (onglet && (PAR_SEGMENT.get(onglet)?.segment || PAR_ONGLET_LEGACY.get(onglet)?.segment)) || SEGMENT_PAR_DEFAUT;

/** Chemin d'une sous-page d'item, ex. `/edn-complete/ic-1/musique`. */
export const cheminItemEdn = (slug: string, segment: string = SEGMENT_PAR_DEFAUT) =>
  `/edn-complete/${slug}/${segment}`;
