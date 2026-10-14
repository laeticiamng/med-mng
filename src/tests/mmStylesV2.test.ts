/**
 * Catalogue de styles musicaux v2 : préparé, NON activé (supabase/functions/_shared/mm-styles-v2.ts).
 * Tests déterministes : aucun réseau, aucun appel à Suno.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  LIMITES_SUNO,
  MODELE_SUNO_DEFAUT,
  STYLES_MUSICAUX,
  construireNegativeTags,
  construireRequeteSuno,
  construireStyle,
  normaliserTags,
  resoudreStyle,
  type StyleMusical,
} from '../../supabase/functions/_shared/mm-suno-requete.ts';
import {
  CATALOGUE_V2_ACTIF,
  SLUGS_ACTUELS_13,
  SLUGS_NOUVEAUX_7,
  STYLES_MUSICAUX_V2,
  STYLES_V2_ACTIVABLES,
  composerPromptStructure,
  negatifsContradictoires,
  obtenirCatalogueActif,
  resoudreStyleActif,
  similaritePrompts,
} from '../../supabase/functions/_shared/mm-styles-v2.ts';
import {
  PAROLES_COMPARAISON,
  URL_RAPPEL_FICTIVE,
  construireRequetesABC,
  documentRequetesABC,
} from '../../scripts/musique/comparaison-abc';

const RACINE = resolve(__dirname, '../..');

/** Les 13 slugs en production aujourd'hui (préférences et chansons déjà enregistrées). */
const SLUGS_13 = [
  'rap-francais',
  'pop',
  'lofi',
  'chanson-francaise',
  'afrobeat',
  'rock',
  'jazz',
  'reggae',
  'electro',
  'rnb',
  'acoustique',
  'comptine',
  'slam',
];

/** Catalogue actif actuel, figé : prompts et exclusions (retour arrière = ces valeurs). */
const ACTUEL: ReadonlyArray<[string, string, string]> = [
  [
    'rap-francais',
    'french rap, boom bap beat, punchy flow, 92 bpm, educational, catchy hook',
    'screaming, distorted vocals, mumbled vocals, off-key vocals, harsh noise, heavy metal, opera',
  ],
  [
    'pop',
    'french pop, upbeat, bright synths, catchy chorus, 112 bpm, radio friendly',
    'screaming, distorted vocals, mumbled vocals, off-key vocals, harsh noise, heavy metal, screamo',
  ],
];
const HASH_CATALOGUE_ACTUEL =
  '239744c4fb24d084d6d0e244a2297da6570ded1f784486bf94651a1ce69bcbc8';

/** Ambiance libre la plus longue possible : 12 tags de 40 caractères (mm-ambiance.ts). */
const AMBIANCE_MAX = Array.from(
  { length: 12 },
  (_, i) => `tag${String.fromCharCode(97 + i)}${'x'.repeat(36)}`
).join(', ');

const voixDe = (g: 'm' | 'f' | undefined) =>
  g === 'm'
    ? 'clear male vocals'
    : g === 'f'
      ? 'clear female vocals'
      : 'clear vocals';

