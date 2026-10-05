// Non-régression de la vague sécurité F66-MM (05.10.2026) — lecture statique du code, sans réseau.
//
//   deno test --no-lock --allow-read --allow-env=DEPOT_EMOTIONSCARE \
//     supabase/functions/_shared/f66mm_regles.test.ts
//   (DEPOT_EMOTIONSCARE=/chemin/du/clone/emotionscare : vérifie en plus qu'aucun dossier créé ici ne
//    porte le nom d'une fonction d'EmotionsCare — projet Supabase partagé)
//
// Chaque fonction de la vague applique une règle d'accès AVANT la première lecture du corps, le
// premier appel payant, la première lecture ou écriture en base. Une fonction retirée ne contient
// plus aucun appel en aval. Les listes ci-dessous sont la source unique : le test de démarrage
// (f66mm_demarrage.test.ts), la suite E2E (e2e-prod/f66mm.spec.ts) et le rapport les reprennent.
import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';

type Regle = 'administrateur' | 'connexion_item' | 'rappel_signe' | 'retiree';

/** Fonctions du dépôt (et ai-chat, orpheline protégée) et règle appliquée (FINALISATION.md, F66-MM). */
export const REGLES_F66MM: Record<string, Regle> = {
  // (c) administrateur : seuls des écrans d'administration les appellent
  'analytics-aggregator': 'administrateur',
  'data-integrity-check': 'administrateur',
  'extraction-monitoring': 'administrateur',
  'music-metrics': 'administrateur',
  'resend-notification': 'administrateur',
  'secure-streaming-proxy': 'administrateur',
  'security-metrics': 'administrateur',
  'ai-chat': 'administrateur',
  // (c) administrateur — fonction à session : un compte gratuit pouvait écrire le contenu partagé
  'import-edn-data': 'administrateur',
  // (a) personne connectée, puis item d'essai / Premium / administrateur
  'illustrer-case': 'connexion_item',
  // (b) rappel de fournisseur : URL signée par mm-generate-music
  'mm-suno-callback': 'rappel_signe',
  // (d) sans appelant atteignable : retirées (410)
  'admin-quick-edit': 'retiree',
  'advanced-search': 'retiree',
  'analytics-engine': 'retiree',
  'analytics-tracker': 'retiree',
  'auth-webhook': 'retiree',
  'check-performance-degradation': 'retiree',
  'check-recommendation-alerts': 'retiree',
  'compare-official-content': 'retiree',
  'content-master-api': 'retiree',
  'ecos-api': 'retiree',
  'edn-tableaux-api': 'retiree',
  'error-handling-service': 'retiree',
  'error-logger': 'retiree',
  'generate-exam': 'retiree',
  'generate-security-report': 'retiree',
  'items-completeness-check': 'retiree',
  'mm-monitoring-alerts': 'retiree',
  'pedagogical-content-api': 'retiree',
  'security-scanner': 'retiree',
  'spotify-ai-complete': 'retiree',
  'system': 'retiree',
  'webhooks': 'retiree',
  // (d) fonctions à session sans appelant atteignable, dangereuses pour un simple compte gratuit
  // (push à tous les abonnés, IA payante sans limite, suppression sans contrôle du propriétaire)
  'ai-recommendations': 'retiree',
  'cancel-ia-task': 'retiree',
  'content-ai-generator': 'retiree',
  'items-completeness-api': 'retiree',
  'mm-send-push-notification': 'retiree',
};

/**
 * Orphelines retirées (410) : déployées dans le projet partagé sans code dans le dépôt MED MNG
 * (code supprimé — ORPHELINES_MED_MNG) ni dans celui d'EmotionsCare (ORPHELINES_SANS_ORIGINE).
 * Liste recalculée le 05.10.2026 : fonctions déployées (list_edge_functions, 555) moins les
 * dossiers des deux dépôts ; ai-chat, seule à avoir un appelant atteignable (page
 * d'administration), est protégée au lieu d'être retirée.
 */
