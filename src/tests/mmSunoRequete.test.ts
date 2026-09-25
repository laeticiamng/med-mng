import { describe, expect, it } from 'vitest';
import {
  STYLES_MUSICAUX,
  LIMITES_SUNO,
  DUREE_CHANSON,
  POIDS_PAR_DEFAUT,
  calculerDureeSecondes,
  choisirModeleSuno,
  compterLignesChantees,
  construireNegativeTags,
  construireRequeteSuno,
  construireStyle,
  construireTitre,
  interpreterCallbackSuno,
  interpreterRecordInfoSuno,
  interpreterReponseGenerate,
  intituleCourtItem,
  normaliserGenreVocal,
  normaliserPoids,
  resoudreStyle,
  tronquerParoles,
  trouverStyle,
} from '../../supabase/functions/_shared/mm-suno-requete.ts';
import { estStyleActuel, normaliserSlugStyle } from '@/config/stylesMusicaux';
import { createRequestBody, validateGenerationInput } from '@/hooks/musicGenerationUtils';
import { parolesPourRang } from '@/components/generator/GeneratorForm';

/** Paroles réalistes : balises de section + vers, comme la RPC mm_contenu_immersif_item. */
const parolesTest = (nbVers: number, longueurVers = 60): string[] => {
  const lignes: string[] = [];
  for (let i = 0; i < nbVers; i++) {
    if (i % 8 === 0) lignes.push(i % 16 === 0 ? `[Couplet ${i / 16 + 1}]` : '[Refrain]');
    lignes.push(`Vers numéro ${i + 1} ${'x'.repeat(Math.max(0, longueurVers - 16))}`);
  }
  return lignes;
};

describe('catalogue des styles musicaux', () => {
  it('propose entre 10 et 14 styles variés, sans doublon ni champ vide', () => {
    expect(STYLES_MUSICAUX.length).toBeGreaterThanOrEqual(10);
    expect(STYLES_MUSICAUX.length).toBeLessThanOrEqual(14);
    const slugs = STYLES_MUSICAUX.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const style of STYLES_MUSICAUX) {
      expect(style.slug).toMatch(/^[a-z0-9-]+$/);
      expect(style.libelle.trim().length).toBeGreaterThan(2);
      expect(style.description.trim().length).toBeGreaterThan(5);
      // Prompt Suno : tags anglais courts, ASCII, séparés par des virgules, ≤ 1 000.
      expect(style.prompt).toMatch(/^[a-z0-9 ,&-]+$/);
      expect(style.prompt.split(',').length).toBeGreaterThanOrEqual(4);
      expect(style.prompt.length).toBeLessThanOrEqual(LIMITES_SUNO.style);
      expect(style.negativeTags).toMatch(/^[a-z0-9 ,-]+$/);
      expect(style.negativeTags.length).toBeLessThanOrEqual(LIMITES_SUNO.negativeTags);
      // Aucune exclusion contradictoire avec le style (un tag négatif entièrement contenu dans le prompt).
      expect(construireNegativeTags(style)).toBe(construireNegativeTags(style, undefined));
      const motsStyle = new Set(style.prompt.split(/[^a-z0-9&]+/));
      for (const tag of construireNegativeTags(style).split(', ')) {
        const mots = tag.split(' ');
        expect(mots.every((m) => motsStyle.has(m))).toBe(false);
      }
    }
    for (const attendu of ['rap-francais', 'pop', 'lofi', 'chanson-francaise', 'afrobeat', 'rock', 'jazz', 'reggae', 'electro', 'rnb', 'acoustique', 'comptine']) {
      expect(slugs).toContain(attendu);
    }
  });

  it('résout les anciens identifiants et rejette les inconnus', () => {
    expect(trouverStyle('pop-francaise')?.slug).toBe('pop');
    expect(trouverStyle('lofi-piano')?.slug).toBe('lofi');
    expect(trouverStyle('RAP-PEDAGOGIQUE')?.slug).toBe('rap-francais');
    expect(trouverStyle('inconnu')).toBeNull();
    expect(resoudreStyle('inconnu').slug).toBe('pop');
    expect(resoudreStyle(undefined).slug).toBe('pop');
    expect(normaliserSlugStyle('jazz-manouche')).toBe('jazz');
    expect(normaliserSlugStyle('n-existe-pas')).toBe('');
    expect(estStyleActuel('pop-francaise')).toBe(false);
    expect(estStyleActuel('pop')).toBe(true);
  });

  it('construit un style Suno propre (tags anglais, voix, langue)', () => {
    const style = construireStyle(resoudreStyle('rap-francais'), { genreVocal: 'm', langue: 'fr' });
    expect(style).toBe('french rap, boom bap beat, punchy flow, 92 bpm, educational, catchy hook, clear male vocals, french lyrics');
    expect(construireStyle(resoudreStyle('jazz'), { genreVocal: 'f' })).toContain('clear female vocals');
    expect(construireStyle(resoudreStyle('jazz'))).toContain('clear vocals');
    expect(construireStyle(resoudreStyle('pop'), { langue: 'en' })).not.toContain('french lyrics');
  });

  it("ajoute les exclusions de l'utilisateur sans contredire le style", () => {
    const rock = resoudreStyle('rock');
    const tags = construireNegativeTags(rock, 'autotune, electric guitars, ROCK, screaming');
    expect(tags).toContain('autotune');
    expect(tags).not.toContain('electric guitars');
    expect(tags).not.toMatch(/\brock\b/i);
    expect(tags.split(', ').filter((t) => t === 'screaming')).toHaveLength(1);
  });
});

