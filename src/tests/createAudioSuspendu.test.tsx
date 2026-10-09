import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import {
  createEducationalApplicationSchema,
  createFAQPageSchema,
  createProductSchema,
  createSoftwareApplicationSchema,
} from '@/components/seo/jsonLdSchemas';

const lire = (p: string) =>
  readFileSync(resolve(__dirname, '../..', p), 'utf8');

describe('suspension ciblée de la génération audio (décision CEO 09.10.2026)', () => {
  it('drapeau unique serveur/site, aujourd’hui fermé, message sans jargon', () => {
    expect(GENERATION_AUDIO_DISPONIBLE).toBe(false);
    expect(
      messageErreurGeneration(new Error(MESSAGE_GENERATION_SUSPENDUE))
    ).toBe(MESSAGE_GENERATION_SUSPENDUE);
    expect(MESSAGE_GENERATION_SUSPENDUE).toMatch(
      /paroles, les fiches, les quiz/
    );
  });

  it('aucune promesse d’audio immédiatement disponible pendant la suspension', () => {
    expect(PROMESSE_AUDIO).toMatch(/bientôt disponible/);
    expect(PROMESSE_AUDIO).not.toMatch(/30/);
    expect(PROMESSE_AUDIO_COURTE).toMatch(/bientôt disponible/);
    for (const f of [
      'src/components/med-mng/PricingPlans.tsx',
      'src/components/pricing/PricingFAQ.tsx',
      'src/components/help/FaqSection.tsx',
      'src/pages/FAQ.tsx',
      'src/pages/CGU.tsx',
      'src/pages/MedMngSubscribe.tsx',
      'src/pages/MedMngSuccess.tsx',
      'src/components/seo/jsonLdSchemas.ts',
      'src/components/seo/geoSchemas.ts',
    ]) {
      expect(lire(f), f).not.toMatch(
        /30 générations audio|30 chansons par mois/
      );
    }
    // Revue #232 : plus aucun quota ou crédit écrit en dur dans les textes contractuels et d'aide.
    for (const f of [
      'src/pages/CGV.tsx',
      'src/pages/FAQ.tsx',
      'src/components/pricing/PricingFAQ.tsx',
      'src/components/home/MngPresentation.tsx',
    ]) {
      expect(lire(f), f).not.toMatch(/30 générations|\(crédits\)/);
    }
  });

  it('données structurées (JSON-LD) rendues : aucune promesse d’audio disponible', () => {
    const rendu = JSON.stringify([
      createFAQPageSchema(),
      createProductSchema(),
      createSoftwareApplicationSchema(),
      createEducationalApplicationSchema(),
    ]);
    expect(rendu).not.toMatch(
      /à la demande|30 générations|générations audio de chansons par mois/
    );
    expect(rendu).toMatch(/momentanément suspendue|bientôt disponible/);
  });

  it('PricingFAQ rendue : audio annoncé comme suspendu', () => {
    const { container } = render(
      <MemoryRouter>
        <PricingFAQ />
      </MemoryRouter>
    );
    expect(container.textContent ?? '').not.toMatch(/30 générations/);
  });

  it('serveur : refus avant tout appel au fournisseur, moteur conservé', () => {
    const code = lire('supabase/functions/mm-generate-music/index.ts');
    const refus = code.indexOf("code: 'GENERATION_SUSPENDUE'");
    expect(refus).toBeGreaterThan(0);
    expect(refus).toBeLessThan(code.indexOf('await reserverCreneau('));
    expect(refus).toBeLessThan(code.indexOf('await fetch(URL_SUNO_GENERATE'));
    expect(code).toContain('if (userId && !GENERATION_AUDIO_DISPONIBLE)');
    // Le moteur n'est pas supprimé.
    expect(code).toContain('URL_SUNO_GENERATE');
  });

  it('Stripe et e-mail de bienvenue suivent le drapeau', () => {
    const catalogue = lire('supabase/functions/_shared/mm-stripe-catalog.ts');
    expect(catalogue).toMatch(/GENERATION_AUDIO_DISPONIBLE\s*\n?\s*\?/);
    // Revue #232 : le produit Stripe EXISTANT est réaligné (pas seulement un produit neuf).
    expect(catalogue).toContain(
      'stripe.products.update(produitId, { description: DESCRIPTION_PRODUIT })'
    );
    expect(catalogue.match(/await alignerDescriptionProduit\(/g)?.length).toBe(
      2
    );
    expect(lire('supabase/functions/send-welcome-email/index.ts')).toContain(
      'GENERATION_AUDIO_DISPONIBLE ?'
    );
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
