import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  GENERATION_AUDIO_DISPONIBLE,
  MESSAGE_GENERATION_SUSPENDUE,
  PROMESSE_AUDIO,
  PROMESSE_AUDIO_COURTE,
} from '@/config/offre';
import {
  interpreterVerdictIA,
  verifierAmbianceLocale,
} from '../../supabase/functions/_shared/mm-ambiance';
import {
  construireStyle,
  trouverStyle,
} from '../../supabase/functions/_shared/mm-suno-requete';
import { createRequestBody } from '@/hooks/musicGenerationUtils';
import { messageErreurGeneration } from '@/hooks/music/useSunoMusicGeneration';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import {
  createEducationalApplicationSchema,
  createFAQPageSchema,
  createProductSchema,
  createSoftwareApplicationSchema,
} from '@/components/seo/jsonLdSchemas';
import {
  createDatasetSchema,
  createDefinedTermSchema,
  createExpertiseSchema,
  createHowToSchema,
  createSpeakableSchema,
} from '@/components/seo/geoSchemas';

const lire = (p: string) =>
  readFileSync(resolve(__dirname, '../..', p), 'utf8');

/**
 * Génération audio : suspendue le matin du 09.10.2026, RÉACTIVÉE le soir même sur décision
 * explicite de l'utilisatrice (fournisseur inchangé : sunoapi.org). Le drapeau unique reste en
 * place : ces tests vérifient l'état réactivé ET que la suspension resterait possible d'un coup.
 */