describe('durée explicite demandée à Suno', () => {
  it('calcule lignes chantées × 4,5 s + 15 s, bornée à 90–300 s (jamais les 20 s par défaut)', () => {
    const paroles = parolesTest(40).join('\n');
    expect(compterLignesChantees(paroles)).toBe(40);
    expect(calculerDureeSecondes(paroles)).toBe(Math.round(40 * DUREE_CHANSON.parLigne + DUREE_CHANSON.marge)); // 195
    expect(calculerDureeSecondes('[Refrain]\nune seule ligne')).toBe(DUREE_CHANSON.min);
    expect(calculerDureeSecondes(parolesTest(120).join('\n'))).toBe(DUREE_CHANSON.max);
    expect(calculerDureeSecondes('')).toBe(DUREE_CHANSON.min);
  });

  it('respecte une durée demandée valide, bornée, et ignore une durée aberrante', () => {
    const paroles = parolesTest(40).join('\n');
    expect(calculerDureeSecondes(paroles, 240)).toBe(240);
    expect(calculerDureeSecondes(paroles, 600)).toBe(195); // > 360 s : ignorée → calcul
    expect(calculerDureeSecondes(paroles, 30)).toBe(90);   // valide pour Suno mais sous notre minimum
    expect(calculerDureeSecondes(paroles, 350)).toBe(300);
    expect(calculerDureeSecondes(paroles, Number.NaN)).toBe(195);
  });
});

describe('paroles : normalisation et troncature', () => {
  it('ne coupe rien sous 5 000 caractères', () => {
    const r = tronquerParoles(parolesTest(60));
    expect(r.tronque).toBe(false);
    expect(r.lignesRetirees).toBe(0);
    expect(r.texte.split('\n')).toHaveLength(60 + 8);
  });

  it('coupe à la fin d’une ligne complète, sous la limite, en comptant les lignes retirées', () => {
    const lignes = parolesTest(120, 60);
    const r = tronquerParoles(lignes);
    expect(r.tronque).toBe(true);
    expect(r.texte.length).toBeLessThanOrEqual(LIMITES_SUNO.paroles);
    const gardees = r.texte.split('\n');
    // Chaque ligne conservée est une ligne d'origine entière.
    for (const l of gardees) expect(lignes).toContain(l);
    // Pas de balise orpheline en fin de texte.
    expect(gardees[gardees.length - 1]).not.toMatch(/^\[.*\]$/);
    expect(r.lignesRetirees).toBe(120 - compterLignesChantees(r.texte));
    expect(r.lignesRetirees).toBeGreaterThan(0);
  });

  it('normalise CRLF, espaces de fin et lignes vides multiples', () => {
    expect(tronquerParoles('a  \r\n\r\n\r\n\r\nb\r\n').texte).toBe('a\n\nb');
  });
});

