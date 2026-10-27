/**
 * MED MNG — catalogue de styles musicaux v2 (20 styles) : PRÉPARÉ, NON ACTIVÉ.
 *
 * Module pur (aucune API Deno ni navigateur) ; seule dépendance : le catalogue actuel,
 * `mm-suno-requete.ts`, qui reste la source de vérité UTILISÉE par le serveur et le front.
 *
 *  - `CATALOGUE_V2_ACTIF = false` : tant que le drapeau est à false, `obtenirCatalogueActif()`
 *    renvoie exactement `STYLES_MUSICAUX` (même référence : 13 styles, prompts actuels) et
 *    `resoudreStyleActif()` se comporte comme `resoudreStyle()` (slug inconnu → « pop »).
 *  - Ce module n'est importé par AUCUN fichier de production (ni Edge Function, ni interface).
 *    Le brancher est une décision à part, après écoute (docs/MUSIQUE-COMPARAISON-ABC.md).
 *  - Les 13 slugs actuels sont conservés à l'identique (libellé, description, énergie, tempo
 *    inchangés) : seul le prompt change (version « structurée »), avec des champs d'identité.
 *  - Les 7 nouveaux styles (trap, neo-soul, amapiano, zouk-kompa, house, reggaeton, funk) ont
 *    une identité propre, mais `neo-soul` est signalé trop proche de `rnb` : non activable.
 *
 * Chaque prompt v2 est COMPOSÉ à partir des champs d'identité, dans l'ordre que Suno comprend le
 * mieux d'après la documentation lue le 25/09/2026 (tags concis, genre principal d'abord) :
 * genre principal → influences → instruments dominants → secondaires → groove → voix → tempo.
 * « Mieux comprend » n'est PAS démontré : c'est une hypothèse à vérifier par la comparaison A/B/C.
 *
 * Budget de longueur : le style final = prompt + ambiance libre (≤ 12 tags de ≤ 40 caractères,
 * soit ≤ 504 caractères) + voix et « french lyrics » (≤ 37 caractères), borné à 1 000 par
 * `joindreTags`, qui coupe la QUEUE (voix et langue en premier) sans le dire. Un prompt v2 reste
 * donc ≤ 450 caractères : même ambiance maximale, rien n'est tronqué.
 */
import {
  STYLES_MUSICAUX,
  STYLE_PAR_DEFAUT,
  resoudreStyle,
  trouverStyle,
  type GenreVocal,
  type StyleMusical,
} from './mm-suno-requete.ts';

/** Drapeau de bascule : à false, le catalogue actif est INCHANGÉ (13 styles, prompts actuels). */
export const CATALOGUE_V2_ACTIF = false;

export type RecommandationActivation = 'recommande' | 'a_evaluer' | 'deconseille';

export interface StyleMusicalV2 extends StyleMusical {
  version: 'v2';
  /** Genre principal (premier tag du prompt). */
  genrePrincipal: string;
  influences: readonly string[];
  instrumentsDominants: readonly string[];
  instrumentsSecondaires: readonly string[];
  groove: readonly string[];
  /** Tag de voix intégré au prompt (s'ajoute à « clear … vocals » ajouté par construireStyle). */
  voixRecommandee: string;
  /** Genre vocal conseillé (aucun conseil établi sans écoute : absent pour les 20 styles). */
  vocalGenderConseille?: GenreVocal;
  tempoBpm: number;
  /**
   * Direction de référence « B » (prompt personnel riche de la propriétaire), reprise telle
   * quelle pour la comparaison A/B/C. Jamais envoyée en production.
   */
  promptReference: string;
  /** Tensions ou mélanges relevés dans la direction de référence (français). */
  noteReference: string;
  /** Termes qui ne doivent JAMAIS figurer dans `negativeTags` (ils contredisent le style). */
  tagsIncompatibles: readonly string[];
  recommandation: RecommandationActivation;
  /** Slugs des styles voisins (risque de recouvrement). */
  proches: readonly string[];
  noteDistinction: string;
}

// ---------------------------------------------------------------------------
// Exclusions (copie de EXCLUSIONS_COMMUNES de mm-suno-requete.ts, non exportée ;
// un test vérifie que les négatifs v2 des 13 styles COMMENCENT par les négatifs actuels)
// ---------------------------------------------------------------------------
const COMMUNES = 'screaming, distorted vocals, mumbled vocals, off-key vocals, harsh noise';
/** Hypothèse « anti-robot » à tester (non démontrée) ; absente des styles où le vocoder est un genre. */
const ANTI_ROBOT = 'robotic vocals, metallic vocals';

type Definition = Omit<StyleMusicalV2, 'prompt' | 'version'>;

/** Prompt structuré : genre principal, influences, instruments, groove, voix, tempo. */
export function composerPromptStructure(
  d: Pick<Definition, 'genrePrincipal' | 'influences' | 'instrumentsDominants' | 'instrumentsSecondaires' | 'groove' | 'voixRecommandee' | 'tempoBpm'>,
): string {
  return [
    d.genrePrincipal,
    ...d.influences,
    ...d.instrumentsDominants,
    ...d.instrumentsSecondaires,
    ...d.groove,
    d.voixRecommandee,
    `${d.tempoBpm} bpm`,
  ].join(', ');
}

const definir = (d: Definition): StyleMusicalV2 => ({ ...d, version: 'v2', prompt: composerPromptStructure(d) });

// ---------------------------------------------------------------------------
// Catalogue v2
// ---------------------------------------------------------------------------