describe('génération audio réactivée (décision de l’utilisatrice, 09.10.2026)', () => {
  it('drapeau unique serveur/site ouvert ; message de suspension sans affirmation de droits', () => {
    expect(GENERATION_AUDIO_DISPONIBLE).toBe(true);
    expect(
      messageErreurGeneration(new Error(MESSAGE_GENERATION_SUSPENDUE))
    ).toBe(MESSAGE_GENERATION_SUSPENDUE);
    expect(MESSAGE_GENERATION_SUSPENDUE).not.toMatch(/licence/i);
  });

  it('offre rétablie telle qu’avant la suspension : 30 générations par mois, rien « bientôt disponible »', () => {
    expect(PROMESSE_AUDIO).toBe('30 générations audio de chansons par mois');
    expect(PROMESSE_AUDIO_COURTE).toBe('génération audio');
    // Revue #232 conservée : aucun quota ou crédit écrit en dur dans les textes contractuels et d'aide.
    for (const f of [
      'src/pages/CGV.tsx',
      'src/pages/FAQ.tsx',
      'src/components/pricing/PricingFAQ.tsx',
      'src/components/home/MngPresentation.tsx',
    ]) {
      expect(lire(f), f).not.toMatch(/30 générations|\(crédits\)/);
    }
  });

  it('données structurées (JSON-LD) rendues : audio disponible, plus aucune mention de suspension', () => {
    const rendu = JSON.stringify([
      createFAQPageSchema(),
      createProductSchema(),
      createSoftwareApplicationSchema(),
      createEducationalApplicationSchema(),
    ]);
    expect(rendu).toMatch(/30 générations audio de chansons par mois/);
    expect(rendu).toMatch(/l'audio des chansons se génère à la demande/);
    expect(rendu).not.toMatch(/momentanément suspendue|bientôt disponible/);
  });

  it('JSON-LD GEO (HowTo, Dataset…) et FAQ : audio disponible, ni fonction retirée, ni licence inventée', () => {
    const rendu = JSON.stringify([
      createFAQPageSchema(),
      createHowToSchema(),
      createDatasetSchema(),
      createDefinedTermSchema(),
      createSpeakableSchema(),
      createExpertiseSchema(),
    ]);
    expect(rendu).not.toMatch(/momentanément suspendue|bientôt disponible/);
    // Promesses jamais tenues (avant le 09.10) : crédits, « génération musicale par IA » générique.
    expect(rendu).not.toMatch(/dans la limite de vos crédits|génération musicale par intelligence artificielle/);
    // Fonctions retirées (DC7) et allégations sans source.
    expect(rendu).not.toMatch(/cas cliniques, ECOS|QROC|creativecommons|identifie vos lacunes/);
  });

  it('llms.txt (lu par les assistants IA) : audio disponible, comme avant la suspension', () => {
    const llms = lire('public/llms.txt');
    expect(llms).toContain('- Génération audio des chansons à la demande');
    expect(llms).toContain('30 générations audio par mois');
    expect(llms).not.toMatch(/momentanément suspendue|bientôt disponible|réouverture/);
  });

  it('PricingFAQ rendue (réponse ouverte) : 30 générations par mois annoncées', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <PricingFAQ />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Comment fonctionne la musique IA pour réviser ?'));
    expect(container.textContent ?? '').toMatch(/30 générations par mois/);
    expect(container.textContent ?? '').not.toMatch(/momentanément suspendue/);
  });

  it('serveur : appel au fournisseur sunoapi.org conservé, réservation atomique AVANT l’appel, interrupteur toujours en tête', () => {
    const code = lire('supabase/functions/mm-generate-music/index.ts');
    expect(code).toContain("const URL_SUNO_GENERATE = 'https://api.sunoapi.org/api/v1/generate'");
    const refus = code.indexOf("code: 'GENERATION_SUSPENDUE'");
    const droit = code.indexOf('await verifierDroitGeneration(');
    const reservation = code.indexOf('await reserverCreneau(');
    const appel = code.indexOf('await fetch(URL_SUNO_GENERATE');
    expect(refus).toBeGreaterThan(0);
    expect(refus).toBeLessThan(droit);
    expect(droit).toBeLessThan(reservation);
    expect(reservation).toBeLessThan(appel);
    expect(code).toContain('if (userId && !GENERATION_AUDIO_DISPONIBLE)');
    // Quota d'avant la suspension inchangé, compteurs illisibles = refus (revue #231).
    expect(code).toContain('const QUOTA_MENSUEL_PREMIUM = 30;');
    expect(code).toMatch(/tentatives\.count == null \|\| enCours\.count == null/);
  });

  it('Stripe et e-mail de bienvenue suivent le drapeau (description du produit réalignée)', () => {
    const catalogue = lire('supabase/functions/_shared/mm-stripe-catalog.ts');
    expect(catalogue).toMatch(/GENERATION_AUDIO_DISPONIBLE\s*\n?\s*\?/);
    expect(catalogue).toContain(
      'stripe.products.update(produitId, { description: DESCRIPTION_PRODUIT })'
    );
    expect(catalogue.match(/await alignerDescriptionProduit\(/g)?.length).toBe(2);
    expect(lire('supabase/functions/send-welcome-email/index.ts')).toContain(
      'GENERATION_AUDIO_DISPONIBLE ?'
    );
  });

  it('aucune affirmation de droits non établie (« licence officielle », « sous licence Suno »…)', () => {
    const fichiers: string[] = [];
    const parcourir = (dossier: string) => {
      for (const e of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, e.name);
        if (e.isDirectory()) parcourir(chemin);
        else if (/\.(tsx?|txt|html)$/.test(e.name) && !/\.test\./.test(e.name)) fichiers.push(chemin);
      }
    };
    for (const d of ['src', 'public', 'supabase/functions']) parcourir(resolve(__dirname, '../..', d));
    const fautifs = fichiers.filter((f) =>
      /licence officielle|sous licence (officielle )?(de )?Suno|licen[cs]ed by Suno|partenaire officiel de Suno/i.test(readFileSync(f, 'utf8'))
    );
    expect(fautifs).toEqual([]);
  });
});