describe('titre de la chanson', () => {
  it('= code · intitulé court de l’item + rang, ≤ 80 caractères', () => {
    const titre = 'Le raisonnement et la décision en médecine. La médecine fondée sur les preuves (Evidence Based Medicine, EBM). La décision médicale partagée. La controverse';
    expect(intituleCourtItem(titre)).toBe('Le raisonnement et la décision en médecine');
    const t = construireTitre('IC-3', titre, 'A');
    expect(t).toBe('IC-3 · Le raisonnement et la décision en médecine — Rang A');
    expect(t.length).toBeLessThanOrEqual(LIMITES_SUNO.titre);
    expect(construireTitre('ic-8', 'Les discriminations', 'AB')).toBe('IC-8 · Les discriminations — Rang A+B');
    expect(construireTitre('IC-1', 'A'.repeat(200), 'B').length).toBeLessThanOrEqual(LIMITES_SUNO.titre);
    expect(construireTitre('IC-1', 'A'.repeat(200), 'B')).toMatch(/— Rang B$/);
    expect(construireTitre('IC-12', null, 'A')).toBe('IC-12 — Rang A');
  });
});

describe('construireRequeteSuno (charge utile /generate)', () => {
  const base = {
    paroles: parolesTest(40),
    style: 'rap-francais',
    rang: 'A',
    codeItem: 'IC-3',
    titreItem: 'Le raisonnement et la décision en médecine. La suite.',
    modele: 'V6' as const,
    callBackUrl: 'https://exemple.supabase.co/functions/v1/mm-suno-callback',
  };

  it('envoie les paroles dans `lyrics` (jamais `prompt`), V6, durée explicite, défauts 0,7 / 0,3 / 1', () => {
    const { chargeUtile, rang, style } = construireRequeteSuno(base);
    expect(chargeUtile).not.toHaveProperty('prompt');
    expect(chargeUtile.lyrics).toBe(parolesTest(40).join('\n'));
    expect(chargeUtile.customMode).toBe(true);
    expect(chargeUtile.instrumental).toBe(false);
    expect(chargeUtile.model).toBe('V6');
    expect(chargeUtile.callBackUrl).toBe(base.callBackUrl);
    expect(chargeUtile.duration).toBe(195);
    expect(chargeUtile.styleWeight).toBe(POIDS_PAR_DEFAUT.styleWeight);
    expect(chargeUtile.weirdnessConstraint).toBe(POIDS_PAR_DEFAUT.weirdnessConstraint);
    expect(chargeUtile.variety).toBe(1);
    expect(chargeUtile.vocalGender).toBeUndefined();
    expect(chargeUtile.title).toBe('IC-3 · Le raisonnement et la décision en médecine — Rang A');
    expect(chargeUtile.style).toContain('french rap');
    expect(chargeUtile.style).toContain('clear vocals');
    expect(chargeUtile.negativeTags).toContain('mumbled vocals');
    expect(chargeUtile.negativeTags).toContain('heavy metal');
    expect(rang).toBe('A');
    expect(style.slug).toBe('rap-francais');
  });

  it('transmet voix, exclusions, poids (0–1 ou 0–100) et une durée demandée', () => {
    const { chargeUtile } = construireRequeteSuno({
      ...base,
      rang: 'ab',
      genreVocal: 'female',
      negativeTags: 'autotune, Heavy Metal',
      styleWeight: 85,
      weirdnessConstraint: 0.456,
      variety: 2,
      dureeDemandee: 180,
    });
    expect(chargeUtile.vocalGender).toBe('f');
    expect(chargeUtile.style).toContain('clear female vocals');
    expect(chargeUtile.negativeTags.split(', ').filter((t) => t.toLowerCase() === 'heavy metal')).toHaveLength(1);
    expect(chargeUtile.negativeTags).toContain('autotune');
    expect(chargeUtile.styleWeight).toBe(0.85);
    expect(chargeUtile.weirdnessConstraint).toBe(0.46);
    expect(chargeUtile.variety).toBe(2);
    expect(chargeUtile.duration).toBe(180);
    expect(chargeUtile.title).toMatch(/— Rang A\+B$/);
  });

  it('respecte les limites V6 : paroles coupées à 5 000 à la fin d’une ligne, style/titre bornés', () => {
    const r = construireRequeteSuno({ ...base, paroles: parolesTest(130), negativeTags: 'x'.repeat(1500) });
    expect(r.paroles.tronque).toBe(true);
    expect(r.chargeUtile.lyrics.length).toBeLessThanOrEqual(LIMITES_SUNO.paroles);
    expect(r.chargeUtile.lyrics.endsWith('\n')).toBe(false);
    expect(r.chargeUtile.negativeTags.length).toBeLessThanOrEqual(LIMITES_SUNO.negativeTags);
    expect(r.chargeUtile.title.length).toBeLessThanOrEqual(LIMITES_SUNO.titre);
    expect(r.chargeUtile.style.length).toBeLessThanOrEqual(LIMITES_SUNO.style);
    expect(r.chargeUtile.duration).toBe(300);
  });

  it('remplace un style inconnu ou ancien et signale le remplacement', () => {
    expect(construireRequeteSuno({ ...base, style: 'pop-francaise' }).style.slug).toBe('pop');
    const r = construireRequeteSuno({ ...base, style: 'style-cassé' });
    expect(r.style.slug).toBe('pop');
    expect(r.styleRemplace).toBe(true);
    expect(construireRequeteSuno(base).styleRemplace).toBe(false);
  });

  it('refuse des paroles vides', () => {
    expect(() => construireRequeteSuno({ ...base, paroles: '[Refrain]\n\n' })).toThrow('PAROLES_VIDES');
  });
});

