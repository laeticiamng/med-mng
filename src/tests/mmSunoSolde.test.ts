/**
 * Alerte de solde bas des crédits sunoapi.org (supabase/functions/_shared/mm-suno-solde.ts).
 * Tests déterministes : aucun réseau, aucun appel à Suno ni à Resend.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  COUT_GENERATION_CREDITS,
  RAPPEL_BAS_HEURES,
  RAPPEL_CRITIQUE_HEURES,
  SEUIL_BAS_DEFAUT,
  SEUIL_CRITIQUE_DEFAUT,
  URL_CREDITS_SUNO,
  ECHECS_AVANT_ALERTE,
  INTERRUPTION_HEURES,
  alerteDeLEpisode,
  choisirSeuils,
  construireEmailInterruption,
  construireEmailSurveillance,
  decrireRaison,
  construireEmailAlerte,
  evaluerSolde,
  extraireCredits,
  fautAlerter,
  lireSeuils,
  lireSoldeSuno,
  verifierSolde,
  type DependancesSolde,
  type DerniereAlerte,
  type ResultatLecture,
} from '../../supabase/functions/_shared/mm-suno-solde.ts';

const SEUILS = { bas: SEUIL_BAS_DEFAUT, critique: SEUIL_CRITIQUE_DEFAUT };
const MAINTENANT = new Date('2026-10-27T12:00:00Z');
const ilYaHeures = (h: number) =>
  new Date(MAINTENANT.getTime() - h * 3_600_000);

describe('seuils', () => {
  it('valeurs par défaut cohérentes avec le coût mesuré d’une génération', () => {
    expect(COUT_GENERATION_CREDITS).toBe(12);
    expect(SEUIL_BAS_DEFAUT).toBe(10 * COUT_GENERATION_CREDITS);
    expect(SEUIL_CRITIQUE_DEFAUT).toBe(3 * COUT_GENERATION_CREDITS);
  });

  it('lit SUNO_SEUIL_BAS et SUNO_SEUIL_CRITIQUE quand ils sont cohérents', () => {
    const env: Record<string, string> = {
      SUNO_SEUIL_BAS: '200',
      SUNO_SEUIL_CRITIQUE: '60',
    };
    expect(lireSeuils((n) => env[n])).toEqual({ bas: 200, critique: 60 });
    const virgule: Record<string, string> = {
      SUNO_SEUIL_BAS: '150,5',
      SUNO_SEUIL_CRITIQUE: '40',
    };
    expect(lireSeuils((n) => virgule[n])).toEqual({ bas: 150.5, critique: 40 });
  });

  it.each([
    [{}],
    [{ SUNO_SEUIL_BAS: '200' }],
    [{ SUNO_SEUIL_BAS: 'abc', SUNO_SEUIL_CRITIQUE: '10' }],
    [{ SUNO_SEUIL_BAS: '50', SUNO_SEUIL_CRITIQUE: '80' }],
    [{ SUNO_SEUIL_BAS: '50', SUNO_SEUIL_CRITIQUE: '50' }],
    [{ SUNO_SEUIL_BAS: '-5', SUNO_SEUIL_CRITIQUE: '-10' }],
    [{ SUNO_SEUIL_BAS: '', SUNO_SEUIL_CRITIQUE: '' }],
  ])('valeur absente ou incohérente → seuils par défaut (%j)', (env) => {
    expect(lireSeuils((n) => (env as Record<string, string>)[n])).toEqual(
      SEUILS
    );
  });
});

describe('évaluation du solde', () => {
  it.each([
    [1005.6, 'ok', 83],
    [SEUIL_BAS_DEFAUT, 'ok', 10],
    [119.9, 'bas', 9],
    [SEUIL_CRITIQUE_DEFAUT, 'bas', 3],
    [35.9, 'critique', 2],
    [5.6, 'critique', 0],
    [0, 'critique', 0],
  ])('%d crédits → %s, %d générations', (credits, etat, generations) => {
    expect(evaluerSolde(credits, SEUILS)).toEqual({
      etat,
      generationsRestantes: generations,
    });
  });
});

describe('réponse du fournisseur', () => {
  it('lit le solde dans { code: 200, data: nombre }', () => {
    expect(extraireCredits({ code: 200, msg: 'success', data: 933.6 })).toBe(
      933.6
    );
    expect(extraireCredits({ code: 200, data: '12' })).toBe(12);
    expect(extraireCredits({ code: 200, data: 0 })).toBe(0);
  });

  it.each([
    [null],
    [undefined],
    ['x'],
    [{}],
    [{ code: 429, data: 10 }],
    [{ code: 200 }],
    [{ code: 200, data: 'abc' }],
    [{ code: 200, data: -1 }],
    [{ code: 200, data: null }],
  ])('solde illisible → null (%j)', (corps) => {
    expect(extraireCredits(corps)).toBeNull();
  });

  it('utilise le bon point d’entrée (/get-credits répond 404)', () => {
    expect(URL_CREDITS_SUNO).toBe(
      'https://api.sunoapi.org/api/v1/generate/credit'
    );
  });

  it('lireSoldeSuno : succès, refus HTTP, réponse illisible, réseau, délai ; la clé reste hors du résultat', async () => {
    const ok = vi.fn(
      async () =>
        new Response(JSON.stringify({ code: 200, data: 933.6 }), {
          status: 200,
        })
    );
    expect(
      await lireSoldeSuno('cle-secrete-1234', {
        fetchImpl: ok as unknown as typeof fetch,
      })
    ).toEqual({ ok: true, credits: 933.6 });
    const [url, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(URL_CREDITS_SUNO);
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer cle-secrete-1234'
    );

    const refus = async () =>
      new Response(JSON.stringify({ code: 401 }), { status: 401 });
    expect(
      await lireSoldeSuno('cle-secrete-1234', {
        fetchImpl: refus as unknown as typeof fetch,
      })
    ).toEqual({ ok: false, raison: 'http_401' });
    const vide = async () => new Response('pas du json', { status: 200 });
    expect(
      await lireSoldeSuno('cle-secrete-1234', {
        fetchImpl: vide as unknown as typeof fetch,
      })
    ).toEqual({ ok: false, raison: 'reponse_illisible' });
    const panne = async () => {
      throw new TypeError('connexion cle-secrete-1234');
    };
    const r = await lireSoldeSuno('cle-secrete-1234', {
      fetchImpl: panne as unknown as typeof fetch,
    });
    expect(r).toEqual({ ok: false, raison: 'reseau' });
    expect(JSON.stringify(r)).not.toContain('cle-secrete');
    const lent = (_u: string, init: RequestInit) =>
      new Promise<Response>((_res, rej) =>
        init.signal?.addEventListener('abort', () =>
          rej(Object.assign(new Error('abort'), { name: 'AbortError' }))
        )
      );
    expect(
      await lireSoldeSuno('cle-secrete-1234', {
        fetchImpl: lent as unknown as typeof fetch,
        delaiMs: 5,
      })
    ).toEqual({ ok: false, raison: 'delai_depasse' });
  });
});

describe('décision d’alerte', () => {
  const alerte = (etat: DerniereAlerte['etat'], h: number): DerniereAlerte => ({
    etat,
    at: ilYaHeures(h),
  });

  it('jamais d’alerte quand le solde est correct', () => {
    expect(fautAlerter('ok', null, MAINTENANT)).toBe(false);
    expect(fautAlerter('ok', alerte('critique', 100), MAINTENANT)).toBe(false);
  });

  it('première alerte dès que le solde passe sous le seuil', () => {
    expect(fautAlerter('bas', null, MAINTENANT)).toBe(true);
    expect(fautAlerter('critique', null, MAINTENANT)).toBe(true);
  });

  it('pas de doublon avant le délai de rappel', () => {
    expect(
      fautAlerter('bas', alerte('bas', RAPPEL_BAS_HEURES - 1), MAINTENANT)
    ).toBe(false);
    expect(
      fautAlerter(
        'critique',
        alerte('critique', RAPPEL_CRITIQUE_HEURES - 1),
        MAINTENANT
      )
    ).toBe(false);
  });

  it('rappel après le délai tant que le solde ne remonte pas', () => {
    expect(
      fautAlerter('bas', alerte('bas', RAPPEL_BAS_HEURES), MAINTENANT)
    ).toBe(true);
    expect(
      fautAlerter(
        'critique',
        alerte('critique', RAPPEL_CRITIQUE_HEURES),
        MAINTENANT
      )
    ).toBe(true);
  });

  it('passage de « bas » à « critique » : alerte immédiate', () => {
    expect(fautAlerter('critique', alerte('bas', 0.5), MAINTENANT)).toBe(true);
  });

  it('retour de « critique » à « bas » : pas de nouvelle alerte avant le rappel « bas »', () => {
    expect(fautAlerter('bas', alerte('critique', 2), MAINTENANT)).toBe(false);
  });
});

describe('e-mail d’alerte', () => {
  it('donne le solde, le nombre de générations, la conséquence visible et la marche à suivre', () => {
    const e = construireEmailAlerte({
      credits: 5.6,
      etat: 'critique',
      generationsRestantes: 0,
      seuils: SEUILS,
    });
    expect(e.sujet).toContain('5,6');
    expect(e.sujet).toContain('presque épuisés');
    expect(e.html).toContain('saturé');
    expect(e.html).toContain('recharger');
    expect(e.html).toContain(`${RAPPEL_CRITIQUE_HEURES} heures`);
  });

  it('niveau « bas » : seuil rappelé, pas de menace de refus imminent', () => {
    const e = construireEmailAlerte({
      credits: 96,
      etat: 'bas',
      generationsRestantes: 8,
      seuils: SEUILS,
    });
    expect(e.sujet).toContain('bas');
    expect(e.sujet).toContain('8 générations');
    expect(e.html).toContain(`${RAPPEL_BAS_HEURES} heures`);
    expect(e.html).not.toContain('vont être refusées');
  });
});

function dependances(
  surcharge: Partial<DependancesSolde> & { lecture?: ResultatLecture } = {}
) {
  const enregistres: Array<Parameters<DependancesSolde['enregistrer']>[0]> = [];
  const envoyes: Array<{
    to: string;
    sujet: string;
    html: string;
    cle: string;
  }> = [];
  const deps: DependancesSolde = {
    maintenant: () => MAINTENANT,
    lireCredits: async () => surcharge.lecture ?? { ok: true, credits: 5.6 },
    dernierReleve: async () => ilYaHeures(1),
    echecsPrecedents: async () => 0,
    derniereAlerte: async () => null,
    dernierRetour: async () => null,
    destinataire: async () => 'proprietaire@exemple.invalid',
    envoyer: async (email, cle) => {
      envoyes.push({ ...email, cle });
      return { ok: true };
    },
    enregistrer: async (r) => {
      enregistres.push(r);
    },
    ...surcharge,
  };
  delete (deps as Partial<DependancesSolde> & { lecture?: ResultatLecture })
    .lecture;
  return { deps, enregistres, envoyes };
}

describe('verifierSolde (orchestration)', () => {
  it('solde correct : relevé enregistré, aucun e-mail', async () => {
    const { deps, enregistres, envoyes } = dependances({
      lecture: { ok: true, credits: 933.6 },
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toEqual({
      statut: 200,
      credits: 933.6,
      etat: 'ok',
      generationsRestantes: 77,
      alerte: 'non_requise',
    });
    expect(envoyes).toHaveLength(0);
    expect(enregistres).toHaveLength(1);
    expect(enregistres[0]).toMatchObject({
      credits: 933.6,
      etat: 'ok',
      alerteEnvoyee: false,
    });
  });

  it('solde critique : un e-mail avec une clé d’idempotence horaire, relevé marqué « alerte envoyée »', async () => {
    const { deps, enregistres, envoyes } = dependances();
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({
      statut: 200,
      etat: 'critique',
      alerte: 'envoyee',
      generationsRestantes: 0,
    });
    expect(envoyes).toHaveLength(1);
    expect(envoyes[0].cle).toBe('mm-suno-solde-critique-2026-10-27T12');
    expect(enregistres[0].alerteEnvoyee).toBe(true);
  });

  it('solde rechargé puis de nouveau critique avant le rappel : nouvel épisode, nouvelle alerte', async () => {
    const { deps, envoyes, enregistres } = dependances({
      derniereAlerte: async () => ({ etat: 'critique', at: ilYaHeures(3) }),
      dernierRetour: async () => ilYaHeures(2),
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({
      statut: 200,
      etat: 'critique',
      alerte: 'envoyee',
    });
    expect(envoyes).toHaveLength(1);
    expect(enregistres[0].alerteEnvoyee).toBe(true);
  });

  it('aucun retour à « ok » depuis la dernière alerte : le délai de rappel continue de s’appliquer', async () => {
    const { deps, envoyes } = dependances({
      derniereAlerte: async () => ({ etat: 'critique', at: ilYaHeures(3) }),
      dernierRetour: async () => ilYaHeures(10),
    });
    expect(await verifierSolde(deps, SEUILS)).toMatchObject({
      alerte: 'non_requise',
    });
    expect(envoyes).toHaveLength(0);
  });

  it('alerteDeLEpisode : un relevé « ok » postérieur efface l’alerte précédente', () => {
    const alerte: DerniereAlerte = { etat: 'bas', at: ilYaHeures(5) };
    expect(alerteDeLEpisode(null, ilYaHeures(1))).toBeNull();
    expect(alerteDeLEpisode(alerte, null)).toBe(alerte);
    expect(alerteDeLEpisode(alerte, ilYaHeures(6))).toBe(alerte);
    expect(alerteDeLEpisode(alerte, ilYaHeures(4))).toBeNull();
  });

  it('pas de second e-mail avant le délai de rappel', async () => {
    const { deps, envoyes, enregistres } = dependances({
      derniereAlerte: async () => ({ etat: 'critique', at: ilYaHeures(1) }),
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({ alerte: 'non_requise' });
    expect(envoyes).toHaveLength(0);
    expect(enregistres[0].alerteEnvoyee).toBe(false);
  });

  it('aucun destinataire configuré : signalé, relevé enregistré, retenté à la vérification suivante', async () => {
    const { deps, envoyes, enregistres } = dependances({
      destinataire: async () => null,
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({ statut: 200, alerte: 'destinataire_absent' });
    expect(envoyes).toHaveLength(0);
    expect(enregistres[0].alerteEnvoyee).toBe(false);
  });

  it('échec d’envoi : non compté comme alerte envoyée, motif sans adresse', async () => {
    const { deps, enregistres } = dependances({
      envoyer: async () => ({ ok: false, erreur: 'validation_error (422)' }),
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({
      alerte: 'echec_envoi',
      erreurEnvoi: 'validation_error (422)',
    });
    expect(enregistres[0].alerteEnvoyee).toBe(false);
    expect(JSON.stringify(s)).not.toContain('@');
    expect(JSON.stringify(enregistres[0])).not.toContain('@');
  });

  it('solde illisible une fois : relevé « indisponible » enregistré, pas encore d’alerte', async () => {
    const { deps, enregistres, envoyes } = dependances({
      lecture: { ok: false, raison: 'http_401' },
    });
    expect(await verifierSolde(deps, SEUILS)).toEqual({
      statut: 502,
      etat: 'indisponible',
      erreur: 'http_401',
      echecs: 1,
      alerte: 'non_requise',
    });
    expect(envoyes).toHaveLength(0);
    expect(enregistres).toHaveLength(1);
    expect(enregistres[0]).toMatchObject({
      credits: null,
      etat: 'indisponible',
      alerteEnvoyee: false,
      detail: { raison: 'http_401', echecs: 1 },
    });
  });

  it(`solde illisible ${ECHECS_AVANT_ALERTE} fois de suite : alerte « surveillance » envoyée`, async () => {
    const { deps, enregistres, envoyes } = dependances({
      lecture: { ok: false, raison: 'cle_absente' },
      echecsPrecedents: async () => ECHECS_AVANT_ALERTE - 1,
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({
      statut: 502,
      echecs: ECHECS_AVANT_ALERTE,
      alerte: 'envoyee',
    });
    expect(envoyes).toHaveLength(1);
    expect(envoyes[0].sujet).toContain('surveillance');
    expect(envoyes[0].html).toContain('SUNO_API_KEY');
    expect(envoyes[0].cle).toBe('mm-suno-solde-surveillance-2026-10-27T12');
    expect(enregistres[0]).toMatchObject({
      etat: 'indisponible',
      alerteEnvoyee: true,
    });
  });

  it('surveillance toujours en panne : pas de nouvel e-mail avant le rappel quotidien', async () => {
    const alerte = { etat: 'indisponible' as const, at: ilYaHeures(2) };
    const { deps, envoyes } = dependances({
      lecture: { ok: false, raison: 'reseau' },
      echecsPrecedents: async () => 5,
      derniereAlerte: async (f) => (f === 'surveillance' ? alerte : null),
    });
    expect(await verifierSolde(deps, SEUILS)).toMatchObject({
      alerte: 'non_requise',
      echecs: 6,
    });
    expect(envoyes).toHaveLength(0);
  });

  it('surveillance rétablie puis de nouveau en panne : nouvel épisode, nouvelle alerte sans attendre le rappel', async () => {
    const { deps, envoyes } = dependances({
      lecture: { ok: false, raison: 'reseau' },
      echecsPrecedents: async () => ECHECS_AVANT_ALERTE - 1,
      derniereAlerte: async (f) =>
        f === 'surveillance'
          ? { etat: 'indisponible', at: ilYaHeures(8) }
          : null,
      dernierRetour: async (f) => (f === 'surveillance' ? ilYaHeures(4) : null),
    });
    expect(await verifierSolde(deps, SEUILS)).toMatchObject({
      alerte: 'envoyee',
    });
    expect(envoyes).toHaveLength(1);
  });

  it('les familles d’alertes sont séparées : une alerte « surveillance » ne bloque pas l’alerte « solde »', async () => {
    const familles: string[] = [];
    const { deps, envoyes } = dependances({
      derniereAlerte: async (f) => {
        familles.push(f);
        return f === 'surveillance'
          ? { etat: 'indisponible', at: ilYaHeures(1) }
          : null;
      },
    });
    expect(await verifierSolde(deps, SEUILS)).toMatchObject({
      etat: 'critique',
      alerte: 'envoyee',
    });
    expect(familles).toEqual(['solde']);
    expect(envoyes).toHaveLength(1);
  });

  it(`interruption : vérification précédente vieille de ${INTERRUPTION_HEURES} h ou plus → e-mail « interrompue », une fois`, async () => {
    const { deps, envoyes, enregistres } = dependances({
      lecture: { ok: true, credits: 933.6 },
      dernierReleve: async () => ilYaHeures(INTERRUPTION_HEURES + 2),
    });
    const s = await verifierSolde(deps, SEUILS);
    expect(s).toMatchObject({
      statut: 200,
      etat: 'ok',
      alerte: 'non_requise',
      interruption: 'envoyee',
    });
    expect(envoyes).toHaveLength(1);
    expect(envoyes[0].sujet).toContain('interrompue');
    expect(envoyes[0].sujet).toContain('5 h');
    expect(envoyes[0].cle).toBe(
      `mm-suno-solde-interruption-${ilYaHeures(INTERRUPTION_HEURES + 2)
        .toISOString()
        .slice(0, 16)}`
    );
    expect(enregistres[0].detail).toMatchObject({ interruption: 'envoyee' });
  });

  it('pas d’interruption pour la toute première vérification ni pour un écart normal', async () => {
    for (const precedent of [
      null,
      ilYaHeures(1),
      ilYaHeures(INTERRUPTION_HEURES - 0.1),
    ]) {
      const { deps, envoyes } = dependances({
        lecture: { ok: true, credits: 933.6 },
        dernierReleve: async () => precedent,
      });
      const s = await verifierSolde(deps, SEUILS);
      expect(s).not.toHaveProperty('interruption');
      expect(envoyes).toHaveLength(0);
    }
  });
});

describe('seuils en base', () => {
  const env = (valeurs: Record<string, string>) => (n: string) => valeurs[n];

  it('la configuration en base l’emporte sur les secrets et les valeurs par défaut', () => {
    expect(
      choisirSeuils(
        { seuil_bas: 1000, seuil_critique: 36 },
        env({ SUNO_SEUIL_BAS: '200', SUNO_SEUIL_CRITIQUE: '60' })
      )
    ).toEqual({ bas: 1000, critique: 36 });
    expect(
      choisirSeuils({ seuil_bas: '150.5', seuil_critique: '40' }, env({}))
    ).toEqual({ bas: 150.5, critique: 40 });
  });

  it('configuration vide ou incohérente → secrets, puis valeurs par défaut', () => {
    const secrets = env({ SUNO_SEUIL_BAS: '200', SUNO_SEUIL_CRITIQUE: '60' });
    expect(
      choisirSeuils({ seuil_bas: null, seuil_critique: null }, secrets)
    ).toEqual({ bas: 200, critique: 60 });
    expect(
      choisirSeuils({ seuil_bas: 30, seuil_critique: 50 }, secrets)
    ).toEqual({ bas: 200, critique: 60 });
    expect(choisirSeuils(null, secrets)).toEqual({ bas: 200, critique: 60 });
    expect(
      choisirSeuils({ seuil_bas: 30, seuil_critique: 50 }, env({}))
    ).toEqual(SEUILS);
  });

  it('lireSoldeSuno sans clé : « cle_absente » sans aucun appel réseau', async () => {
    const appel = vi.fn();
    expect(
      await lireSoldeSuno('', { fetchImpl: appel as unknown as typeof fetch })
    ).toEqual({ ok: false, raison: 'cle_absente' });
    expect(appel).not.toHaveBeenCalled();
  });

  it('e-mails de panne : cause lisible, aucune adresse ni clé', () => {
    const s = construireEmailSurveillance({ raison: 'http_401', echecs: 3 });
    expect(s.html).toContain('refuse la clé');
    expect(decrireRaison('http_503')).toBe('sunoapi.org répond HTTP 503');
    expect(decrireRaison('inattendu')).toBe('cause inconnue');
    const i = construireEmailInterruption({
      depuis: ilYaHeures(6),
      reprise: MAINTENANT,
    });
    expect(i.sujet).toContain('6 h');
    expect(i.html).toContain('mm-suno-solde-horaire');
    for (const e of [s, i])
      expect(`${e.sujet}${e.html}`).not.toMatch(/@|Bearer/);
  });
});

describe('fonction Edge, migration et configuration', () => {
  const lire = (chemin: string) =>
    readFileSync(resolve(__dirname, '../..', chemin), 'utf8');

  it('la fonction est réservée au serveur et ne journalise ni adresse ni clé', () => {
    const src = lire('supabase/functions/mm-suno-solde/index.ts');
    expect(src).toContain('f66_verifier_jeton_tache');
    expect(src).toContain('reserve_au_serveur');
    expect(src).toMatch(/req\.method !== 'POST'/);
    expect(src).not.toMatch(
      /console\.(log|warn|error)\([^)]*(destinataire|cleSuno|cleService|\.to\b)/
    );
  });

  it('config.toml : verify_jwt = false déclaré pour mm-suno-solde', () => {
    expect(lire('supabase/config.toml')).toMatch(
      /\[functions\.mm-suno-solde\]\s*\nverify_jwt = false/
    );
  });

  it('migration : RLS sans politique, aucun accès anon / authenticated, jeton lu dans Vault à chaque exécution', () => {
    const sql = lire('supabase/migrations/20261027120000_mm_suno_solde.sql');
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).not.toMatch(/CREATE POLICY/i);
    expect(sql).toMatch(
      /REVOKE ALL ON public\.mm_suno_solde_releves FROM PUBLIC, anon, authenticated/
    );
    expect(sql).toMatch(
      /REVOKE ALL ON FUNCTION public\.mm_suno_alerte_destinataire\(\) FROM PUBLIC, anon, authenticated/
    );
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.mm_suno_alerte_destinataire\(\) TO service_role/
    );
    expect(sql).toContain("name = 'f66_jeton_taches_planifiees'");
    expect(sql).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
    expect(sql).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  it('migration de fiabilité : état « indisponible » cohérent, configuration des seuils réservée au serveur', () => {
    const sql = lire(
      'supabase/migrations/20261027150000_mm_suno_solde_fiabilite.sql'
    );
    expect(sql).toContain(
      "CHECK (etat IN ('ok', 'bas', 'critique', 'indisponible'))"
    );
    expect(sql).toContain(
      "CHECK ((etat = 'indisponible') = (credits IS NULL))"
    );
    expect(sql).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.mm_suno_solde_config/
    );
    expect(sql).toContain(
      'ALTER TABLE public.mm_suno_solde_config ENABLE ROW LEVEL SECURITY'
    );
    expect(sql).toMatch(
      /REVOKE ALL ON public\.mm_suno_solde_config FROM PUBLIC, anon, authenticated/
    );
    expect(sql).not.toMatch(/CREATE POLICY/i);
  });

  it('la fonction enregistre aussi les pannes (clé absente comprise) au lieu de répondre sans trace', () => {
    const src = lire('supabase/functions/mm-suno-solde/index.ts');
    expect(src).not.toContain('cle_suno_absente');
    expect(src).toContain("from('mm_suno_solde_config')");
    expect(src).toContain('choisirSeuils(');
  });
});