describe('aucune expression JS affichée telle quelle (régression accueil, 09.10)', () => {
  it('aucun attribut texte entre guillemets ne contient une expression {CONSTANTE ? …}', () => {
    const fichiers: string[] = [];
    const parcourir = (dossier: string) => {
      for (const e of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, e.name);
        if (e.isDirectory()) parcourir(chemin);
        else if (/\.tsx$/.test(e.name)) fichiers.push(chemin);
      }
    };
    parcourir(resolve(__dirname, '..'));
    const fautifs = fichiers.filter((f) =>
      /=\s*"[^"\n]*\{[A-Z][A-Z_]{3,}\s*\?/.test(readFileSync(f, 'utf8'))
    );
    expect(fautifs).toEqual([]);
  });
});

describe('ambiance libre', () => {
  it('contrôle local : vide accepté, longueur, liens et imitations refusés', () => {
    expect(verifierAmbianceLocale('')).toEqual({ ok: true, texte: '' });
    expect(verifierAmbianceLocale(undefined)).toEqual({ ok: true, texte: '' });
    expect(verifierAmbianceLocale('  piano doux,   pluie  ')).toEqual({
      ok: true,
      texte: 'piano doux, pluie',
    });
    expect(verifierAmbianceLocale('x'.repeat(201)).ok).toBe(false);
    expect(verifierAmbianceLocale('voir https://exemple.com').ok).toBe(false);
    for (const t of [
      'à la manière de quelqu’un',
      'avec la voix de mon chanteur préféré',
      'façon années 80 de X',
      'feat un rappeur',
      'in the style of someone',
      'reprise de la chanson',
      'imiter une star',
    ]) {
      expect(verifierAmbianceLocale(t).ok, t).toBe(false);
    }
    // « comme » n'est pas interdit en soi (« doux comme la pluie »).
    expect(verifierAmbianceLocale('doux comme la pluie, piano').ok).toBe(true);
  });

  it('verdict de l’IA : tags anglais propres ou refus prudent', () => {
    expect(
      interpreterVerdictIA(
        '{"autorise":true,"raison":"","tags":"Soft Piano, rain ambience, slow tempo, nostalgic"}'
      )
    ).toEqual({
      autorise: true,
      raison: '',
      tags: 'soft piano, rain ambience, slow tempo, nostalgic',
    });
    expect(
      interpreterVerdictIA(
        '```json\n{"autorise":false,"raison":"Pas de nom d’artiste.","tags":""}\n```'
      ).autorise
    ).toBe(false);
    expect(interpreterVerdictIA('pas du JSON').autorise).toBe(false);
    // Tags avec caractères inattendus écartés ; aucun tag propre → refus.
    expect(
      interpreterVerdictIA('{"autorise":true,"tags":"Ça va, <script>"}')
        .autorise
    ).toBe(false);
  });

  it('les tags sont réellement transmis au moteur (style), dans la limite du fournisseur', () => {
    const pop = trouverStyle('pop')!;
    const style = construireStyle(pop, {
      langue: 'fr',
      ambianceTags: 'soft piano, rain ambience',
    });
    expect(style).toMatch(/soft piano, rain ambience/);
    expect(style).toMatch(/french lyrics$/);
    expect(
      construireStyle(pop, { langue: 'fr', ambianceTags: 'x, '.repeat(600) })
        .length
    ).toBeLessThanOrEqual(1000);
  });

  it('le corps de la requête porte l’ambiance (espaces normalisés), seulement si renseignée', () => {
    expect(
      createRequestBody('a', 'pop', 'A', 'fr', 'IC-1', undefined, {
        ambiance: '  piano   doux ',
      }).ambiance
    ).toBe('piano doux');
    expect(
      createRequestBody('a', 'pop', 'A', 'fr', 'IC-1', undefined, {
        ambiance: '   ',
      }).ambiance
    ).toBeUndefined();
  });

  it('serveur : refus 422 AVANT réservation et appel au fournisseur ; contrôle par IA', () => {
    const code = lire('supabase/functions/mm-generate-music/index.ts');
    const i = code.indexOf("code: 'AMBIANCE_REFUSEE'");
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(code.indexOf('await reserverCreneau('));
    expect(code).toContain('CONSIGNE_IA_AMBIANCE');
    expect(code).toContain('ambianceTags,');
  });
});