export const STYLES_MUSICAUX_V2: readonly StyleMusicalV2[] = [
  // ----- Les 13 styles actuels (slugs, libellés, descriptions, énergies et tempos conservés) -----
  definir({
    slug: 'rap-francais',
    libelle: 'Rap français',
    description: 'Flow net et percutant, idéal pour retenir des listes',
    energie: 'haute',
    genrePrincipal: 'french conscious hip hop',
    influences: ['boom bap', 'jazz rap'],
    instrumentsDominants: ['punchy organic drums', 'deep melodic bass', 'expressive jazz piano'],
    instrumentsSecondaires: ['warm rhodes', 'soulful electric guitar', 'subtle orchestral textures', 'sampled textures'],
    groove: ['head nodding groove', 'dynamic flow variations', 'memorable hook'],
    voixRecommandee: 'clear articulate rap vocals',
    tempoBpm: 92,
    negativeTags: `${COMMUNES}, heavy metal, opera, trap hi-hats, ${ANTI_ROBOT}`,
    promptReference: 'French conscious hip-hop, modern boom bap, jazz rap, West Coast hip-hop influences, deep melodic bass, punchy organic drums, expressive jazz piano, soulful electric guitar, warm Rhodes chords, subtle orchestral textures, intricate rhythmic grooves, sophisticated sampling aesthetics, memorable melodic hooks, natural expressive French rap vocals, clear articulation, dynamic flow variations, polished studio production',
    noteReference: 'Boom bap (côte Est, grain sale) et influences West Coast (côte Ouest) tirent dans deux directions ; « polished » contredit l’esthétique d’échantillons poussiéreux du boom bap. v2 : West Coast et « polished » retirés.',
    tagsIncompatibles: ['rap', 'hip hop', 'boom bap', 'jazz', 'piano', 'bass', 'drums', 'samples', 'flow'],
    recommandation: 'a_evaluer',
    proches: ['trap'],
    noteDistinction: 'Boom bap / jazz rap, batterie organique ; trap (808, charleys roulés) est un style séparé.',
  }),
  definir({
    slug: 'pop',
    libelle: 'Pop',
    description: 'Mélodie accrocheuse et refrain facile à retenir',
    energie: 'moyenne',
    genrePrincipal: 'french melodic pop',
    influences: ['indie pop', 'dance pop'],
    instrumentsDominants: ['acoustic grand piano', 'warm electric bass', 'live studio drums'],
    instrumentsSecondaires: ['shimmering electric guitars', 'subtle analog synths', 'layered harmonies'],
    groove: ['catchy chorus', 'upbeat groove'],
    voixRecommandee: 'warm expressive lead vocals',
    tempoBpm: 112,
    negativeTags: `${COMMUNES}, heavy metal, screamo, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary melodic pop, French pop, indie pop, sophisticated dance-pop influences, expressive acoustic grand piano, warm electric bass, live studio drums, shimmering electric guitars, subtle analog synthesizers, layered melodic harmonies, memorable choruses, dynamic instrumental transitions, natural expressive lead vocals, nuanced phrasing, rich stereo arrangements, polished contemporary studio production',
    noteReference: 'Trois sous-genres (pop, indie pop, dance-pop) : identité large mais cohérente ; synthés « subtle » justifient piano acoustique + synthés analogiques. Pas de contradiction.',
    tagsIncompatibles: ['pop', 'indie', 'piano', 'guitar', 'guitars', 'bass', 'drums', 'chorus', 'harmonies'],
    recommandation: 'a_evaluer',
    proches: ['electro'],
    noteDistinction: 'v2 : pop menée par instruments live (piano, basse, batterie) ; l’électropop reste menée par les synthés. En v1, « bright synths » rapprochait les deux.',
  }),
  definir({
    slug: 'lofi',
    libelle: 'Lo-fi chill',
    description: 'Doux et posé, pour réviser sans fatigue',
    energie: 'calme',
    genrePrincipal: 'lo-fi hip hop',
    influences: ['jazzhop', 'chillhop'],
    instrumentsDominants: ['warm rhodes', 'soft organic drums', 'rounded electric bass'],
    instrumentsSecondaires: ['intimate acoustic piano', 'subtle jazz guitar', 'vinyl crackle'],
    groove: ['relaxed head nodding groove', 'mellow jazz harmonies'],
    voixRecommandee: 'intimate soft vocals',
    tempoBpm: 80,
    negativeTags: `${COMMUNES}, heavy metal, aggressive drums, fast tempo, ${ANTI_ROBOT}`,
    promptReference: 'Lo-fi hip-hop, jazzhop, mellow neo-soul, chillhop, warm Rhodes piano, intimate acoustic piano, soft organic drums, rounded electric bass, subtle jazz guitar, delicate vinyl textures, sophisticated jazz harmonies, relaxed head-nodding groove, gentle instrumental variations, intimate natural vocals, spacious warm production, smooth atmospheric sound',
    noteReference: 'Quatre quasi-synonymes (lo-fi, jazzhop, chillhop, neo-soul) ; « spacious » s’oppose à l’intimité lo-fi (son proche, compressé). v2 : « mellow neo-soul » retiré pour ne pas empiéter sur le style neo-soul.',
    tagsIncompatibles: ['lo-fi', 'lofi', 'hip hop', 'jazz', 'jazzhop', 'chillhop', 'vinyl', 'piano', 'rhodes', 'relaxed', 'mellow', 'soft drums'],
    recommandation: 'a_evaluer',
    proches: ['neo-soul'],
    noteDistinction: 'Grain lo-fi (vinyle, compression) et tempo lent ; la référence mêle des tags neo-soul qui le rapprochent du style neo-soul.',
  }),
  definir({
    slug: 'chanson-francaise',
    libelle: 'Chanson française',
    description: 'Le texte mis en avant, piano et guitare',
    energie: 'moyenne',
    genrePrincipal: 'contemporary french chanson',
    influences: ['acoustic pop', 'jazz chanson'],
    instrumentsDominants: ['expressive grand piano', 'warm acoustic guitar', 'delicate strings'],
    instrumentsSecondaires: ['subtle electric bass', 'organic live drums', 'elegant orchestral textures'],
    groove: ['intimate storytelling', 'gentle flowing rhythm'],
    voixRecommandee: 'natural expressive french vocals',
    tempoBpm: 100,
    negativeTags: `${COMMUNES}, heavy metal, edm, autotune, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary French chanson, modern variété française, acoustic pop, jazz chanson, expressive grand piano, warm acoustic guitar, subtle electric bass, organic live drums, delicate strings, elegant orchestral textures, sophisticated melodic arrangements, intimate storytelling atmosphere, natural expressive French vocals, nuanced emotional phrasing, rich acoustic studio production',
    noteReference: 'Cohérente. Cordes « delicate » et textures orchestrales « elegant » font doublon (deux tags pour la même couleur).',
    tagsIncompatibles: ['chanson', 'french', 'piano', 'guitar', 'strings', 'acoustic', 'orchestral', 'storytelling'],
    recommandation: 'a_evaluer',
    proches: ['acoustique'],
    noteDistinction: 'Piano et cordes mis en avant, récit intime ; l’acoustique folk est menée par la guitare fingerstyle.',
  }),
  definir({
    slug: 'afrobeat',
    libelle: 'Afrobeat',
    description: 'Rythme chaud et dansant',
    energie: 'haute',
    genrePrincipal: 'afrobeats',
    influences: ['afro fusion', 'afro soul'],
    instrumentsDominants: ['intricate african percussion', 'deep melodic bass', 'sunny highlife guitar riffs'],
    instrumentsSecondaires: ['organic live drums', 'bright keys', 'layered polyrhythms', 'soulful harmonies'],
    groove: ['infectious dance groove'],
    voixRecommandee: 'warm expressive lead vocals',
    tempoBpm: 104,
    negativeTags: `${COMMUNES}, heavy metal, slow ballad, ${ANTI_ROBOT}`,
    promptReference: 'Afrofusion, Amapiano, Afrokompa, Afrozouk, modern Makossa, Bikutsi, Afrosoul, Jazz Amapiano, Afro-Caribbean fusion, rhythmic Kompa electric guitars, expressive jazz piano, deep melodic electric bass, rolling Amapiano log drums, intricate African percussion, organic live drums, layered polyrhythms, soulful harmonies, vibrant instrumental breaks, warm analog textures, natural expressive lead vocals, immersive studio production, infectious dance groove',
    noteReference: 'Mélange de six à huit genres (Amapiano, Kompa, Zouk, Makossa, Bikutsi, Afrosoul…) : risque d’un style flou, sans pulsation identifiable (log drums amapiano et kompa n’ont ni le même tempo ni le même balancement). v2 recentrée sur afrobeats / afrofusion ; amapiano et zouk-kompa deviennent des styles à part.',
    tagsIncompatibles: ['afrobeats', 'afrobeat', 'afro', 'african', 'percussion', 'polyrhythms', 'dance', 'groove', 'guitar', 'highlife', 'keys'],
    recommandation: 'a_evaluer',
    proches: ['amapiano', 'zouk-kompa'],
    noteDistinction: 'Recentré : percussions africaines, basse, guitare claire. Sans log drums (amapiano) ni guitares kompa (zouk-kompa).',
  }),
  definir({
    slug: 'rock',
    libelle: 'Rock',
    description: 'Guitares énergiques, refrain scandé',
    energie: 'haute',
    genrePrincipal: 'modern melodic rock',
    influences: ['alternative rock', 'classic rock'],
    instrumentsDominants: ['expressive electric guitar riffs', 'powerful live drums', 'driving electric bass'],
    instrumentsSecondaires: ['warm hammond organ', 'energetic piano', 'melodic guitar solo'],
    groove: ['dynamic verse to chorus lift', 'anthemic chorus'],
    voixRecommandee: 'powerful natural vocals',
    tempoBpm: 128,
    negativeTags: `${COMMUNES}, death metal, growling, screamo, ${ANTI_ROBOT}`,
    promptReference: 'Modern melodic rock, alternative rock, classic rock influences, expressive electric guitar riffs, powerful live acoustic drums, driving electric bass, warm Hammond organ, energetic piano, melodic electric guitar solos, dynamic verse-to-chorus transitions, organic band performance, powerful natural vocals, rich amplifier textures, wide stereo guitar arrangements, polished live studio sound',
    noteReference: '« live acoustic drums » : « acoustic » désigne la batterie, pas un style acoustique (pas de contradiction avec les guitares électriques). « polished » et « organic band performance » restent compatibles.',
    tagsIncompatibles: ['rock', 'guitar', 'guitars', 'riffs', 'drums', 'organ', 'hammond', 'solo', 'anthemic', 'chorus', 'bass'],
    recommandation: 'a_evaluer',
    proches: [],
    noteDistinction: 'Seul style guitare-batterie-orgue du catalogue.',
  }),
  definir({
    slug: 'jazz',
    libelle: 'Jazz',
    description: 'Swing feutré, voix chaleureuse',
    energie: 'moyenne',
    genrePrincipal: 'contemporary vocal jazz',
    influences: ['soul jazz', 'swing'],
    instrumentsDominants: ['acoustic grand piano', 'upright double bass', 'brushed live drums'],
    instrumentsSecondaires: ['warm tenor saxophone', 'subtle trumpet', 'extended jazz harmonies'],
    groove: ['natural swing feel', 'tasteful instrumental solos'],
    voixRecommandee: 'warm soulful vocals',
    tempoBpm: 110,
    negativeTags: `${COMMUNES}, heavy metal, edm, autotune, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary vocal jazz, modern soul jazz, sophisticated swing, acoustic grand piano, expressive jazz piano improvisations, upright double bass, brushed live drums, warm tenor saxophone, subtle trumpet phrases, extended jazz harmonies, tasteful instrumental solos, natural swing feel, intimate live studio atmosphere, nuanced soulful vocals, rich acoustic resonance, spacious high-fidelity production',
    noteReference: 'Cohérente (« acoustic grand piano » et « jazz piano » doublonnent). Des solos instrumentaux étendus sont en tension avec des paroles à chanter en entier : à surveiller à l’écoute.',
    tagsIncompatibles: ['jazz', 'swing', 'piano', 'bass', 'saxophone', 'trumpet', 'brushed', 'harmonies', 'solos'],
    recommandation: 'a_evaluer',
    proches: [],
    noteDistinction: 'Seul style swing acoustique du catalogue (funk et neo-soul sont jazzés mais groovés).',
  }),
  definir({
    slug: 'reggae',
    libelle: 'Reggae',
    description: 'Tempo tranquille, groove chaloupé',
    energie: 'calme',
    genrePrincipal: 'modern roots reggae',
    influences: ['lovers rock', 'subtle dub'],
    instrumentsDominants: ['deep melodic bass guitar', 'offbeat rhythm guitar chops', 'organic live drums'],
    instrumentsSecondaires: ['warm hammond organ', 'soulful keyboard melodies', 'spacious dub echoes'],
    groove: ['relaxed syncopated groove', 'warm vocal harmonies'],
    voixRecommandee: 'warm natural lead vocals',
    tempoBpm: 76,
    negativeTags: `${COMMUNES}, heavy metal, fast tempo, ${ANTI_ROBOT}`,
    promptReference: 'Modern roots reggae, lovers rock, subtle dub influences, deep melodic bass guitar, rhythmic offbeat electric guitar chops, warm Hammond organ, organic live drums, intricate percussion, soulful keyboard melodies, spacious dub echoes, relaxed syncopated groove, warm vocal harmonies, natural expressive lead vocals, authentic live-band atmosphere, rich analog production',
    noteReference: 'Cohérente. Le dub fait partie du style : « dub » ne doit jamais figurer dans les négatifs.',
    tagsIncompatibles: ['reggae', 'dub', 'roots', 'skank', 'organ', 'offbeat', 'bass', 'lovers rock', 'echoes'],
    recommandation: 'a_evaluer',
    proches: ['reggaeton'],
    noteDistinction: 'Offbeat skank et basse dub, tempo lent ; le reggaeton repose sur le dembow.',
  }),
  definir({
    slug: 'electro',
    libelle: 'Électro pop',
    description: 'Synthés et beat entraînant',
    energie: 'haute',
    genrePrincipal: 'modern electropop',
    influences: ['synthpop', 'french touch'],
    instrumentsDominants: ['warm analog synthesizers', 'punchy electronic drums', 'deep synth bass'],
    instrumentsSecondaires: ['shimmering arpeggios', 'expressive piano accents', 'layered electronic textures'],
    groove: ['energetic dance groove', 'dynamic breakdowns', 'catchy hook'],
    voixRecommandee: 'expressive melodic vocals',
    tempoBpm: 120,
    negativeTags: `${COMMUNES}, heavy metal, acoustic folk`,
    promptReference: 'Modern electropop, sophisticated synthpop, melodic electronic dance music, French touch influences, warm analog synthesizers, punchy electronic drums, deep synth bass, shimmering arpeggios, expressive piano accents, layered electronic textures, evolving melodic arrangements, dynamic breakdowns, memorable hooks, natural expressive vocals, polished immersive electronic production',
    noteReference: 'Cohérente. « natural vocals » reste en tension douce avec la French touch (vocodeur) : « robotic vocals » n’est donc pas exclu ici.',
    tagsIncompatibles: ['electropop', 'synthpop', 'synth', 'synthesizers', 'electronic', 'arpeggios', 'french touch', 'dance', 'breakdowns'],
    recommandation: 'a_evaluer',
    proches: ['pop', 'house'],
    noteDistinction: 'Menée par synthés et boîte à rythmes, tempo 120 ; la pop v2 est menée par des instruments live.',
  }),
  definir({
    slug: 'rnb',
    libelle: 'R&B',
    description: 'Groove doux, voix soul',
    energie: 'moyenne',
    genrePrincipal: 'contemporary r&b',
    influences: ['alternative r&b', 'modern urban soul'],
    instrumentsDominants: ['deep melodic bass', 'organic pocket drums', 'warm rhodes'],
    instrumentsSecondaires: ['subtle electric guitar', 'layered soulful harmonies', 'smooth keyboard melodies'],
    groove: ['relaxed smooth groove'],
    voixRecommandee: 'intimate soulful lead vocals',
    tempoBpm: 90,
    negativeTags: `${COMMUNES}, heavy metal, screamo, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary R&B, alternative R&B, smooth soul, modern urban soul, warm Rhodes electric piano, deep melodic bass, organic pocket drums, subtle electric guitar, sophisticated jazz-influenced chords, layered soulful harmonies, expressive keyboard melodies, intimate natural lead vocals, nuanced phrasing, relaxed groove, rich contemporary studio production',
    noteReference: 'Cohérente, mais la référence est presque identique à celle du neo-soul (Rhodes, basse, batterie « pocket », voix intime, groove relaxé).',
    tagsIncompatibles: ['r&b', 'soul', 'rhodes', 'bass', 'groove', 'pocket drums', 'jazz', 'harmonies'],
    recommandation: 'a_evaluer',
    proches: ['neo-soul'],
    noteDistinction: 'R&B urbain contemporain ; le neo-soul de la référence en est très voisin.',
  }),
  definir({
    slug: 'acoustique',
    libelle: 'Acoustique folk',
    description: 'Guitare sèche, voix naturelle',
    energie: 'calme',
    genrePrincipal: 'contemporary acoustic folk',
    influences: ['indie folk', 'singer songwriter'],
    instrumentsDominants: ['fingerpicked acoustic guitars', 'warm grand piano', 'melodic acoustic bass'],
    instrumentsSecondaires: ['organic percussion', 'delicate strings', 'subtle americana'],
    groove: ['intimate live room atmosphere', 'gentle steady rhythm'],
    voixRecommandee: 'natural unprocessed vocals',
    tempoBpm: 96,
    negativeTags: `${COMMUNES}, heavy metal, edm, electronic drums, autotune, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary acoustic folk, indie folk, singer-songwriter, subtle Americana influences, fingerpicked acoustic guitars, warm grand piano, organic percussion, melodic acoustic bass, delicate strings, expressive instrumental passages, intimate live-room atmosphere, natural unprocessed vocals, nuanced emotional interpretation, rich acoustic resonance, warm high-fidelity production',
    noteReference: 'Cohérente.',
    tagsIncompatibles: ['acoustic', 'folk', 'guitar', 'guitars', 'piano', 'strings', 'americana', 'fingerpicked', 'singer songwriter'],
    recommandation: 'a_evaluer',
    proches: ['chanson-francaise'],
    noteDistinction: 'Guitare fingerstyle, ambiance de salle ; le piano est secondaire.',
  }),
  definir({
    slug: 'comptine',
    libelle: 'Comptine mnémotechnique',
    description: 'Mélodie simple et répétitive, faite pour retenir',
    energie: 'moyenne',
    genrePrincipal: 'playful acoustic pop',
    influences: ['educational pop', 'nursery rhyme'],
    instrumentsDominants: ['bright acoustic piano', 'ukulele', 'warm bass'],
    instrumentsSecondaires: ['organic hand percussion', 'subtle strings', 'memorable melodic motifs'],
    groove: ['clear repetitive singalong chorus', 'cheerful rhythmic variations'],
    voixRecommandee: 'clear cheerful vocals',
    tempoBpm: 100,
    negativeTags: `${COMMUNES}, heavy metal, edm, dark, aggressive, ${ANTI_ROBOT}`,
    promptReference: 'Modern melodic educational pop, sophisticated nursery rhyme, playful acoustic pop, bright acoustic piano, ukulele, warm bass, organic hand percussion, subtle strings, memorable melodic motifs, clear repetitive choruses, cheerful rhythmic variations, expressive natural vocals, excellent French articulation, polished acoustic production, engaging and memorable musical structure',
    noteReference: '« sophisticated nursery rhyme » est un oxymore (comptine simple vs sophistiquée) : v2 garde « nursery rhyme » seul. Style pensé pour la mémorisation : l’intelligibilité compte plus que la richesse.',
    tagsIncompatibles: ['nursery', 'rhyme', 'ukulele', 'piano', 'singalong', 'chorus', 'educational', 'playful', 'cheerful'],
    recommandation: 'a_evaluer',
    proches: [],
    noteDistinction: 'Mélodie simple, ukulélé, refrain scandé : identité propre.',
  }),
  definir({
    slug: 'slam',
    libelle: 'Slam / spoken word',
    description: 'Texte parlé-chanté, chaque mot bien audible',
    energie: 'calme',
    genrePrincipal: 'french spoken word',
    influences: ['conscious slam', 'jazz poetry', 'neo soul'],
    instrumentsDominants: ['expressive acoustic piano', 'warm rhodes', 'subtle upright bass'],
    instrumentsSecondaires: ['restrained organic drums', 'atmospheric electric guitar'],
    groove: ['spoken verses', 'sung chorus', 'unhurried pace'],
    voixRecommandee: 'intimate spoken vocal delivery',
    tempoBpm: 84,
    negativeTags: `${COMMUNES}, heavy metal, edm, autotune, ${ANTI_ROBOT}`,
    promptReference: 'French spoken word, conscious slam, jazz poetry, neo-soul influences, expressive acoustic piano, warm Rhodes chords, subtle upright bass, restrained organic drums, atmospheric electric guitar, cinematic instrumental transitions, sophisticated harmonies, intimate spoken vocal delivery, natural French diction, expressive phrasing, emotionally nuanced performance, warm spacious studio production',
    noteReference: '« cinematic transitions » et « restrained » tirent en sens opposé. Limite de fond : Suno chante ou rappe plus qu’il ne parle ; une voix réellement parlée ne peut pas être promise sans écoute.',
    tagsIncompatibles: ['slam', 'spoken', 'spoken word', 'poetry', 'piano', 'rhodes', 'upright bass', 'jazz', 'neo soul'],
    recommandation: 'a_evaluer',
    proches: [],
    noteDistinction: 'Voix parlée-chantée sur lit minimal ; aucun autre style ne vise la diction.',
  }),

  // ----- Les 7 nouveaux styles -----
  definir({
    slug: 'trap',
    libelle: 'Trap',
    description: 'Basses 808 profondes, charleys nerveux, flow mélodique',
    energie: 'haute',
    genrePrincipal: 'modern melodic trap',
    influences: ['french trap', 'atmospheric hip hop', 'west coast melodic'],
    instrumentsDominants: ['deep controlled 808 bass', 'intricate hi-hat patterns', 'punchy trap drums'],
    instrumentsSecondaires: ['dark melodic piano', 'atmospheric synths', 'expressive electric guitar textures'],
    groove: ['half time bounce', 'memorable melodic hook'],
    voixRecommandee: 'clear articulate melodic rap vocals',
    tempoBpm: 140,
    negativeTags: `${COMMUNES}, heavy metal, opera, boom bap`,
    promptReference: 'Modern melodic trap, French trap, atmospheric hip-hop, West Coast melodic influences, deep controlled 808 bass, intricate hi-hat patterns, punchy trap drums, dark melodic piano, atmospheric synthesizers, expressive electric guitar textures, sophisticated rhythmic variations, memorable melodic hooks, natural French rap vocals, clear articulation, polished powerful low-end production',
    noteReference: 'Cohérente. Le vocodeur / l’autotune sont courants en trap : « robotic vocals » n’est pas exclu.',
    tagsIncompatibles: ['trap', '808', 'hi-hat', 'hi hat', 'hats', 'melodic', 'rap', 'hip hop', 'piano', 'synths'],
    recommandation: 'a_evaluer',
    proches: ['rap-francais'],
    noteDistinction: 'Sonorité distincte (808, charleys roulés, demi-temps) mais même usage que le rap : n’activer que si l’écoute confirme l’écart avec le rap boom bap.',
  }),
  definir({
    slug: 'neo-soul',
    libelle: 'Neo-soul',
    description: 'Rhodes chaud, harmonies jazz, groove décontracté',
    energie: 'calme',
    genrePrincipal: 'contemporary neo soul',
    influences: ['jazz soul fusion', 'funk soul'],
    instrumentsDominants: ['warm rhodes', 'extended jazz chords', 'deep melodic bass guitar'],
    instrumentsSecondaires: ['organic pocket drums', 'subtle funk guitar', 'keyboard improvisations'],
    groove: ['laid back groove', 'warm analog saturation'],
    voixRecommandee: 'intimate nuanced vocals',
    tempoBpm: 86,
    negativeTags: `${COMMUNES}, heavy metal, edm, ${ANTI_ROBOT}`,
    promptReference: 'Contemporary neo-soul, alternative R&B, jazz soul fusion, warm Rhodes electric piano, sophisticated extended chords, deep melodic bass guitar, organic pocket drums, subtle funk guitar, expressive keyboard improvisations, layered soulful harmonies, warm analog saturation, intimate natural vocals, nuanced vocal phrasing, relaxed groove, rich studio instrumentation',
    noteReference: 'Presque identique à la référence R&B (R&B alternatif, Rhodes, basse, batterie « pocket », harmonies soul, voix intime, groove relaxé) : seul « funk guitar » et « jazz fusion » les séparent.',
    tagsIncompatibles: ['neo soul', 'soul', 'rhodes', 'jazz', 'funk', 'bass', 'chords', 'groove'],
    recommandation: 'deconseille',
    proches: ['rnb', 'lofi'],
    noteDistinction: 'Quasi redondant avec R&B (et voisin du lo-fi) : ne pas activer. Le slug « neo-soul » est aujourd’hui un alias de « rnb » (préférences existantes).',
  }),
  definir({
    slug: 'amapiano',
    libelle: 'Amapiano',
    description: 'Log drums roulants, piano jazzy, groove hypnotique',
    energie: 'haute',
    genrePrincipal: 'soulful amapiano',
    influences: ['jazz amapiano', 'afro house'],
    instrumentsDominants: ['deep rolling log drums', 'intricate syncopated percussion', 'warm jazz piano'],
    instrumentsSecondaires: ['melodic electric bass', 'atmospheric keyboard chords', 'layered soulful harmonies'],
    groove: ['hypnotic dance groove', 'evolving instrumental breaks'],
    voixRecommandee: 'smooth natural vocals',
    tempoBpm: 112,
    negativeTags: `${COMMUNES}, heavy metal, rock guitars, slow ballad, ${ANTI_ROBOT}`,
    promptReference: 'South African Amapiano, soulful Amapiano, jazz Amapiano, Afro-house influences, deep rolling log drums, intricate syncopated percussion, warm jazz piano, melodic electric bass, atmospheric keyboard chords, expressive African rhythmic textures, layered soulful harmonies, evolving instrumental breaks, hypnotic dance groove, natural expressive vocals, rich immersive nightclub production',
    noteReference: 'Cohérente et bien centrée sur un seul genre.',
    tagsIncompatibles: ['amapiano', 'log drums', 'afro house', 'house', 'jazz', 'piano', 'percussion'],
    recommandation: 'recommande',
    proches: ['afrobeat', 'house'],
    noteDistinction: 'Distinct de l’afrobeat par les log drums et la pulsation house à 112 bpm ; à activer avec l’afrobeat RECENTRÉ (sans mélange amapiano).',
  }),
  definir({
    slug: 'zouk-kompa',
    libelle: 'Zouk / Kompa',
    description: 'Guitares claires caribéennes, groove chaloupé',
    energie: 'moyenne',
    genrePrincipal: 'modern kompa zouk',
    influences: ['haitian kompa', 'caribbean soul'],
    instrumentsDominants: ['rhythmic clean electric guitars', 'warm electric bass', 'expressive jazz piano'],
    instrumentsSecondaires: ['organic live drums', 'intricate caribbean percussion', 'melodic guitar solo'],
    groove: ['smooth syncopated dance groove', 'soulful vocal harmonies'],
    voixRecommandee: 'warm natural lead vocals',
    tempoBpm: 100,
    negativeTags: `${COMMUNES}, heavy metal, edm, dubstep, ${ANTI_ROBOT}`,
    promptReference: 'Modern Zouk, Haitian Kompa, Afrokompa, Afrozouk, Caribbean soul, rhythmic clean electric guitars, melodic guitar solos, warm electric bass, expressive jazz piano, organic live drums, intricate Caribbean percussion, sophisticated harmonic progressions, smooth syncopated dance groove, soulful vocal harmonies, natural expressive lead vocals, warm polished live-band production',
    noteReference: 'Zouk et kompa sont deux genres voisins mais distincts ; « Afrokompa, Afrozouk » ramène vers l’afrobeat. v2 : préfixe « afro » retiré.',
    tagsIncompatibles: ['zouk', 'kompa', 'caribbean', 'guitar', 'guitars', 'piano', 'bass', 'percussion'],
    recommandation: 'recommande',
    proches: ['afrobeat'],
    noteDistinction: 'Guitares claires et batterie live caribéennes, sans log drums ni percussions afrobeat ; distinct tant que le préfixe « afro » est absent.',
  }),
  definir({
    slug: 'house',
    libelle: 'House',
    description: 'Pulsation à quatre temps, claviers soul, ambiance club',
    energie: 'haute',
    genrePrincipal: 'melodic house',
    influences: ['soulful house', 'french house', 'deep house'],
    instrumentsDominants: ['warm analog synthesizers', 'deep rhythmic bass', 'four on the floor drums'],
    instrumentsSecondaires: ['expressive piano chords', 'subtle disco guitar', 'soulful keyboard melodies'],
    groove: ['infectious club groove', 'dynamic breakdowns'],
    voixRecommandee: 'natural melodic vocals',
    tempoBpm: 122,
    negativeTags: `${COMMUNES}, heavy metal, acoustic folk, slow ballad`,
    promptReference: 'Melodic house, soulful house, French house, deep house influences, warm analog synthesizers, expressive piano chords, deep rhythmic bass, organic four-on-the-floor drums, subtle disco guitar, soulful keyboard melodies, evolving electronic arrangements, dynamic breakdowns, infectious dance groove, natural melodic vocals, immersive polished club production',
    noteReference: '« organic » s’oppose à « four-on-the-floor » électronique : v2 retire « organic ». Style proche de l’électropop (synthés analogiques, breakdowns).',
    tagsIncompatibles: ['house', 'disco', 'synth', 'synthesizers', 'piano', 'bass', 'club', 'four on the floor', 'breakdowns'],
    recommandation: 'a_evaluer',
    proches: ['electro', 'amapiano'],
    noteDistinction: 'Pulsation quatre temps sans structure couplet-refrain pop ; voisin de l’électropop : activer après écoute.',
  }),
  definir({
    slug: 'reggaeton',
    libelle: 'Reggaeton',
    description: 'Rythme dembow, basses rondes, énergie latine',
    energie: 'haute',
    genrePrincipal: 'modern melodic reggaeton',
    influences: ['latin urban pop', 'dancehall'],
    instrumentsDominants: ['rhythmic dembow percussion', 'deep melodic bass', 'organic latin drums'],
    instrumentsSecondaires: ['spanish guitar textures', 'warm piano accents', 'electronic layers'],
    groove: ['infectious syncopated groove', 'dynamic instrumental breaks'],
    voixRecommandee: 'natural expressive vocals',
    tempoBpm: 96,
    negativeTags: `${COMMUNES}, heavy metal, slow ballad, opera`,
    promptReference: 'Modern melodic reggaeton, Latin urban pop, Caribbean dancehall influences, deep melodic bass, rhythmic dembow percussion, organic Latin drums, expressive Spanish guitar textures, warm piano accents, sophisticated electronic layers, infectious syncopated groove, dynamic instrumental breaks, natural expressive vocals, polished contemporary Latin production',
    noteReference: 'Cohérente. Paroles françaises sur un style latin : la prononciation et l’accentuation peuvent glisser vers l’espagnol, à vérifier à l’écoute.',
    tagsIncompatibles: ['reggaeton', 'dembow', 'latin', 'urban', 'dancehall', 'spanish', 'guitar', 'percussion', 'bass'],
    recommandation: 'recommande',
    proches: ['reggae'],
    noteDistinction: 'Dembow (kick à quatre temps + caisse syncopée), distinct du reggae roots.',
  }),
  definir({
    slug: 'funk',
    libelle: 'Funk',
    description: 'Basse slap, guitare wah, cuivres et groove serré',
    energie: 'haute',
    genrePrincipal: 'modern funk',
    influences: ['jazz funk', 'soul funk', 'disco funk'],
    instrumentsDominants: ['prominent slap bass', 'tight organic live drums', 'rhythmic wah guitar'],
    instrumentsSecondaires: ['expressive clavinet', 'warm rhodes', 'punchy brass section'],
    groove: ['tight syncopated groove', 'soulful vocal harmonies'],
    voixRecommandee: 'energetic natural lead vocals',
    tempoBpm: 108,
    negativeTags: `${COMMUNES}, heavy metal, edm, autotune`,
    promptReference: 'Modern funk, jazz funk, soul funk, disco funk influences, prominent slap bass guitar, tight organic live drums, rhythmic wah electric guitars, expressive clavinet, warm Rhodes piano, punchy brass sections, sophisticated syncopated grooves, dynamic instrumental solos, soulful vocal harmonies, natural energetic lead vocals, rich live-band production',
    noteReference: 'Cohérente. Le slug « funk » est aujourd’hui un alias de « rnb ».',
    tagsIncompatibles: ['funk', 'slap', 'bass', 'clavinet', 'wah', 'brass', 'rhodes', 'disco', 'jazz', 'soul'],
    recommandation: 'recommande',
    proches: ['rnb'],
    noteDistinction: 'Basse slap, clavinet et cuivres : identité nette, loin du R&B.',
  }),
];

/** Les 13 slugs du catalogue actuel (ordre actuel) — à conserver à l'identique. */
export const SLUGS_ACTUELS_13: readonly string[] = STYLES_MUSICAUX.map((s) => s.slug);

/** Slugs des 7 nouveaux styles. */
export const SLUGS_NOUVEAUX_7: readonly string[] = ['trap', 'neo-soul', 'amapiano', 'zouk-kompa', 'house', 'reggaeton', 'funk'];

/** Styles v2 activables : tous sauf ceux marqués « deconseille » (neo-soul, quasi identique à rnb). */
export const STYLES_V2_ACTIVABLES: readonly StyleMusicalV2[] = STYLES_MUSICAUX_V2.filter(
  (s) => s.recommandation !== 'deconseille',
);

// ---------------------------------------------------------------------------
// Point de bascule UNIQUE
// ---------------------------------------------------------------------------

/**
 * Catalogue actif selon le drapeau. À false : `STYLES_MUSICAUX` lui-même (même référence,
 * rien n'est copié ni modifié). À true : les styles v2 activables.
 */
export function obtenirCatalogueActif(v2Actif: boolean = CATALOGUE_V2_ACTIF): readonly StyleMusical[] {
  return v2Actif ? STYLES_V2_ACTIVABLES : STYLES_MUSICAUX;
}

/**
 * Style effectif selon le drapeau.
 *  - drapeau false : exactement `resoudreStyle` (slug exact, alias connu, sinon « pop »).
 *  - drapeau true  : slug exact du catalogue v2 activable ; sinon alias actuel → version v2 du
 *    style visé ; sinon style par défaut (« pop ») en v2. Un slug inconnu retombe donc toujours
 *    sur le style par défaut, comme aujourd'hui.
 */
export function resoudreStyleActif(slug: string | null | undefined, v2Actif: boolean = CATALOGUE_V2_ACTIF): StyleMusical {
  if (!v2Actif) return resoudreStyle(slug);
  const s = (slug || '').trim().toLowerCase();
  const direct = STYLES_V2_ACTIVABLES.find((st) => st.slug === s);
  if (direct) return direct;
  const viaAlias = trouverStyle(s);
  const cible = viaAlias ? STYLES_V2_ACTIVABLES.find((st) => st.slug === viaAlias.slug) : undefined;
  return cible ?? (STYLES_V2_ACTIVABLES.find((st) => st.slug === STYLE_PAR_DEFAUT) as StyleMusical);
}

// ---------------------------------------------------------------------------
// Outils de contrôle (utilisés par les tests et la documentation)
// ---------------------------------------------------------------------------

const MOTS_GENERIQUES = new Set([
  'vocals', 'natural', 'expressive', 'warm', 'bpm', 'soft', 'subtle', 'clear', 'lead', 'groove', 'smooth',
  'organic', 'live', 'drums', 'bass', 'deep', 'melodic', 'modern', 'contemporary', 'french', 'electric',
  'intimate', 'soulful', 'the', 'and',
]);

/** Mots significatifs d'un prompt (sans tempo ni mots génériques). */
export function motsSignificatifs(prompt: string): Set<string> {
  return new Set(
    prompt.toLowerCase().split(/[^a-z0-9&]+/).filter((m) => m.length > 2 && !/^\d+$/.test(m) && !MOTS_GENERIQUES.has(m)),
  );
}

/** Similarité de Jaccard (0–1) entre les mots significatifs de deux prompts. */
export function similaritePrompts(a: string, b: string): number {
  const A = motsSignificatifs(a);
  const B = motsSignificatifs(b);
  if (A.size === 0 && B.size === 0) return 0;
  let commun = 0;
  for (const m of A) if (B.has(m)) commun++;
  return commun / (A.size + B.size - commun);
}

/** Vrai si `tag` (négatif) contient `terme` en suite de mots entiers (« trap hi-hats » ne contient pas « rap »). */
export function contientTerme(tag: string, terme: string): boolean {
  const mots = (t: string) => t.toLowerCase().split(/[^a-z0-9&]+/).filter(Boolean);
  const m = mots(tag);
  const t = mots(terme);
  if (t.length === 0) return false;
  for (let i = 0; i + t.length <= m.length; i++) {
    if (t.every((x, j) => m[i + j] === x)) return true;
  }
  return false;
}

/** Négatifs qui contredisent le style (liste d'incompatibilités du style) ; vide si cohérent. */
export function negatifsContradictoires(style: Pick<StyleMusicalV2, 'negativeTags' | 'tagsIncompatibles'>): string[] {
  return style.negativeTags
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && style.tagsIncompatibles.some((terme) => contientTerme(t, terme)));
}
