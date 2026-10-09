import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { messageErreurGeneration } from '@/hooks/music/useSunoMusicGeneration';

/**
 * Quota de Med MNG Create : 0 génération audio avec l'offre gratuite, 30 par mois
 * avec Premium. Le contrôle qui fait foi est côté serveur (mm-generate-music) ;
 * le front relaie ses refus en français, sans message technique.
 */
describe('quota Med MNG Create — messages relayés à l’utilisateur', () => {
  it('garde les refus métier du serveur (quota atteint, Premium requis)', () => {
    const quota = `Vous avez utilisé vos ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`;
    expect(messageErreurGeneration(new Error(quota))).toBe(quota);
    const premium =
      'La génération audio est incluse dans MED MNG Premium (69 €/an ou 9,90 €/mois).';
    expect(messageErreurGeneration(new Error(premium))).toBe(premium);
  });

  it('remplace tout message technique par « service indisponible »', () => {
    for (const technique of [
      'Edge Function returned a non-2xx status code',
      'Failed to fetch',
      'HTTP 503',
      'Suno credit exhausted',
    ]) {
      expect(messageErreurGeneration(new Error(technique))).toBe(
        'Service momentanément indisponible, réessayez plus tard.'
      );
    }
    expect(messageErreurGeneration(undefined)).toMatch(
      /Impossible de générer la musique/
    );
  });
});

describe('quota Med MNG Create — contrôle serveur (mm-generate-music)', () => {
  const code = readFileSync(
    'supabase/functions/mm-generate-music/index.ts',
    'utf8'
  );

  it('même quota mensuel que l’offre affichée', () => {
    expect(code).toContain(
      `const QUOTA_MENSUEL_PREMIUM = ${QUOTA_GENERATIONS_AUDIO_PREMIUM};`
    );
  });

  it('le droit (connexion, Premium, quota) est vérifié avant la lecture du corps et avant tout appel à Suno', () => {
    const refus = code.indexOf(
      'await verifierDroitGeneration(supabase, userId)'
    );
    expect(refus).toBeGreaterThan(0);
    expect(refus).toBeLessThan(code.indexOf('await req.json()'));
    expect(refus).toBeLessThan(code.indexOf('await fetch(URL_SUNO_GENERATE'));
    expect(code).toMatch(/code: 'PREMIUM_REQUIS'/);
    expect(code).toMatch(/code: 'QUOTA_ATTEINT'/);
  });

  it('le décompte retient le plus élevé du suivi et du registre serveur (non modifiable par l’utilisateur)', () => {
    expect(code).toContain("from('mm_generations_audio')");
    expect(code).toContain('Math.max(utilisees, selonRegistre)');
  });

  it('garde-fous de coût : tentatives du mois (échecs compris) et générations simultanées plafonnées', () => {
    expect(code).toContain('const TENTATIVES_MENSUELLES_MAX = QUOTA_MENSUEL_PREMIUM * 2;');
    expect(code).toContain('const GENERATIONS_SIMULTANEES_MAX = 2;');
    expect(code).toMatch(/code: 'TENTATIVES_ATTEINTES'/);
    expect(code).toMatch(/code: 'GENERATION_EN_COURS'/);
    // Contrôlé avant tout appel au fournisseur.
    expect(code.indexOf("code: 'GENERATION_EN_COURS'")).toBeLessThan(code.indexOf('await fetch(URL_SUNO_GENERATE'));
  });

  it('messages de ces refus relayés tels quels (pas de jargon technique)', () => {
    for (const m of [
      'Trop de tentatives de génération ce mois-ci (60). Écrivez-nous si un problème technique vous a bloqué.',
      'Une chanson est déjà en cours de création. Attendez qu’elle soit prête (1 à 3 minutes) avant d’en lancer une autre.',
    ]) {
      expect(messageErreurGeneration(new Error(m))).toBe(m);
    }
  });
});