describe('modèle, voix, poids', () => {
  it('impose V6 par défaut et n’accepte que les modèles autorisés', () => {
    expect(choisirModeleSuno(undefined)).toBe('V6');
    expect(choisirModeleSuno('v6_mini')).toBe('V6_MINI');
    expect(choisirModeleSuno('V6_WILD')).toBe('V6_WILD');
    expect(choisirModeleSuno('V4_5ALL')).toBe('V4_5ALL');
    expect(choisirModeleSuno('V5')).toBe('V6');
    expect(choisirModeleSuno('V4')).toBe('V6');
  });

  it('normalise le genre vocal et les poids', () => {
    expect(normaliserGenreVocal('male')).toBe('m');
    expect(normaliserGenreVocal('F')).toBe('f');
    expect(normaliserGenreVocal('mixed')).toBeUndefined();
    expect(normaliserPoids(0.333, 0.7)).toBe(0.33);
    expect(normaliserPoids(50, 0.7)).toBe(0.5);
    expect(normaliserPoids(-1, 0.7)).toBe(0.7);
    expect(normaliserPoids('x', 0.3)).toBe(0.3);
  });
});

describe('réponses Suno → messages utilisateur en français', () => {
  it('accepte une génération (HTTP 200, code 200, taskId)', () => {
    expect(interpreterReponseGenerate(200, { code: 200, msg: 'success', data: { taskId: 'abc' } })).toBeNull();
  });

  it('traduit les refus sans jamais exposer le message brut', () => {
    const cas: Array<[number, unknown, string, number]> = [
      [400, { code: 400, msg: 'style too long' }, 'CONTENU_REFUSE', 422],
      [200, { code: 429, msg: 'insufficient credits' }, 'SERVICE_SATURE', 503],
      [402, { code: 402, msg: 'payment required' }, 'SERVICE_SATURE', 503],
      [430, { code: 430, msg: 'rate' }, 'TROP_DE_DEMANDES', 429],
      [455, null, 'MAINTENANCE', 503],
      [500, { code: 500, msg: 'boom' }, 'SERVICE_INDISPONIBLE', 502],
      [200, { code: 200, data: {} }, 'SERVICE_INDISPONIBLE', 502],
    ];
    for (const [http, corps, code, statut] of cas) {
      const e = interpreterReponseGenerate(http, corps);
      expect(e?.code).toBe(code);
      expect(e?.statut).toBe(statut);
      expect(e?.message).not.toMatch(/credits|payment|boom|too long|suno/i);
      expect(e?.message).toMatch(/[éèêà]/); // français
    }
  });
});