export const ORPHELINES_MED_MNG: string[] = [
  'ai-code-analysis', 'ai-notifications', 'ai-visual-analysis', 'cas-auth-puppeteer',
  'cas-cookies-replica', 'clean-generic-lisa-content', 'complete-by-url', 'complete-edn-content',
  'complete-edn-with-oic', 'complete-oic-competences', 'complete-oic-no-min', 'complete-oic-urls',
  'deno-oic-extractor', 'edn-lyrics-generate', 'edn-system-consistency-check', 'enhance-lyrics-ai',
  'extract-all-oic', 'extract-oic-api-first', 'extract-oic-comprehensive', 'extract-uness-enhanced',
  'extract-with-cas-auth', 'fix-completed-tracks', 'fix-incomplete-oic', 'fix-oic-item-205',
  'fix-oic-truncated-content', 'fix-short-content', 'generate-all-lyrics',
  'generate-all-lyrics-rich', 'generate-lyrics-bulk', 'generate-lyrics-refined',
  'generate-music-premium', 'generate-music-v2', 'get-generation-status', 'get-quality-history',
  'github-quality-webhook', 'lyrics-aligner', 'med-analytics-dashboard',
  'music-performance-monitor', 'oic-cas-extraction', 'oic-extraction-direct',
  'oic-extraction-proven', 'oic-readme-extraction', 'openai-speech', 'platform-analytics',
  'platform-features', 'puppeteer-oic-extraction', 'puppeteer-oic-final', 'referentiel-uness-2026',
  'reimport-edn-complete', 'secure-music-generation', 'security-alerts', 'send-quality-alert',
  'send-quality-digest', 'send-scheduled-pdf-reports', 'sitemap-recommendations',
  'suno-music-optimized', 'sync-edn-content', 'system-health', 'test-cas-auth', 'test-connectivity',
  'test-oic-simple', 'test-simple-api', 'text-to-speech-advanced', 'update-edn-competences',
  'update-edn-unique-content', 'verify-completeness-oic', 'weekly-security-report',
];
export const ORPHELINES_SANS_ORIGINE: string[] = [
  'audio-concatenation', 'batch-generate-medical-content', 'calculate-who5-card', 'coach-ai-assist',
  'coach-assess-start', 'coach-assess-submit', 'delete-user-data', 'emotional-scan',
  'export-pdf-report', 'extract-official-content', 'fetch-legifrance-content',
  'generate-ai-content', 'generate-audio', 'generate-biovida-analysis', 'generate-insights',
  'generate-medical-content', 'generate-medical-fiche', 'generate-medilinko-consultation',
  'generate-music-extended', 'generate-music-prompt', 'generate-music-status',
  'generate-music-with-voice', 'generate-pdf-report', 'get-ai-content', 'hume-emotion-detect',
  'initial-full-extraction', 'music-therapy-start', 'music-therapy-submit', 'nyvee-assess',
  'openai-config', 'openai-status', 'openai-test', 'regenerate-ai-content',
  'schedule-content-updates', 'send-invitation-email', 'send-medilinko-to-doctor',
  'story-music-generate', 'stripe-checkout', 'suno-music-generate', 'team-aggregate-b2b',
  'team-notifications', 'urge-gpt-response', 'verify-all-modules',
];
export const ORPHELINES_RETIREES: string[] = [...ORPHELINES_MED_MNG, ...ORPHELINES_SANS_ORIGINE];

const RACINE = new URL('../', import.meta.url);
const lire = (fonction: string) => Deno.readTextFileSync(new URL(`${fonction}/index.ts`, RACINE));