describe('catalogue v2 : slugs', () => {
  it('conserve les 13 slugs actuels, dans le même ordre, avec libellé, description, énergie et tempo identiques', () => {
    expect(STYLES_MUSICAUX.map((s) => s.slug)).toEqual(SLUGS_13);
    expect([...SLUGS_ACTUELS_13]).toEqual(SLUGS_13);
    expect(STYLES_MUSICAUX_V2.slice(0, 13).map((s) => s.slug)).toEqual(
      SLUGS_13
    );
    STYLES_MUSICAUX.forEach((v1, i) => {
      const v2 = STYLES_MUSICAUX_V2[i];
      expect(v2.libelle).toBe(v1.libelle);
      expect(v2.description).toBe(v1.description);
      expect(v2.energie).toBe(v1.energie);
      expect(v2.prompt).toContain(`${/(\d+) bpm/.exec(v1.prompt)![1]} bpm`);
    });
  });

  it('compte 20 slugs uniques : les 13 actuels + trap, neo-soul, amapiano, zouk-kompa, house, reggaeton, funk', () => {
    const slugs = STYLES_MUSICAUX_V2.map((s) => s.slug);
    expect(slugs).toHaveLength(20);
    expect(new Set(slugs).size).toBe(20);
    expect(slugs.slice(13)).toEqual([
      'trap',
      'neo-soul',
      'amapiano',
      'zouk-kompa',
      'house',
      'reggaeton',
      'funk',
    ]);
    expect([...SLUGS_NOUVEAUX_7]).toEqual(slugs.slice(13));
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
});

describe('catalogue v2 : prompts structurés', () => {
  it.each(STYLES_MUSICAUX_V2.map((s) => [s.slug, s] as const))(
    '%s : prompt composé, ordonné, concis, sans doublon',
    (_slug, s) => {
      expect(s.version).toBe('v2');
      expect(s.prompt).toBe(composerPromptStructure(s));
      const tags = s.prompt.split(', ');
      expect(tags[0]).toBe(s.genrePrincipal);
      expect(tags[tags.length - 1]).toBe(`${s.tempoBpm} bpm`);
      expect(tags).toContain(s.voixRecommandee);
      // Ordre : genre → influences → instruments → groove → voix → tempo.
      const pos = (t: string) => tags.indexOf(t);
      expect(pos(s.influences[0])).toBe(1);
      expect(pos(s.instrumentsDominants[0])).toBeGreaterThan(
        pos(s.influences[s.influences.length - 1])
      );
      expect(pos(s.instrumentsSecondaires[0])).toBeGreaterThan(
        pos(s.instrumentsDominants[s.instrumentsDominants.length - 1])
      );
      expect(pos(s.groove[0])).toBeGreaterThan(
        pos(s.instrumentsSecondaires[s.instrumentsSecondaires.length - 1])
      );
      expect(pos(s.voixRecommandee)).toBeGreaterThan(
        pos(s.groove[s.groove.length - 1])
      );
      expect(new Set(tags.map((t) => t.toLowerCase())).size).toBe(tags.length);
      expect(tags.length).toBeGreaterThanOrEqual(10);
      expect(tags.length).toBeLessThanOrEqual(18);
      // Même alphabet que le catalogue actuel : tags anglais, minuscules, ASCII.
      expect(s.prompt).toMatch(/^[a-z0-9 ,&-]+$/);
      // « Pas de mur de texte » + budget de l'ambiance maximale (voir l'en-tête du module).
      expect(s.prompt.length).toBeLessThanOrEqual(450);
      expect(s.tempoBpm).toBeGreaterThanOrEqual(70);
      expect(s.tempoBpm).toBeLessThanOrEqual(150);
      // Champs d'identité renseignés ; aucun genre vocal « conseillé » sans écoute.
      for (const champ of [
        s.influences,
        s.instrumentsDominants,
        s.instrumentsSecondaires,
        s.groove,
      ])
        expect(champ.length).toBeGreaterThan(0);
      expect(s.vocalGenderConseille).toBeUndefined();
      expect(s.libelle.trim().length).toBeGreaterThan(2);
      expect(s.description.trim().length).toBeGreaterThan(5);
      expect(s.noteDistinction.length).toBeGreaterThan(10);
    }
  );

  it('chaque style est distinct : genres principaux uniques et recouvrement lexical limité', () => {
    const genres = STYLES_MUSICAUX_V2.map((s) => s.genrePrincipal);
    expect(new Set(genres).size).toBe(20);
    for (let i = 0; i < STYLES_MUSICAUX_V2.length; i++) {
      for (let j = i + 1; j < STYLES_MUSICAUX_V2.length; j++) {
        const a = STYLES_MUSICAUX_V2[i];
        const b = STYLES_MUSICAUX_V2[j];
        expect(
          similaritePrompts(a.prompt, b.prompt),
          `${a.slug} / ${b.slug}`
        ).toBeLessThan(0.45);
      }
    }
  });

  it('signale les voisins : neo-soul déconseillé (≈ rnb), 4 recommandés, house et trap à évaluer', () => {
    const reco = Object.fromEntries(
      STYLES_MUSICAUX_V2.map((s) => [s.slug, s.recommandation])
    );
    expect(reco['neo-soul']).toBe('deconseille');
    for (const slug of ['amapiano', 'zouk-kompa', 'reggaeton', 'funk'])
      expect(reco[slug]).toBe('recommande');
    expect(reco.house).toBe('a_evaluer');
    expect(reco.trap).toBe('a_evaluer');
    for (const slug of SLUGS_13) expect(reco[slug]).toBe('a_evaluer');
    const parSlug = (slug: string) =>
      STYLES_MUSICAUX_V2.find((s) => s.slug === slug)!;
    expect(parSlug('neo-soul').proches).toContain('rnb');
    expect(parSlug('trap').proches).toContain('rap-francais');
    expect(parSlug('house').proches).toContain('electro');
    expect(parSlug('amapiano').proches).toContain('afrobeat');
    expect(parSlug('zouk-kompa').proches).toContain('afrobeat');
    // La direction de référence « afrofusion » mélange amapiano, kompa, zouk, makossa, bikutsi : v2 la recentre.
    const afro = parSlug('afrobeat');
    expect(afro.promptReference).toMatch(/Amapiano/);
    expect(afro.prompt).not.toMatch(/amapiano|kompa|zouk|makossa|bikutsi/);
    expect(parSlug('zouk-kompa').prompt).not.toMatch(/afro/);
  });
});

describe('catalogue v2 : longueurs et troncature (voix, suffixes, ambiance maximale)', () => {
  const cas = STYLES_MUSICAUX_V2.flatMap((s) =>
    (['m', 'f', undefined] as const).map(
      (g) => [`${s.slug}/${g ?? 'libre'}`, s, g] as const
    )
  );

  it.each(cas)(
    '%s : style final ≤ 1 000 caractères et AUCUN tag perdu',
    (_nom, s, genre) => {
      for (const [nom, prompt] of [
        ['v2', s.prompt],
        ['référence B', s.promptReference],
      ] as const) {
        const style: StyleMusical = { ...s, prompt };
        const attendus = normaliserTags(
          `${prompt}, ${voixDe(genre)}, french lyrics`
        );
        const final = construireStyle(style, {
          genreVocal: genre,
          langue: 'fr',
        });
        expect(final.length, nom).toBeLessThanOrEqual(LIMITES_SUNO.style);
        expect(final.split(', '), nom).toEqual(attendus);
        // Avec l'ambiance maximale, rien n'est coupé non plus (la queue — voix, langue — serait perdue en premier).
        const avecAmbiance = construireStyle(style, {
          genreVocal: genre,
          langue: 'fr',
          ambianceTags: AMBIANCE_MAX,
        });
        expect(
          avecAmbiance.length,
          `${nom} + ambiance max`
        ).toBeLessThanOrEqual(LIMITES_SUNO.style);
        expect(avecAmbiance, `${nom} + ambiance max`).toContain(voixDe(genre));
        expect(
          avecAmbiance.endsWith('french lyrics'),
          `${nom} + ambiance max`
        ).toBe(true);
        expect(avecAmbiance.split(', ').length, nom).toBe(attendus.length + 12);
      }
    }
  );

  it('la charge utile complète respecte toutes les limites du fournisseur (20 styles via un catalogue v2 simulé)', () => {
    for (const s of STYLES_MUSICAUX_V2) {
      const r = construireRequeteSuno({
        paroles: [...PAROLES_COMPARAISON],
        style: 'pop',
        modele: MODELE_SUNO_DEFAUT,
        callBackUrl: URL_RAPPEL_FICTIVE,
        genreVocal: 'f',
      });
      const final = construireStyle(s, { genreVocal: 'f', langue: 'fr' });
      expect(final.length).toBeLessThanOrEqual(LIMITES_SUNO.style);
      expect(construireNegativeTags(s).length).toBeLessThanOrEqual(
        LIMITES_SUNO.negativeTags
      );
      expect(r.chargeUtile.title.length).toBeLessThanOrEqual(
        LIMITES_SUNO.titre
      );
      expect(r.paroles.tronque).toBe(false);
    }
  });
});

describe('catalogue v2 : exclusions (negativeTags)', () => {
  it.each(STYLES_MUSICAUX_V2.map((s) => [s.slug, s] as const))(
    '%s : aucune exclusion contradictoire, rien de retiré ni de coupé',
    (_slug, s) => {
      expect(negatifsContradictoires(s)).toEqual([]);
      expect(s.negativeTags).toMatch(/^[a-z0-9 ,-]+$/);
      expect(s.negativeTags.length).toBeLessThanOrEqual(
        LIMITES_SUNO.negativeTags
      );
      expect(s.tagsIncompatibles.length).toBeGreaterThanOrEqual(5);
      // Le filtre de production (tags entièrement contenus dans le prompt) ne retire rien…
      expect(construireNegativeTags(s)).toBe(
        normaliserTags(s.negativeTags).join(', ')
      );
      // … ni contre la direction de référence B.
      expect(construireNegativeTags({ ...s, prompt: s.promptReference })).toBe(
        normaliserTags(s.negativeTags).join(', ')
      );
      // Exclusions communes toujours présentes.
      for (const t of [
        'screaming',
        'distorted vocals',
        'mumbled vocals',
        'off-key vocals',
        'harsh noise',
      ])
        expect(s.negativeTags).toContain(t);
    }
  );

  it('les 13 styles actuels gardent leurs exclusions actuelles en tête (v2 = actuel + ajouts)', () => {
    STYLES_MUSICAUX.forEach((v1, i) =>
      expect(
        STYLES_MUSICAUX_V2[i].negativeTags.startsWith(v1.negativeTags)
      ).toBe(true)
    );
  });

  it('un style ne s’exclut pas lui-même (reggae garde « dub », électro/house/trap gardent le vocodeur possible)', () => {
    const s = (slug: string) =>
      STYLES_MUSICAUX_V2.find((x) => x.slug === slug)!;
    expect(s('reggae').prompt).toContain('dub');
    expect(s('reggae').negativeTags).not.toMatch(/dub/);
    for (const slug of ['electro', 'house', 'trap'])
      expect(s(slug).negativeTags).not.toContain('robotic');
    expect(s('rap-francais').negativeTags).not.toMatch(
      /(^|, )(rap|hip hop|boom bap)(,|$)/
    );
    expect(
      negatifsContradictoires({
        negativeTags: 'dub, heavy metal',
        tagsIncompatibles: ['dub'],
      })
    ).toEqual(['dub']);
    expect(
      negatifsContradictoires({
        negativeTags: 'trap hi-hats',
        tagsIncompatibles: ['rap'],
      })
    ).toEqual([]);
  });
});

describe('point de bascule : drapeau à false → catalogue actif inchangé', () => {
  it('le drapeau exporté est false et renvoie le catalogue actuel, même référence, octet pour octet', () => {
    expect(CATALOGUE_V2_ACTIF).toBe(false);
    expect(obtenirCatalogueActif()).toBe(STYLES_MUSICAUX);
    expect(obtenirCatalogueActif(false)).toBe(STYLES_MUSICAUX);
    expect(STYLES_MUSICAUX).toHaveLength(13);
    expect(
      createHash('sha256').update(JSON.stringify(STYLES_MUSICAUX)).digest('hex')
    ).toBe(HASH_CATALOGUE_ACTUEL);
    for (const [slug, prompt, negatifs] of ACTUEL) {
      const s = STYLES_MUSICAUX.find((x) => x.slug === slug)!;
      expect(s.prompt).toBe(prompt);
      expect(s.negativeTags).toBe(negatifs);
    }
    // Aucun champ v2 n'a fuité dans le catalogue actuel.
    for (const s of STYLES_MUSICAUX)
      expect(Object.keys(s).sort()).toEqual([
        'description',
        'energie',
        'libelle',
        'negativeTags',
        'prompt',
        'slug',
      ]);
  });

  it('à false, la résolution est exactement celle d’aujourd’hui (slug exact, alias, inconnu → pop)', () => {
    const entrees = [
      ...SLUGS_13,
      ...SLUGS_NOUVEAUX_7,
      'POP',
      ' Rap-Francais ',
      'rap-pedagogique',
      'pop-francaise',
      'trap-francais',
      'deep-house',
      'house-francaise',
      'dancehall',
      'educatif-medical',
      'inconnu',
      '',
      '   ',
      undefined,
      null,
      'zouk',
      'reggaeton-x',
    ];
    for (const e of entrees) {
      expect(resoudreStyleActif(e)).toBe(resoudreStyle(e));
      expect(resoudreStyleActif(e, false)).toBe(resoudreStyle(e));
    }
    expect(resoudreStyleActif('inconnu').slug).toBe('pop');
    // Les nouveaux slugs « trap », « house »… ne sont PAS résolus tant que le drapeau est à false.
    expect(resoudreStyleActif('amapiano').slug).toBe('pop');
    expect(resoudreStyleActif('neo-soul').slug).toBe('rnb'); // alias actuel
    expect(resoudreStyleActif('funk').slug).toBe('rnb'); // alias actuel
  });

  it('à true (simulation) : 19 styles activables, repli identique pour un slug inconnu, alias conservés', () => {
    expect(obtenirCatalogueActif(true)).toBe(STYLES_V2_ACTIVABLES);
    expect(STYLES_V2_ACTIVABLES).toHaveLength(19);
    expect(STYLES_V2_ACTIVABLES.map((s) => s.slug)).not.toContain('neo-soul');
    expect(resoudreStyleActif('inconnu', true).slug).toBe('pop');
    expect(resoudreStyleActif(undefined, true).slug).toBe('pop');
    expect(resoudreStyleActif('pop-francaise', true).slug).toBe('pop');
    expect(resoudreStyleActif('trap-francais', true).slug).toBe('rap-francais'); // alias actuel conservé
    expect(resoudreStyleActif('funk', true).slug).toBe('funk');
    expect(resoudreStyleActif('neo-soul', true).slug).toBe('rnb'); // non activable → alias actuel
    expect(resoudreStyleActif('rap-francais', true).prompt).toBe(
      STYLES_MUSICAUX_V2[0].prompt
    );
    // Tout slug actuel et tout alias actuel reste résolu vers un style v2 portant le même slug que dans le catalogue actuel.
    for (const e of [
      ...SLUGS_13,
      'pop-francaise',
      'lofi-piano',
      'jazz-manouche',
      'dancehall',
      'techno',
      'synthwave',
    ]) {
      expect(resoudreStyleActif(e, true).slug).toBe(resoudreStyle(e).slug);
    }
  });

  it('le module v2 n’est importé par aucun fichier de production (ni serveur ni interface)', () => {
    const importeurs: string[] = [];
    const parcourir = (dossier: string) => {
      for (const e of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, e.name);
        if (e.isDirectory()) {
          if (e.name !== 'node_modules') parcourir(chemin);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(e.name) || /\.test\.tsx?$/.test(e.name))
          continue;
        if (readFileSync(chemin, 'utf8').includes('mm-styles-v2'))
          importeurs.push(chemin.replace(`${RACINE}/`, ''));
      }
    };
    parcourir(join(RACINE, 'src'));
    parcourir(join(RACINE, 'supabase/functions'));
    expect(importeurs).toEqual([]);
  });
});

describe('comparaison A/B/C : six requêtes préparées, jamais lancées', () => {
  const requetes = construireRequetesABC();

  it('construit exactement 6 requêtes (pop et afrobeat × A, B, C), mêmes paroles, même modèle', () => {
    expect(requetes.map((r) => r.id)).toEqual([
      'pop-A',
      'pop-B',
      'pop-C',
      'afrobeat-A',
      'afrobeat-B',
      'afrobeat-C',
    ]);
    for (const r of requetes) {
      const meme = requetes.filter((x) => x.style === r.style)[0].chargeUtile;
      expect(r.chargeUtile.lyrics).toBe(meme.lyrics);
      expect(r.chargeUtile.model).toBe(MODELE_SUNO_DEFAUT);
      expect(r.chargeUtile.title).toBe(meme.title);
      expect(r.chargeUtile.duration).toBe(meme.duration);
      expect(r.chargeUtile.vocalGender).toBe(meme.vocalGender);
      expect(r.chargeUtile.styleWeight).toBe(0.7);
      expect(r.chargeUtile.weirdnessConstraint).toBe(0.3);
      expect(r.chargeUtile.variety).toBe(1);
      expect(r.chargeUtile.customMode).toBe(true);
      expect(r.chargeUtile.instrumental).toBe(false);
      expect(r.chargeUtile).not.toHaveProperty('prompt');
      expect(r.chargeUtile.callBackUrl).toBe(URL_RAPPEL_FICTIVE);
      expect(r.chargeUtile.style.length).toBeLessThanOrEqual(
        LIMITES_SUNO.style
      );
      expect(r.chargeUtile.style.endsWith('french lyrics')).toBe(true);
    }
    expect(new Set(requetes.map((r) => r.chargeUtile.lyrics)).size).toBe(1);
    expect(requetes[0].chargeUtile.lyrics).toContain('[Refrain]');
  });

  it('A = exactement la requête de production ; B = référence mot pour mot ; C = prompt v2', () => {
    for (const slug of ['pop', 'afrobeat']) {
      const prod = construireRequeteSuno({
        paroles: [...PAROLES_COMPARAISON],
        style: slug,
        rang: 'A',
        titre: requetes.find((r) => r.id === `${slug}-A`)!.chargeUtile.title,
        genreVocal: requetes.find((r) => r.id === `${slug}-A`)!.chargeUtile
          .vocalGender,
        modele: MODELE_SUNO_DEFAUT,
        callBackUrl: URL_RAPPEL_FICTIVE,
      }).chargeUtile;
      expect(requetes.find((r) => r.id === `${slug}-A`)!.chargeUtile).toEqual(
        prod
      );
      const v2 = STYLES_MUSICAUX_V2.find((s) => s.slug === slug)!;
      const b = requetes.find((r) => r.id === `${slug}-B`)!.chargeUtile;
      const c = requetes.find((r) => r.id === `${slug}-C`)!.chargeUtile;
      expect(b.style.startsWith(v2.promptReference)).toBe(true);
      expect(c.style.startsWith(v2.prompt)).toBe(true);
      expect(b.negativeTags).toBe(c.negativeTags);
      expect(b.style).not.toBe(c.style);
      expect(
        prod.style.startsWith(
          STYLES_MUSICAUX.find((s) => s.slug === slug)!.prompt
        )
      ).toBe(true);
    }
  });

  it('le fichier docs/musique-comparaison-abc/requetes-abc.json est à jour et ne contient aucun secret', () => {
    const texte = readFileSync(
      join(RACINE, 'docs/musique-comparaison-abc/requetes-abc.json'),
      'utf8'
    );
    expect(texte).toBe(`${JSON.stringify(documentRequetesABC(), null, 2)}\n`);
    expect(JSON.parse(texte).requetes).toHaveLength(6);
    expect(texte).not.toMatch(
      /bearer|api[_-]?key|authorization|eyJ[A-Za-z0-9]|sk-[A-Za-z0-9]/i
    );
  });
});