describe('callbacks Suno', () => {
  const piste = {
    id: '8551****662c',
    audio_url: 'https://cdn1.suno.ai/8551.mp3',
    source_audio_url: 'https://audiopipe.suno.ai/?item_id=8551',
    stream_audio_url: 'https://cdn1.suno.ai/8551-stream.mp3',
    source_stream_audio_url: '',
    image_url: 'https://cdn2.suno.ai/8551.jpeg',
    source_image_url: '',
    prompt: '[Verse] ...',
    model_name: 'chirp-v6',
    title: 'IC-3 · … — Rang A',
    tags: 'french rap',
    createTime: '2026-09-25T10:00:00.000Z',
    duration: 198.44,
  };

  it('lit un callback « complete » et normalise les pistes', () => {
    const c = interpreterCallbackSuno({ code: 200, msg: 'All generated successfully.', data: { callbackType: 'complete', task_id: 'task-1', data: [piste, { ...piste, id: 'p2', audio_url: '' }] } });
    expect(c.echec).toBe(false);
    expect(c.type).toBe('complete');
    expect(c.taskId).toBe('task-1');
    expect(c.pistes).toHaveLength(2);
    expect(c.pistes[0].audioUrl).toBe('https://cdn1.suno.ai/8551.mp3');
    expect(c.pistes[0].streamUrl).toBe('https://cdn1.suno.ai/8551-stream.mp3');
    expect(c.pistes[0].duration).toBe(198.44);
    expect(c.pistes[1].audioUrl).toBe('https://audiopipe.suno.ai/?item_id=8551'); // repli source_audio_url
  });

  it('marque en échec un code ≠ 200 ou un callbackType « error », avec un message français', () => {
    const refus = interpreterCallbackSuno({ code: 400, msg: 'Content moderation', data: { callbackType: 'error', task_id: 'task-2', data: null } });
    expect(refus.echec).toBe(true);
    expect(refus.taskId).toBe('task-2');
    expect(refus.message).toMatch(/refusée/);
    expect(refus.message).not.toMatch(/moderation/i);
    expect(interpreterCallbackSuno({ code: 451, data: { callbackType: 'complete', task_id: 't', data: [] } }).echec).toBe(true);
    expect(interpreterCallbackSuno({ code: 500, data: { callbackType: 'error', task_id: 't' } }).message).toMatch(/pas décomptée/);
    const texte = interpreterCallbackSuno({ code: 200, data: { callbackType: 'text', task_id: 't', data: [{ ...piste, audio_url: '', source_audio_url: '' }] } });
    expect(texte.echec).toBe(false);
    expect(texte.pistes[0].audioUrl).toBeNull();
  });

  it('lit record-info (rattrapage) : SUCCESS → completed, SENSITIVE_WORD_ERROR → failed', () => {
    const ok = interpreterRecordInfoSuno({ code: 200, data: { taskId: 't', status: 'SUCCESS', response: { sunoData: [{ id: 'x', audioUrl: 'https://cdn1.suno.ai/x.mp3', streamAudioUrl: 'https://s', imageUrl: 'https://i', duration: 120.5, modelName: 'chirp-v6' }] } } });
    expect(ok.statut).toBe('completed');
    expect(ok.pistes[0].audioUrl).toBe('https://cdn1.suno.ai/x.mp3');
    expect(ok.pistes[0].modelName).toBe('chirp-v6');
    const ko = interpreterRecordInfoSuno({ code: 200, data: { status: 'SENSITIVE_WORD_ERROR', errorCode: 400, errorMessage: 'bad words' } });
    expect(ko.statut).toBe('failed');
    expect(ko.message).toMatch(/refusée/);
    expect(interpreterRecordInfoSuno({ code: 200, data: { status: 'PENDING' } }).statut).toBe('generating');
    expect(interpreterRecordInfoSuno({ code: 200, data: { status: 'SUCCESS', response: { sunoData: [{ id: 'x' }] } } }).statut).toBe('generating');
  });
});