/** Opérations qui coûtent, écrivent, lisent la base ou lisent la requête : interdites avant la garde. */
const OPERATION_SENSIBLE =
  /req\.(json|text|formData|arrayBuffer)\(|fetch\(|\.from\(|\.rpc\(|\.storage\b|functions\.invoke\(|completionIA\(|\.insert\(|\.update\(|\.upsert\(|\.delete\(|emails\.send\(/;

function debutGestionnaire(source: string): number {
  const options = source.search(/req\.method\s*===?\s*['"]OPTIONS['"]/);
  assert(options >= 0, 'gestionnaire (test OPTIONS) introuvable');
  return options;
}

/** Position de la première opération sensible après `depuis` (lignes de commentaire ignorées). */
function premiereOperationSensible(source: string, depuis: number, motif = OPERATION_SENSIBLE): number {
  let position = depuis;
  for (const ligne of source.slice(depuis).split('\n')) {
    const code = /^\s*(\/\/|\*)/.test(ligne) ? '' : ligne;
    const m = code.search(motif);
    if (m >= 0) return position + m;
    position += ligne.length + 1;
  }
  return Number.POSITIVE_INFINITY;
}

/** Position (absolue) de `motif` après le début du gestionnaire ; -1 si absent. */
function apres(source: string, depuis: number, motif: RegExp): number {
  const i = source.slice(depuis).search(motif);
  return i < 0 ? -1 : depuis + i;
}

Deno.test('F66-MM : listes cohérentes (137 retirées dont 110 orphelines, sans doublon)', () => {
  assertEquals(ORPHELINES_MED_MNG.length, 67);
  assertEquals(ORPHELINES_SANS_ORIGINE.length, 43);
  const toutes = [...Object.keys(REGLES_F66MM), ...ORPHELINES_RETIREES];
  assertEquals(new Set(toutes).size, toutes.length, 'fonction classée deux fois');
  const retirees = Object.values(REGLES_F66MM).filter((r) => r === 'retiree').length + ORPHELINES_RETIREES.length;
  assertEquals(retirees, 137);
});

Deno.test("F66-MM : aucun dossier créé ne porte le nom d'une fonction d'EmotionsCare", () => {
  let depot: string | undefined;
  try {
    depot = Deno.env.get('DEPOT_EMOTIONSCARE');
  } catch {
    depot = undefined; // --allow-env non accordé
  }
  if (!depot) {
    console.warn('DEPOT_EMOTIONSCARE non défini : vérification croisée ignorée.');
    return;
  }
  const ec = new Set([...Deno.readDirSync(`${depot}/supabase/functions`)].filter((e) => e.isDirectory).map((e) => e.name));
  assert(ec.size > 100, `dépôt EmotionsCare introuvable ou vide (${depot})`);
  const collisions = [...Object.keys(REGLES_F66MM), ...ORPHELINES_RETIREES].filter((n) => ec.has(n));
  assertEquals(collisions, []);
});

const toutes: [string, Regle][] = [
  ...Object.entries(REGLES_F66MM),
  ...ORPHELINES_RETIREES.map((n): [string, Regle] => [n, 'retiree']),
];

for (const [fonction, regle] of toutes) {
  Deno.test(`F66-MM ${fonction} : règle « ${regle} » avant toute lecture du corps, tout appel payant et toute écriture`, () => {
    const source = lire(fonction);

    if (regle === 'retiree') {
      assert(/return fonctionRetiree\(enTetes, /.test(source), 'réponse 410 (fonctionRetiree) attendue');
      assert(source.includes("'x-mm-fonction-retiree': 'F66-MM'"), 'témoin x-mm-fonction-retiree attendu');
      assert(/return new Response\(null, \{ headers: enTetes \}\)/.test(source), 'OPTIONS doit porter le témoin');
      for (const interdit of [OPERATION_SENSIBLE, /createClient\(/, /Deno\.env\.get\(/]) {
        assertEquals(interdit.test(source), false, `${interdit} présent dans une fonction retirée`);
      }
      const imports = [...source.matchAll(/^import .* from ['"]([^'"]+)['"];?$/gm)].map((m) => m[1]);
      assertEquals(imports, ['https://deno.land/std@0.224.0/http/server.ts', '../_shared/cors.ts', '../_shared/mm-garde.ts']);
      return;
    }

    const debut = debutGestionnaire(source);
    const sensible = premiereOperationSensible(source, debut);

    if (regle === 'administrateur') {
      const garde = apres(source, debut, /const acces = await exigerAdministrateur\(req, corsHeaders\);\n\s*if \(acces instanceof Response\) return acces;/);
      assert(garde >= 0, 'exigerAdministrateur (et son retour) absent du gestionnaire');
      assert(garde < sensible, 'une opération sensible précède exigerAdministrateur');
      return;
    }

    if (regle === 'connexion_item') {
      const connexion = apres(source, debut, /const appelant = await exigerConnexion\(req, cors\)\n\s*if \(appelant instanceof Response\) return appelant/);
      assert(connexion >= 0 && connexion < sensible, 'exigerConnexion doit précéder la lecture du corps');
      // Après la lecture du corps : l'accès à l'item avant toute lecture en base et tout appel payant.
      const acces = apres(source, debut, /const refus = await verifierAccesItem\(appelant, String\(itemCode\), cors\)\n\s*if \(refus\) return refus/);
      assert(acces > connexion, 'verifierAccesItem absent');
      const base = premiereOperationSensible(source, debut, /fetch\(|\.from\(|\.rpc\(|\.storage\b|createClient\(/);
      assert(acces < base, 'une lecture en base ou un appel payant précède verifierAccesItem');
      return;
    }

    if (regle === 'rappel_signe') {
      const signature = apres(source, debut, /const rappel = await verifierUrlRappel\(req\.url, Deno\.env\.get\('SUPABASE_SERVICE_ROLE_KEY'\) \?\? ''\);\n\s*if \(!rappel\) \{/);
      assert(signature >= 0 && signature < sensible, "la signature de l'URL doit être vérifiée avant la lecture du corps");
      const proprietaire = apres(source, debut, /if \(!principale \|\| \(principale\.user_id \?\? null\) !== rappel\.userId\) \{/);
      assert(proprietaire > signature, 'contrôle du propriétaire de la génération absent');
      const ecriture = apres(source, debut, /checkIdempotency\(|markCompleted\(|marquerGenerationEchouee\(|enregistrerPistesSuno\(/);
      assert(proprietaire < ecriture, 'une écriture précède le contrôle du propriétaire');
    }
  });
}

Deno.test("F66-MM : mm-generate-music donne à Suno une URL de rappel signée, jamais l'URL nue", () => {
  const source = lire('mm-generate-music');
  assert(/callBackUrl: await signerUrlRappel\(/.test(source), 'signerUrlRappel attendu');
  assertEquals(/functions\/v1\/mm-suno-callback`/.test(source), false, 'URL de rappel non signée');
});

Deno.test('F66-MM : garde commune — accès à un item : essai, puis Premium/administrateur, clé de service', () => {
  const garde = Deno.readTextFileSync(new URL('./mm-garde.ts', import.meta.url));
  const corps = garde.slice(garde.indexOf('export async function verifierAccesItem'));
  const service = corps.indexOf('if (appelant.service) return null;');
  const gratuit = corps.indexOf("rpc('mm_item_gratuit', { p_item_code: itemCode })");
  const premium = corps.indexOf("rpc('mm_a_acces_premium', { p_user_id: appelant.userId })");
  assert(service >= 0 && gratuit > service && premium > gratuit, 'ordre : service, item d’essai, Premium');
  assert(/repondre\(cors, 402, 'PREMIUM_REQUIS'/.test(corps), '402 PREMIUM_REQUIS attendu');
  assert(/export const fonctionRetiree = \(cors: Cors, message: string\) => repondre\(cors, 410, 'RETIREE', message\);/.test(garde));
});