describe('front : paroles par rang et corps de requête', () => {
  const item = {
    item_code: 'IC-3',
    title: 'Le raisonnement et la décision en médecine',
    paroles_rang_a: ['[Couplet 1]', 'Vers A1.', 'Vers A2.'],
    paroles_rang_b: ['[Couplet 1]', 'Vers B1.'],
    paroles_rang_ab: [] as string[],
    paroles_musicales: ['[Couplet 1]', 'Legacy 1.'],
  };

  it('envoie les paroles du rang choisi (A seul, B seul, A+B)', () => {
    expect(parolesPourRang(item, 'A')).toEqual(item.paroles_rang_a);
    expect(parolesPourRang(item, 'B')).toEqual(item.paroles_rang_b);
    expect(parolesPourRang(item, 'AB')).toEqual([...item.paroles_rang_a, ...item.paroles_rang_b]);
    expect(parolesPourRang({ ...item, paroles_rang_ab: ['[Refrain]', 'AB.'] }, 'AB')).toEqual(['[Refrain]', 'AB.']);
    // Rang B sans paroles B : rien (jamais les paroles A sous un titre « Rang B »).
    expect(parolesPourRang({ ...item, paroles_rang_b: [] }, 'B')).toEqual([]);
    // Rang A sans paroles A : repli sur paroles_musicales (historiquement = rang A).
    expect(parolesPourRang({ ...item, paroles_rang_a: [] }, 'A')).toEqual(item.paroles_musicales);
    expect(parolesPourRang(null, 'A')).toEqual([]);
  });

  it('prépare les paroles sans les couper avant 5 000 caractères, avec la durée estimée', () => {
    const preparees = validateGenerationInput(parolesTest(60), 'pop', 'A');
    expect(preparees.tronque).toBe(false);
    expect(preparees.texte.length).toBeGreaterThan(2800);
    expect(preparees.dureeEstimee).toBe(285);
    expect(() => validateGenerationInput([], 'pop', 'B')).toThrow(/rang B/);
    expect(() => validateGenerationInput(['x'], '', 'A')).toThrow(/style/);
  });

  it('construit un corps de requête minimal : pas de modèle, pas de titre, poids en 0–1', () => {
    const corps = createRequestBody('paroles', 'jazz', 'AB', 'fr', 'IC-3', 'Titre officiel', {
      vocalGender: 'm',
      negativeTags: ' autotune ',
      styleWeight: 85,
      weirdnessConstraint: 30,
    });
    expect(corps).toEqual({
      lyrics: 'paroles',
      style: 'jazz',
      rang: 'AB',
      itemCode: 'IC-3',
      itemTitle: 'Titre officiel',
      language: 'fr',
      vocalGender: 'm',
      negativeTags: 'autotune',
      styleWeight: 0.85,
      weirdnessConstraint: 0.3,
    });
    expect(corps).not.toHaveProperty('model');
    expect(corps).not.toHaveProperty('duration');
    expect(createRequestBody('p', 'pop', 'A', 'fr', 'IC-1')).toEqual({ lyrics: 'p', style: 'pop', rang: 'A', itemCode: 'IC-1', itemTitle: undefined, language: 'fr' });
  });
});
