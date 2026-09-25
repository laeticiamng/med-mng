#!/usr/bin/env node
/**
 * Vérification « zéro bouton mort » — parcours complet du site en VISITEUR NON CONNECTÉ.
 *
 * Usage :
 *   npx vite build && setsid npx vite preview --port 4201 --host 127.0.0.1 &
 *   node scripts/verif-zero-bouton-mort.mjs [--json rapport.json] [--mobile] [--externes]
 *
 * Variables : BASE_URL (défaut http://127.0.0.1:4201), CHROMIUM_PATH (défaut
 * /opt/pw-browsers/chromium s'il existe), MAX_PAGES (défaut 400), MAX_PAR_MOTIF
 * (défaut 3 : nombre d'URL testées par route paramétrée, ex. /edn-complete/:slug),
 * MAX_PAR_LIBELLE (défaut 2 : boutons répétitifs d'une même page), MAX_PAGES_MOBILE
 * (défaut 12, avec --mobile), DEBUG=1 (trace de chaque clic sur stderr).
 * Options : --json <fichier> (rapport détaillé), --mobile (passe en 390×844),
 * --externes (vérifie les liens sortants), --seulement /a,/b (pages données, sans suivi des liens),
 * --sans-boutons (statut, console et textes seulement : rapide), --bandeau (avec --seulement :
 * teste aussi le bandeau cookies).
 *
 * Ce que fait le script, pour chaque page atteinte (routes déclarées dans
 * src/config/routes.ts, sitemap public/sitemap.xml, puis tous les liens internes
 * rencontrés) :
 *   1. statut HTTP, redirection effective, page « 404 / Page introuvable »,
 *      écran d'erreur, erreurs console (hors 401/403 attendus sans session et
 *      hors HEAD storage bd-illustrations) ;
 *   2. texte visible : anglais, textes suspects (« Lorem », « bientôt »,
 *      « coming soon », « TODO », « mock », « undefined », « NaN », « null »,
 *      « [object », « {{ », chiffres marketing inventés…), tutoiement ;
 *   3. chaque bouton visible (<button>, [role=button], contrôles cliquables) est
 *      cliqué — sauf ceux qui paient, génèrent, suppriment, envoient un e-mail
 *      ou déconnectent — et l'on vérifie qu'il se passe quelque chose
 *      (navigation, modale, changement du DOM, toast, presse-papiers, nouvel
 *      onglet). Les menus (aria-haspopup) sont ouverts et chaque entrée testée ;
 *   4. les formulaires publics sont soumis vides puis avec une adresse invalide :
 *      un message de validation doit apparaître (aucun compte n'est créé) ;
 *   5. les liens internes vers une route inexistante sont signalés.
 *
 * Sortie : tableau OK/KO par page, liste des boutons morts, erreurs console,
 * textes suspects, liens cassés. Code de sortie 1 s'il reste au moins un KO.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4201').replace(/\/$/, '');
const CHROMIUM = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '400', 10);
const MAX_PAR_MOTIF = parseInt(process.env.MAX_PAR_MOTIF || '3', 10);
// Boutons répétitifs d'une même page (« Commencer l'item 6 », « … 7 », …) : on en
// teste MAX_PAR_LIBELLE par libellé (chiffres remplacés par #), pas les 367.
const MAX_PAR_LIBELLE = parseInt(process.env.MAX_PAR_LIBELLE || '2', 10);
const ARGS = process.argv.slice(2);
const option = (nom) => ARGS.includes(nom);
const valeurOption = (nom) => (ARGS.includes(nom) ? ARGS[ARGS.indexOf(nom) + 1] : undefined);
const SORTIE_JSON = valeurOption('--json');
const TESTER_MOBILE = option('--mobile');
const TESTER_EXTERNES = option('--externes');
const SEULEMENT = valeurOption('--seulement'); // ex. --seulement /faq,/about
const SANS_BOUTONS = option('--sans-boutons'); // audit texte/console seulement (rapide)
const lire = (p) => readFileSync(resolve(RACINE, p), 'utf8');

// ---- Paramètres de routes ----------------------------------------------------
// Valeurs de substitution pour les routes paramétrées (cf. consigne : IC-1 et IC-247).
const ECHANTILLONS = {
  ':slug': ['IC-1', 'IC-247'],
  ':itemCode': ['IC-1', 'IC-247'],
};
// Routes dont le paramètre est un slug de base (minuscules) et non un code d'item.
const ECHANTILLONS_PAR_ROUTE = {
  '/edn/:slug/immersive': { ':slug': ['ic-1', 'ic-247'] },
};

// ---- Boutons à ne JAMAIS cliquer (paiement, génération, suppression, envoi, déconnexion)
const NE_PAS_CLIQUER = /\b(payer|paiement|s['’]abonner|abonner|souscrire|checkout|acheter|commander|passer (?:premium|à premium)|générer|generer|génération|regénérer|relancer la génération|créer (?:ma|une|la) (?:musique|chanson)|supprimer|effacer|vider|delete|envoyer|soumettre|send|déconnexion|se déconnecter|logout|installer|mettre à jour|réinitialiser|resend|renvoyer)\b/i;
// Les suggestions du tuteur IA lancent un appel IA : jamais cliquées.
const NE_PAS_CLIQUER_EXACT = /^(explique-moi|quels sont|génère-moi|donne-moi|liens avec|signes cliniques)/i;

// ---- Parcours multi-étapes (pages dont les boutons n'apparaissent qu'au fil des clics)
// Chaque étape : nom exact d'un bouton, ou { contient: 'texte' } pour une carte cliquable.
// L'état atteint après k étapes est analysé comme une page à part entière.
const PARCOURS = {
  '/demo': [
    'Commencer la démo',
    { contient: '#228' },
    'Essayer les flashcards',
    { contient: 'Cliquez pour retourner' },
    'Carte suivante',
    { contient: 'Cliquez pour retourner' },
    'Écouter la musique IA',
    'Essayer un cas clinique',
    { contient: 'Réaliser un ECG' },
    'Valider',
    'Tester le mode examen',
    { contient: 'ECG 12 dérivations' },
    'Valider',
    'Voir les résultats',
  ],
};

// ---- Erreurs console/réseau tolérées quand on n'est pas connecté --------------
const IGNORER_RESEAU = [
  { statuts: [401, 403], motif: /supabase\.co\/(rest|auth|functions|storage)\// },
  // Sondes HEAD des planches (bd-illustrations) : 400/404 attendus quand l'image n'existe pas.
  { motif: /storage\/v1\/object\/.*bd-illustrations/ },
  // RPC créée par la migration supabase/migrations/20260925120000_mm_etat_contenu_immersif.sql,
  // pas encore appliquée sur la base partagée : le code traite l'absence (statut « indisponible »).
  { statuts: [404], motif: /rest\/v1\/rpc\/mm_etat_contenu_immersif/ },
];
const IGNORER_CONSOLE = [
  /status of (401|403)/i,
  /bd-illustrations/,
  /Download the React DevTools/i,
  /Failed to load resource: net::ERR_(BLOCKED_BY_CLIENT|FAILED)/i, // bloqueurs / fonts hors-ligne
  /AudioContext was not allowed to start/i,
  /The play\(\) request was interrupted/i,
  /\[Sentry\]/i,
];

// ---- Détection de textes ----------------------------------------------------
const TEXTES_SUSPECTS = [
  // grave : rend la page KO ; sinon : signalé pour relecture (mot courant en français).
  { nom: 'Lorem ipsum', regex: /\blorem\b/i, grave: true },
  { nom: '« bientôt / prochainement / à venir »', regex: /\b(bient[ôo]t|prochainement|à venir|en construction|en cours de d[ée]veloppement|pas encore disponible|non disponible pour le moment)\b/i, grave: true },
  { nom: 'coming soon', regex: /coming soon/i, grave: true },
  { nom: 'TODO', regex: /\bTODO\b/, grave: true },
  { nom: 'mock', regex: /\bmock(?:s|ed|é|ée)?\b/i, grave: true },
  { nom: 'contenu factice', regex: /\b(fictif|fictive|fictifs|factice|placeholder|(?:mode|données|version|compte|contenu|environnement|utilisateur) (?:de )?(?:démo|demo|test|exemple))\b/i, grave: true },
  { nom: 'undefined', regex: /\bundefined\b/, grave: true },
  { nom: 'NaN', regex: /\bNaN\b/, grave: true },
  { nom: 'null', regex: /\bnull\b/, grave: true },
  { nom: '[object', regex: /\[object\b/, grave: true },
  { nom: '{{', regex: /\{\{/, grave: true },
  { nom: 'démo', regex: /\bd[ée]mo(?:s)?\b/i, grave: false },
  { nom: 'exemple', regex: /\bexemple(?:s)?\b/i, grave: false },
  { nom: 'test', regex: /\btest(?:s|er|é|ée)?\b/i, grave: false },
  { nom: 'chiffre à vérifier (+10 000, 4.9/5, 98 %)', regex: /(\+\s?\d[\d\s\u00a0\u202f]{2,}\b|\b\d[.,]\d\s?\/\s?5\b|\b(9\d|100)\s?%)/, grave: false },
];
const ANGLAIS = /^(the|and|with|your|you|loading|welcome|login|logout|submit|cancel|search|settings|download|upload|next|previous|back|close|open|save|delete|edit|toggle|error|success|warning|small|medium|please|home|dashboard|profile|library|create|generate|share|copy|copied|empty|untitled|unknown|available|soon|new|more|all|show|hide|view|start|learn|read|try|again|found|something|wrong|here|click|results|welcome|password|email|user|account|free|upgrade|subscribe|choose|month|year|features|about|help|terms|privacy|policy)$/i;
const EXPRESSIONS_ANGLAISES = /\b(coming soon|sign (?:in|up)|log ?in|read more|learn more|get started|try again|not found|something went wrong|click here|view all|see all|show more|no results|loading\.\.\.|please wait|welcome back|forgot password|reset password|create account|my account|settings|dashboard)\b/i;
// Tutoiement. Trois détecteurs, pour limiter les faux positifs du vocabulaire médical :
//  1. pronoms/déterminants de 2e personne (tu, te, toi, ton, ta, tes, t'…), sensibles à la
//     casse pour ne pas confondre « TA » (tension artérielle) ou « TE » avec « ta »/« te » ;
//  2. impératifs sans ambiguïté avec la 3e personne (apprends, retiens, inscris-toi…) ;
//  3. impératifs en -e (écoute, découvre, crée…) seulement en tête de phrase, avec majuscule,
//     suivis d'un complément typique ou d'une ponctuation (« Écoute. Apprends. »).
const TUTOIEMENT_PRONOMS = /(?:^|[^\p{L}'’-])(?:tu|te|toi|ton|ta|tes|Tu|Te|Toi|Ton|Ta|Tes|[tT]['’](?:es|as|inscris|abonnes|apprends|entraînes|améliores|aide|attend|attendent|épuiser|épuises|inspire|adapte|adaptes|accompagne|aider|offrir|offre|propose|permet|permettre|permettra))(?=[^\p{L}'’-]|$)/u;
const TUTOIEMENT_IMPERATIFS = /\b(apprends|retiens|rejoins|réponds|reviens|deviens|obtiens|reçois|inscris-toi|connecte-toi|abonne-toi|lance-toi|prépare-toi|entraîne-toi|amuse-toi|vas-y|dépêche-toi)\b/iu;
const COMPLEMENT = "(?:[.!]|\\s+(?:la|le|les|l['’]|un|une|des|ta|ton|tes|en|à|au|aux|ce|cette|ces|d['’]|maintenant|gratuitement|ici|dès|vite|tout de suite|sans|avec|pour|sur|chaque|toute?s?|plus|moins|mieux|encore|aussi|bien|comment|ce que)\\b)";
const TUTOIEMENT_TETE = new RegExp("^(?:Écoute|Apprends|Retiens|Découvre|Commence|Crée|Révise|Teste|Essaie|Profite|Regarde|Clique|Génère|Mémorise|Explore|Prépare|Utilise|Installe|Télécharge|Lance|Rejoins)" + COMPLEMENT, 'u');
// Faux positifs à ignorer (noms communs, titres…).
const TUTOIEMENT_IGNORER = /\b(le ton|ton (?:de|du|des|musical|neutre|juste|sur)|d'un ton|au ton)\b/i;
const detecterTutoiement = (phrase) => {
  const ph = phrase.trim();
  if (/[«»]/.test(ph)) return false; // dialogue cité (récit, témoignage), pas l'interface
  const m = TUTOIEMENT_PRONOMS.exec(ph);
  if (m && !TUTOIEMENT_IGNORER.test(ph.slice(Math.max(0, m.index - 20), m.index + 30))) return true;
  if (TUTOIEMENT_IMPERATIFS.test(ph)) return true;
  return TUTOIEMENT_TETE.test(ph);
};

// ---- Résultats -------------------------------------------------------------
const pages = []; // { url, urlFinale, statut, etat, redirection, erreursConsole:[], suspects:[], boutons:{testes, morts, recouverts, ignores}, formulaires:[], liensCasses:[], verdict }
const boutonsMorts = [];
const erreursConsole = [];
const textesSuspects = new Map(); // clé → { type, extrait, pages:Set }
const liensCasses = [];
const liensExternes = new Map();
const aTesterConnecte = [];
// Contrôles communs à toutes les pages (barre de navigation, pied de page, boutons flottants) :
// testés une seule fois, sur la première page où ils apparaissent.
const globauxTestes = new Set();
const ajouterSuspect = (type, extrait, url) => {
  const cle = `${type}|${extrait}`;
  if (!textesSuspects.has(cle)) textesSuspects.set(cle, { type, extrait, pages: new Set() });
  textesSuspects.get(cle).pages.add(url);
};

// ---- Routes déclarées --------------------------------------------------------
const ROUTES = Object.fromEntries([...lire('src/config/routes.ts').matchAll(/^\s*(\w+):\s*'([^']+)'/gm)].map((m) => [m[1], m[2]]));
const ROUTES_APP = [...lire('src/App.tsx').matchAll(/path="(\/[^"]*)"/g)].map((m) => m[1]);
const SITEMAP = existsSync(resolve(RACINE, 'public/sitemap.xml'))
  ? [...lire('public/sitemap.xml').matchAll(/<loc>[^<]*?(\/[^<]*)?<\/loc>/g)].map((m) => {
      const u = new URL(m[0].replace(/<\/?loc>/g, ''));
      return u.pathname + u.search;
    })
  : [];
const NAVIGATION = lire('src/config/navigation.ts');

/** Expanse une route paramétrée en URL concrètes (IC-1, IC-247), ou [] si aucun échantillon connu. */
const expanser = (route) => {
  if (route === '*' || route.includes('*')) return [];
  const params = route.match(/:\w+/g);
  if (!params) return [route];
  let urls = [route];
  for (const p of params) {
    const valeurs = ECHANTILLONS_PAR_ROUTE[route]?.[p] || ECHANTILLONS[p];
    if (!valeurs) return []; // découvert par les liens (parcours/:slug, ecos/:scenarioId…) ou protégé
    urls = urls.flatMap((u) => valeurs.map((v) => u.replace(p, v)));
  }
  return urls;
};
const routesConnues = [...new Set([...Object.values(ROUTES), ...ROUTES_APP])].filter((r) => r !== '*');
/** Vérifie qu'un chemin correspond à une <Route> déclarée (sinon → NotFound). */
const routeExiste = (chemin) => {
  const segs = chemin.split('/').filter(Boolean);
  return routesConnues.some((r) => {
    const rs = r.split('/').filter(Boolean);
    // Route parente /edn-complete/:slug + sous-routes (apercu, rang-a, …, *)
    if (r === ROUTES.ednCompleteDetail && segs.length >= 2 && segs[0] === 'edn-complete') return true;
    if (rs.length !== segs.length) return false;
    return rs.every((s, i) => s.startsWith(':') || s === segs[i]);
  });
};

// ---- Motif d'URL (pour plafonner les routes paramétrées) --------------------
const motifDe = (chemin) => {
  for (const r of routesConnues) {
    if (!r.includes(':')) continue;
    const rs = r.split('/').filter(Boolean);
    const segs = chemin.split('/').filter(Boolean);
    if (r === ROUTES.ednCompleteDetail && segs[0] === 'edn-complete' && segs.length >= 2) return `/edn-complete/:slug/${segs[2] || ''}`;
    if (rs.length === segs.length && rs.every((s, i) => s.startsWith(':') || s === segs[i])) return r;
  }
  return chemin;
};

// ---- Normalisation des liens ------------------------------------------------
const normaliser = (href, depuis) => {
  try {
    const u = new URL(href, depuis);
    if (u.origin !== new URL(BASE).origin) return { externe: u.href };
    let chemin = u.pathname.replace(/\/+$/, '') || '/';
    chemin = decodeURIComponent(chemin);
    return { interne: chemin + (u.search || '') };
  } catch {
    return null;
  }
};

// ---- Navigateur ------------------------------------------------------------
const navigateur = await chromium.launch({ executablePath: CHROMIUM, headless: true });
const creerContexte = (mobile = false) =>
  navigateur.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'fr-FR',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
const preparerContexte = async (contexte, { consentement = true } = {}) => {
  await contexte.addInitScript((consent) => {
    try {
      if (consent) {
        localStorage.setItem('medmng_cookie_consent', 'true');
        localStorage.setItem('medmng_cookie_preferences', JSON.stringify({ essential: true, functional: false, analytics: false }));
      }
      localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    } catch { /* stockage indisponible */ }
    // Compteurs d'effets observables pour la détection des boutons morts.
    window.__zbm = { mutations: 0, fenetres: 0, pressePapiers: 0, alertes: 0, cible: null };
    const ouvrir = window.open;
    window.open = function (...args) { window.__zbm.fenetres++; try { return ouvrir.apply(this, args); } catch { return null; } };
    if (navigator.clipboard) {
      const ecrire = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = (t) => { window.__zbm.pressePapiers++; return ecrire(t).catch(() => {}); };
    }
    const obs = new MutationObserver((liste) => {
      for (const m of liste) {
        const cible = window.__zbm.cible;
        if (cible && (m.target === cible || cible.contains(m.target))) {
          // Sur le bouton lui-même : un changement d'état (aria-checked, data-state,
          // icône remplacée…) compte ; pas les styles inline (animations au clic).
          if (m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'tabindex')) continue;
          if (m.type === 'characterData') continue;
        }
        window.__zbm.mutations++;
      }
    });
    document.addEventListener('DOMContentLoaded', () => obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true }));
  }, consentement);
};

const DEBUG = Boolean(process.env.DEBUG);
const debug = (...a) => { if (DEBUG) process.stderr.write(`[debug ${new Date().toISOString().slice(11, 19)}] ${a.join(' ')}\n`); };
const attendreCalme = async (page) => {
  const t0 = Date.now();
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
  // Spinners de chargement (PageLoader, Loader2…) : on attend qu'ils disparaissent,
  // ou que leur nombre se stabilise (sentinelle de chargement progressif, toujours présente).
  let precedent = -1;
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('.animate-spin').length).catch(() => 0);
    if (n === 0 || n === precedent) break;
    precedent = n;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(300);
  debug(`calme en ${Date.now() - t0} ms`);
};

const texteVisible = (page) => page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim());
const cheminCourant = (page) => {
  const u = new URL(page.url());
  return (u.pathname.replace(/\/+$/, '') || '/') + u.search;
};

/** Signature stable d'un contrôle (pour le retrouver après un rechargement). */
const SELECTEUR_CONTROLES = 'button, [role="button"], input[type="button"], input[type="submit"], summary, a:not([href]), [role="menuitem"], [role="tab"], [role="switch"], [role="checkbox"], [role="combobox"], [class*="cursor-pointer"]';
const listerControles = (page) =>
  page.evaluate((selecteur) => {
    const visibles = [];
    const nomDe = (el) => {
      const aria = el.getAttribute('aria-label') || el.getAttribute('title');
      const texte = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      const svg = el.querySelector('svg');
      const classeSvg = svg ? [...svg.classList].find((c) => c.startsWith('lucide-')) : null;
      return (aria || texte || (classeSvg ? `icône ${classeSvg.replace('lucide-', '')}` : '') || el.getAttribute('name') || el.id || el.tagName.toLowerCase()).slice(0, 80);
    };
    const els = [...document.querySelectorAll(selecteur)];
    const compte = new Map();
    els.forEach((el) => {
      // Un élément « cursor-pointer » à l'intérieur d'un bouton ou d'un lien ne compte pas deux fois.
      if (!el.matches('button, [role="button"], input, summary, a, [role="menuitem"], [role="tab"], [role="switch"], [role="checkbox"], [role="combobox"]') && el.closest('a[href], button, [role="button"], [role="menuitem"]')) return;
      if (el.closest('a[href]') && !el.matches('button')) return; // lien : testé via href
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const visible = r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      if (!visible) return;
      if (el.closest('[aria-hidden="true"]')) return;
      const nom = nomDe(el);
      const type = el.matches('[role="menuitem"]') ? 'menuitem' : el.matches('button, input[type="button"], input[type="submit"]') ? 'button' : el.getAttribute('role') || (el.matches('summary') ? 'summary' : el.matches('a') ? 'a-sans-href' : 'cursor-pointer');
      const cle = `${type}|${nom}`;
      const idx = compte.get(cle) || 0;
      compte.set(cle, idx + 1);
      visibles.push({
        nom, type, idx,
        desactive: el.matches(':disabled, [aria-disabled="true"]'),
        dejaActif: el.matches('[aria-selected="true"], [data-state="active"], [aria-current], [aria-pressed="true"]'),
        dansFormulaire: Boolean(el.closest('form')) && (el.matches('button:not([type]), button[type="submit"], input[type="submit"]')),
        haspopup: el.getAttribute('aria-haspopup') || (el.matches('[role="combobox"]') ? 'listbox' : null),
        global: Boolean(el.closest('nav, footer')) || [...(function* () { let n = el; while (n && n !== document.body) { yield n; n = n.parentElement; } })()].some((n) => getComputedStyle(n).position === 'fixed'),
        tag: el.tagName.toLowerCase(),
        y: Math.round(r.top + window.scrollY),
      });
    });
    return visibles;
  }, SELECTEUR_CONTROLES);

/** Retrouve l'élément d'après sa signature (type, nom, index). */
const trouverControle = (page, ctrl) =>
  page.evaluateHandle(({ selecteur, ctrl }) => {
    const nomDe = (el) => {
      const aria = el.getAttribute('aria-label') || el.getAttribute('title');
      const texte = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      const svg = el.querySelector('svg');
      const classeSvg = svg ? [...svg.classList].find((c) => c.startsWith('lucide-')) : null;
      return (aria || texte || (classeSvg ? `icône ${classeSvg.replace('lucide-', '')}` : '') || el.getAttribute('name') || el.id || el.tagName.toLowerCase()).slice(0, 80);
    };
    let n = 0;
    for (const el of document.querySelectorAll(selecteur)) {
      if (!el.matches('button, [role="button"], input, summary, a, [role="menuitem"], [role="tab"], [role="switch"], [role="checkbox"], [role="combobox"]') && el.closest('a[href], button, [role="button"], [role="menuitem"]')) continue;
      if (el.closest('a[href]') && !el.matches('button')) continue;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!(r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0')) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const type = el.matches('[role="menuitem"]') ? 'menuitem' : el.matches('button, input[type="button"], input[type="submit"]') ? 'button' : el.getAttribute('role') || (el.matches('summary') ? 'summary' : el.matches('a') ? 'a-sans-href' : 'cursor-pointer');
      if (type !== ctrl.type || nomDe(el) !== ctrl.nom) continue;
      if (n === ctrl.idx) return el;
      n++;
    }
    return null;
  }, { selecteur: SELECTEUR_CONTROLES, ctrl });

const etatOuvert = (page) =>
  page.evaluate(() => ({
    dialogues: [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [data-state="open"][data-side], .fixed.inset-0')].filter((e) => !/pointer-events-none|-z-10/.test(e.className) && e.getAttribute('data-state') !== 'closed').length,
    spinners: document.querySelectorAll('.animate-spin').length,
    toasts: [...document.querySelectorAll('[data-sonner-toast], [role="status"], li[data-state="open"]')].map((t) => (t.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
  }));

/**
 * Clique un contrôle et mesure l'effet : navigation, mutation du DOM (modale,
 * toast, menu…), nouvel onglet, presse-papiers, boîte de dialogue native.
 */
const cliquer = async (page, contexte, ctrl, urlPage) => {
  const poignee = await trouverControle(page, ctrl);
  const el = poignee.asElement();
  if (!el) return { resultat: 'introuvable' };
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.evaluate((e) => { window.__zbm.mutations = 0; window.__zbm.fenetres = 0; window.__zbm.pressePapiers = 0; window.__zbm.alertes = 0; window.__zbm.cible = e; }, el);
  const avant = { url: cheminCourant(page), etat: await etatOuvert(page), pages: contexte.pages().length };
  let alerte = null;
  const surDialogue = (d) => { alerte = d.type(); d.dismiss().catch(() => {}); };
  page.once('dialog', surDialogue);
  let telechargement = false;
  const surTelechargement = () => { telechargement = true; };
  page.once('download', surTelechargement);
  try {
    try {
      await el.click({ timeout: 4000 });
    } catch (e1) {
      // Élément fixe hors écran tant que la page n'est pas défilée (barre d'appel à
      // l'action mobile, bouton « remonter ») : on défile en bas et on réessaie une fois.
      if (!/Timeout/i.test(String(e1.message || e1))) throw e1;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
      await page.waitForTimeout(700);
      await el.click({ timeout: 4000 });
    }
  } catch (e) {
    page.off('dialog', surDialogue);
    page.off('download', surTelechargement);
    const msg = String(e.message || e);
    if (/intercepts pointer events/.test(msg)) {
      const par = /<([a-z]+[^>]*)>[^<]*<\/[a-z]+> intercepts pointer events|(<[^>]+>) intercepts pointer events/i.exec(msg);
      return { resultat: 'recouvert', detail: (par?.[1] || par?.[2] || msg.split('\n').find((l) => /intercepts/.test(l)) || '').slice(0, 160) };
    }
    if (/detached|not attached|Target closed/i.test(msg)) return { resultat: 'introuvable' };
    return { resultat: 'erreur-clic', detail: msg.split('\n')[0].slice(0, 160) };
  }
  // On laisse jusqu'à 1,5 s à l'effet pour se manifester, en sortant dès qu'il apparaît.
  let effet = null;
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(100);
    const cpt = await page.evaluate(() => window.__zbm).catch(() => null);
    if (!cpt) { effet = 'navigation'; break; } // contexte détruit = navigation complète
    const url = cheminCourant(page);
    if (url !== avant.url) { effet = `navigation → ${url}`; break; }
    if (contexte.pages().length > avant.pages || cpt.fenetres > 0) { effet = 'nouvel onglet'; break; }
    if (cpt.pressePapiers > 0) { effet = 'presse-papiers'; break; }
    if (alerte) { effet = `dialogue natif (${alerte})`; break; }
    if (telechargement) { effet = 'téléchargement'; break; }
    if (cpt.mutations > 0) { effet = 'DOM modifié'; break; }
  }
  page.off('dialog', surDialogue);
  page.off('download', surTelechargement);
  if (effet && effet.startsWith('DOM modifié')) {
    // Préciser l'effet : modale, menu, toast…
    await page.waitForTimeout(250);
    const apres = await etatOuvert(page).catch(() => avant.etat);
    if (apres.dialogues > avant.etat.dialogues) effet = 'modale/menu ouvert';
    else if (apres.toasts.length > avant.etat.toasts.length) effet = `toast : ${apres.toasts[apres.toasts.length - 1].slice(0, 80)}`;
  }
  // Fermer les onglets ouverts
  for (const p of contexte.pages()) if (p !== page) await p.close().catch(() => {});
  if (!effet) return { resultat: 'mort' };
  return { resultat: 'ok', effet };
};

/** Rejoue les étapes d'un parcours ; renvoie l'index de la première étape introuvable (ou -1). */
const rejouer = async (page, etapes) => {
  for (let i = 0; i < etapes.length; i++) {
    const etape = etapes[i];
    const poignee = await page.evaluateHandle((et) => {
      const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      if (typeof et === 'string') {
        return [...document.querySelectorAll('button, [role="button"]')].find((b) => visible(b) && !b.disabled && norm(b.innerText) === et) || null;
      }
      return [...document.querySelectorAll('[class*="cursor-pointer"], button, [role="button"]')].find((el) => visible(el) && norm(el.innerText).includes(et.contient)) || null;
    }, etape);
    const el = poignee.asElement();
    if (!el) return i;
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await el.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
  return -1;
};

/** Échap, puis attend la fin de l'animation de fermeture (Radix retire ensuite aria-hidden). */
const fermer = async (page) => {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForFunction(() => !document.querySelector('[role="menu"], [role="listbox"], [role="dialog"][data-state="open"], [data-radix-popper-content-wrapper]') && !document.querySelector('nav[aria-hidden="true"]'), null, { timeout: 1500 }).catch(() => {});
  await page.waitForTimeout(120);
};

/** Referme ce qui a pu s'ouvrir ; recharge si l'état de la page a changé. */
const retablir = async (page, urlPage, listeInitiale, etatInitial = { dialogues: 0 }, preparer = null) => {
  const recharger = async () => {
    // Laisser aboutir ce que le clic a lancé (requêtes, spinner de téléchargement…) :
    // recharger trop tôt produirait un « Failed to fetch » artificiel dans la console.
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    await page.waitForFunction((n) => document.querySelectorAll('.animate-spin').length <= n, etatInitial.spinners ?? 0, { timeout: 8000 }).catch(() => {});
    await page.goto(BASE + urlPage, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
    await attendreCalme(page);
    if (preparer) await preparer(page);
  };
  if (cheminCourant(page) !== urlPage) { await recharger(); return true; }
  await fermer(page);
  const etat = await etatOuvert(page).catch(() => ({ dialogues: 0 }));
  const liste = await listerControles(page).catch(() => []);
  const cles = new Set(liste.map((c) => `${c.type}|${c.nom}|${c.idx}`));
  const toutPresent = listeInitiale.every((c) => cles.has(`${c.type}|${c.nom}|${c.idx}`));
  if (etat.dialogues > etatInitial.dialogues || !toutPresent) {
    debug(`rechargement : ${etat.dialogues > etatInitial.dialogues ? 'surcouche ouverte' : 'contrôle initial disparu'}`);
    await recharger();
    return true;
  }
  return false;
};

/** Teste les entrées d'un menu déroulant (thème, langue, compte…). */
const testerMenu = async (page, contexte, declencheur, urlPage, listeInitiale, journal, etatInitial, preparer = null) => {
  const SEL_MENU = '[role="menu"], [role="listbox"]';
  const ouvrirMenu = async () => {
    await fermer(page);
    const poignee = await trouverControle(page, declencheur);
    const el = poignee.asElement();
    if (!el) return false;
    await el.click({ timeout: 4000 }).catch(() => {});
    return page.locator(SEL_MENU).first().waitFor({ state: 'attached', timeout: 2000 }).then(() => true).catch(() => false);
  };
  const stockageInitial = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])))).catch(() => null);
  const restaurerStockage = () => page.evaluate((json) => { if (!json) return; const o = JSON.parse(json); for (const k of Object.keys(localStorage)) if (!(k in o)) localStorage.removeItem(k); for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); }, stockageInitial).catch(() => {});
  if (!(await ouvrirMenu())) { debug(`menu ${declencheur.nom} : impossible à rouvrir`); return; }
  await page.waitForTimeout(200);
  const entrees = await page.evaluate(() =>
    [...document.querySelectorAll('[role="menu"] [role="menuitem"], [role="listbox"] [role="option"]')]
      .filter((e) => !e.matches('[aria-disabled="true"], [data-disabled]'))
      .map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean));
  debug(`menu ${declencheur.nom} : ${entrees.length} entrée(s) — ${entrees.join(' / ')}`);
  await fermer(page);
  for (const entree of [...new Set(entrees)]) {
    if (NE_PAS_CLIQUER.test(entree)) { journal.ignores.push(`${declencheur.nom} › ${entree}`); continue; }
    if (!(await ouvrirMenu())) { journal.morts.push({ nom: `${declencheur.nom} › ${entree}`, type: 'menuitem', motif: 'menu impossible à rouvrir' }); break; }
    await page.waitForTimeout(150);
    const poigneeItem = await page.evaluateHandle((texte) => [...document.querySelectorAll('[role="menuitem"], [role="option"]')].find((e) => (e.innerText || '').replace(/\s+/g, ' ').trim() === texte) || null, entree);
    const item = poigneeItem.asElement();
    if (!item) { journal.morts.push({ nom: `${declencheur.nom} › ${entree}`, type: 'menuitem', motif: 'entrée introuvable une fois le menu rouvert' }); continue; }
    await page.evaluate(() => { window.__zbm.mutations = 0; window.__zbm.fenetres = 0; window.__zbm.pressePapiers = 0; window.__zbm.cible = null; });
    const avantUrl = cheminCourant(page);
    const avantTheme = await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.lang + '|' + (localStorage.getItem('med-mng-ui-theme') || '') + '|' + (localStorage.getItem('preferred-language') || localStorage.getItem('language') || ''));
    const avantTexte = await texteVisible(page);
    await item.click({ timeout: 4000 }).catch(() => {});
    let effet = null;
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(100);
      const url = cheminCourant(page);
      if (url !== avantUrl) { effet = `navigation → ${url}`; break; }
      const cpt = await page.evaluate(() => window.__zbm).catch(() => null);
      if (!cpt) { effet = 'navigation'; break; }
      const theme = await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.lang + '|' + (localStorage.getItem('med-mng-ui-theme') || '') + '|' + (localStorage.getItem('preferred-language') || localStorage.getItem('language') || '')).catch(() => avantTheme);
      if (theme !== avantTheme) { effet = 'thème/langue changé'; break; }
      if (cpt.fenetres > 0 || contexte.pages().length > 1) { effet = 'nouvel onglet'; break; }
      if (cpt.pressePapiers > 0) { effet = 'presse-papiers'; break; }
    }
    if (!effet) {
      await fermer(page);
      const apresTexte = await texteVisible(page);
      const etat = await etatOuvert(page).catch(() => ({ dialogues: 0, toasts: [] }));
      if (etat.dialogues > etatInitial.dialogues) effet = 'modale ouverte';
      else if (etat.toasts.length) effet = `toast : ${etat.toasts[etat.toasts.length - 1].slice(0, 80)}`;
      else if (apresTexte !== avantTexte) effet = 'contenu modifié';
    }
    journal.testes++;
    debug(`${declencheur.nom} › ${entree} → ${effet || 'mort'}`);
    if (!effet) journal.morts.push({ nom: `${declencheur.nom} › ${entree}`, type: 'menuitem', motif: 'aucun effet observable' });
    else journal.effets.push(`${declencheur.nom} › ${entree} → ${effet}`);
    for (const p of contexte.pages()) if (p !== page) await p.close().catch(() => {});
    // Une préférence (langue, thème) a pu être enregistrée : on la remet comme avant.
    const stockage = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])))).catch(() => null);
    if (stockage !== stockageInitial) { await restaurerStockage(); await page.goto(BASE + urlPage, { waitUntil: 'load', timeout: 30000 }).catch(() => {}); await attendreCalme(page); if (preparer) await preparer(page); }
    else await retablir(page, urlPage, listeInitiale, etatInitial, preparer);
  }
};

/** Formulaires publics : soumission vide puis adresse invalide → un message doit apparaître. */
const testerFormulaires = async (page, urlPage, journal) => {
  const nb = await page.locator('form:visible').count().catch(() => 0);
  for (let i = 0; i < nb; i++) {
    const form = page.locator('form:visible').nth(i);
    const bouton = form.locator('button[type="submit"], input[type="submit"], button:not([type])').first();
    if (!(await bouton.count())) continue;
    const nomBouton = ((await bouton.getAttribute('aria-label')) || (await bouton.innerText().catch(() => '')) || 'submit').replace(/\s+/g, ' ').trim();
    const champs = await form.locator('input:visible, textarea:visible').evaluateAll((els) => els.map((e) => ({ type: e.type, name: e.name || e.id || '', required: e.required, placeholder: e.placeholder })));
    if (!champs.length) continue;
    const scenario = async (etiquette, remplir) => {
      await remplir();
      const texteAvant = await texteVisible(page);
      const urlAvant = cheminCourant(page);
      await page.evaluate(() => { window.__zbm.mutations = 0; window.__zbm.cible = null; });
      const desactive = await bouton.isDisabled().catch(() => false);
      if (desactive) return { etiquette, resultat: 'bouton désactivé tant que le formulaire est incomplet', ok: true };
      await bouton.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1200);
      const invalides = await form.locator(':invalid, [aria-invalid="true"]').count().catch(() => 0);
      const texteApres = await texteVisible(page);
      const urlApres = cheminCourant(page);
      const nouveau = texteApres.split(' ').filter((m) => !texteAvant.includes(m)).join(' ').slice(0, 160);
      const message = /requis|obligatoire|invalide|valide|caract[èe]res|incorrect|erreur|renseign|saisis|doit|veuillez|adresse|e-?mail|mot de passe|identifiants|introuvable/i.test(nouveau);
      const ok = urlApres !== urlAvant || invalides > 0 || message;
      return { etiquette, resultat: urlApres !== urlAvant ? `navigation → ${urlApres}` : invalides > 0 ? `validation native (${invalides} champ(s) invalide(s))` : nouveau ? `message : ${nouveau}` : 'aucun message', ok };
    };
    const vider = async () => { for (const c of champs) if (c.type !== 'checkbox' && c.type !== 'radio' && c.type !== 'submit') await form.locator(`[name="${c.name}"], [id="${c.name}"]`).first().fill('').catch(() => {}); };
    const invalide = async () => {
      await vider();
      for (const c of champs) {
        const loc = form.locator(c.name ? `[name="${c.name}"], [id="${c.name}"]` : `input[type="${c.type}"]`).first();
        if (c.type === 'email' || /mail/i.test(c.name + c.placeholder)) await loc.fill('adresse-invalide').catch(() => {});
        else if (c.type === 'password') await loc.fill('x').catch(() => {});
      }
    };
    const r1 = await scenario('vide', vider);
    const r2 = await scenario('adresse invalide', invalide);
    journal.formulaires.push({ bouton: nomBouton, champs: champs.map((c) => c.name || c.type), scenarios: [r1, r2] });
    if (cheminCourant(page) !== urlPage) { await page.goto(BASE + urlPage, { waitUntil: 'load' }).catch(() => {}); await attendreCalme(page); }
  }
};

// ---- Analyse d'une page --------------------------------------------------------
const analyserPage = async (contexte, page, url, { testerBoutons = true, mobile = false, preparer = null, libelle = null } = {}) => {
  const rapport = { url: libelle || url, mobile, urlFinale: url, statut: null, etat: 'ok', redirection: null, erreursConsole: [], suspects: [], boutons: { testes: 0, morts: [], recouverts: [], ignores: [], effets: [] }, formulaires: [], liens: [], verdict: 'OK' };
  const journalConsole = [];
  const surConsole = (m) => {
    if (m.type() !== 'error') return;
    const loc = m.location()?.url || '';
    const texte = m.text();
    // « Failed to load resource » : l'URL n'est pas dans le texte, elle est dans location().
    if (/Failed to load resource/i.test(texte) && IGNORER_RESEAU.some((regle) => regle.motif.test(loc) && (!regle.statuts || regle.statuts.some((st) => texte.includes(`status of ${st}`))))) return;
    journalConsole.push(loc && /Failed to load resource/i.test(texte) ? `${texte} — ${loc.slice(0, 120)}` : texte);
  };
  const surErreur = (e) => journalConsole.push(`Exception : ${e.message}`);
  const surReponse = (r) => {
    const s = r.status();
    if (s < 400) return;
    const req = r.request();
    if (IGNORER_RESEAU.some((regle) => (!regle.statuts || regle.statuts.includes(s)) && (!regle.methodes || regle.methodes.includes(req.method())) && regle.motif.test(r.url()))) return;
    journalConsole.push(`HTTP ${s} ${req.method()} ${r.url().slice(0, 140)}`);
  };
  page.on('console', surConsole); page.on('pageerror', surErreur); page.on('response', surReponse);
  try {
    const reponse = await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 }).catch((e) => { rapport.etat = `échec de chargement : ${String(e.message).split('\n')[0]}`; return null; });
    rapport.statut = reponse ? reponse.status() : null;
    await attendreCalme(page);
    if (preparer) {
      const echec = await preparer(page);
      if (typeof echec === 'number' && echec >= 0) rapport.etat = `parcours interrompu à l'étape ${echec + 1}`;
      await page.waitForTimeout(300);
    }
    rapport.urlFinale = cheminCourant(page);
    if (rapport.urlFinale !== url) rapport.redirection = rapport.urlFinale;
    const texte = await texteVisible(page);
    const titre = await page.title();
    if (/Page introuvable/.test(texte) && /404/.test(texte)) rapport.etat = '404';
    else if (/Une erreur est survenue|Oups|Something went wrong/i.test(texte) && /Réessayer|Recharger|Retour à l'accueil/i.test(texte)) rapport.etat = 'écran d\'erreur';
    else if (/Accès Refusé/i.test(texte)) rapport.etat = 'accès refusé';
    else if (rapport.redirection && rapport.redirection.startsWith(ROUTES.medMngLogin)) rapport.etat = 'protégée → connexion';
    if (rapport.statut && rapport.statut >= 400) rapport.etat = `HTTP ${rapport.statut}`;

    // Textes : anglais, suspects, tutoiement (sur le texte visible + le titre)
    const corpus = `${titre} ${texte}`;
    const extrait = (regex, src) => { const m = regex.exec(src); if (!m) return null; const i = m.index; return src.slice(Math.max(0, i - 40), i + 60).trim(); };
    for (const t of TEXTES_SUSPECTS) { const e = extrait(t.regex, corpus); if (e) { rapport.suspects.push({ type: t.nom, extrait: e, grave: t.grave }); ajouterSuspect(t.nom, e, url); } }
    // Anglais : ≥ 2 marqueurs anglais distincts dans une fenêtre de 8 mots, ou expression anglaise reconnue.
    const mots = corpus.split(/\s+/);
    const deja = new Set();
    for (let i = 0; i < mots.length; i++) {
      const fenetre = mots.slice(i, i + 8);
      const marqueurs = new Set(fenetre.map((m) => m.replace(/[^\p{L}'’-]/gu, '').toLowerCase()).filter((m) => ANGLAIS.test(m)));
      if (marqueurs.size >= 2) {
        const e = fenetre.join(' ').slice(0, 100);
        if (!deja.has(e)) { deja.add(e); rapport.suspects.push({ type: 'anglais', extrait: e, grave: true }); ajouterSuspect('anglais', e, url); }
        i += 7;
      }
    }
    for (const m of corpus.matchAll(new RegExp(EXPRESSIONS_ANGLAISES.source, 'gi'))) {
      const e = corpus.slice(Math.max(0, m.index - 30), m.index + 50).trim();
      if (!deja.has(e)) { deja.add(e); rapport.suspects.push({ type: 'anglais', extrait: e, grave: true }); ajouterSuspect('anglais', e, url); }
    }
    const phrases = corpus.split(/(?<=[.!?…:])\s+|\s[•·|]\s/);
    for (const ph of phrases) {
      if (detecterTutoiement(ph)) {
        const e = ph.trim().slice(0, 110);
        rapport.suspects.push({ type: 'tutoiement', extrait: e, grave: true }); ajouterSuspect('tutoiement', e, url);
      }
    }

    // Liens internes/externes de la page
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), texte: (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60) })));
    for (const { href, texte: t } of hrefs) {
      if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) continue;
      const n = normaliser(href, BASE + url);
      if (!n) continue;
      if (n.externe) { if (!liensExternes.has(n.externe)) liensExternes.set(n.externe, new Set()); liensExternes.get(n.externe).add(url); continue; }
      rapport.liens.push(n.interne);
      const chemin = n.interne.split('?')[0];
      if (!routeExiste(chemin)) { liensCasses.push({ depuis: url, vers: n.interne, texte: t, motif: 'aucune route déclarée' }); }
    }

    // Boutons
    const dejaAnalysee = rapport.redirection && pages.some((p) => p.urlFinale === rapport.urlFinale && p.boutons.testes > 0 && p.mobile === mobile);
    if (testerBoutons && rapport.etat !== '404' && !dejaAnalysee && !rapport.etat.startsWith('échec') && !rapport.etat.startsWith('parcours')) {
      const urlPage = rapport.urlFinale;
      const liste = await listerControles(page);
      const etatInitial = await etatOuvert(page);
      const parLibelle = new Map();
      for (const ctrl of liste) {
        const etiquette = `${ctrl.nom}${ctrl.idx ? ` (#${ctrl.idx + 1})` : ''} [${ctrl.type}]`;
        const libelle = `${ctrl.type}|${ctrl.nom.replace(/\d+/g, '#')}`;
        parLibelle.set(libelle, (parLibelle.get(libelle) || 0) + 1);
        if (parLibelle.get(libelle) > MAX_PAR_LIBELLE) { rapport.boutons.ignores.push(`${etiquette} : libellé répétitif déjà testé`); continue; }
        if (ctrl.desactive) { rapport.boutons.ignores.push(`${etiquette} : désactivé`); continue; }
        if (ctrl.dejaActif) { rapport.boutons.ignores.push(`${etiquette} : déjà actif (onglet, étape ou option courante)`); continue; }
        if (ctrl.dansFormulaire) continue; // testé avec les formulaires
        if (ctrl.global) { const cle = `${ctrl.type}|${ctrl.nom}|${mobile ? 'm' : 'd'}`; if (globauxTestes.has(cle)) { rapport.boutons.ignores.push(`${etiquette} : contrôle global déjà testé`); continue; } globauxTestes.add(cle); }
        if (NE_PAS_CLIQUER.test(ctrl.nom) || NE_PAS_CLIQUER_EXACT.test(ctrl.nom)) { rapport.boutons.ignores.push(`${etiquette} : action sensible, non cliquée`); continue; }
        if (ctrl.haspopup === 'menu' || ctrl.haspopup === 'listbox' || ctrl.haspopup === 'true') {
          const r = await cliquer(page, contexte, ctrl, urlPage);
          rapport.boutons.testes++;
          debug(`${etiquette} → ${r.resultat} ${r.effet || r.detail || ''}`);
          if (r.resultat === 'ok') {
            rapport.boutons.effets.push(`${etiquette} → ${r.effet}`);
            await testerMenu(page, contexte, ctrl, urlPage, liste, rapport.boutons, etatInitial, preparer);
          } else if (r.resultat === 'recouvert') rapport.boutons.recouverts.push({ nom: etiquette, par: r.detail });
          else if (r.resultat === 'mort') rapport.boutons.morts.push({ nom: etiquette, type: ctrl.type, motif: 'aucun effet observable' });
          else if (r.resultat === 'erreur-clic') rapport.boutons.morts.push({ nom: etiquette, type: ctrl.type, motif: r.detail });
          await retablir(page, urlPage, liste, etatInitial, preparer);
          continue;
        }
        let r = await cliquer(page, contexte, ctrl, urlPage);
        if (r.resultat === 'introuvable') {
          // La page a peut-être changé d'état : on recharge et on réessaie une fois.
          await page.goto(BASE + urlPage, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
          await attendreCalme(page);
          if (preparer) await preparer(page);
          r = await cliquer(page, contexte, ctrl, urlPage);
          if (r.resultat === 'introuvable') { rapport.boutons.ignores.push(`${etiquette} : plus visible après rechargement`); continue; }
        }
        rapport.boutons.testes++;
        debug(`${etiquette} → ${r.resultat} ${r.effet || r.detail || ''}`);
        if (r.resultat === 'ok') rapport.boutons.effets.push(`${etiquette} → ${r.effet}`);
        else if (r.resultat === 'recouvert') rapport.boutons.recouverts.push({ nom: etiquette, par: r.detail });
        else if (r.resultat === 'mort') rapport.boutons.morts.push({ nom: etiquette, type: ctrl.type, motif: 'aucun effet observable' });
        else rapport.boutons.morts.push({ nom: etiquette, type: ctrl.type, motif: r.detail });
        await retablir(page, urlPage, liste, etatInitial, preparer);
      }
      if (!preparer) await testerFormulaires(page, urlPage, rapport);
    }
  } finally {
    page.off('console', surConsole); page.off('pageerror', surErreur); page.off('response', surReponse);
  }
  rapport.erreursConsole = [...new Set(journalConsole.filter((m) => !IGNORER_CONSOLE.some((r) => r.test(m))))];
  for (const m of rapport.erreursConsole) erreursConsole.push({ page: url, message: m.slice(0, 220) });
  for (const b of rapport.boutons.morts) boutonsMorts.push({ page: rapport.urlFinale, mobile, ...b });
  for (const b of rapport.boutons.recouverts) boutonsMorts.push({ page: rapport.urlFinale, mobile, nom: b.nom, type: 'recouvert', motif: `recouvert par ${b.par}` });
  const formulairesKo = rapport.formulaires.filter((f) => f.scenarios.some((s) => !s.ok));
  rapport.verdict = (rapport.etat === '404' || rapport.etat.startsWith('écran') || rapport.etat.startsWith('HTTP') || rapport.etat.startsWith('échec')
    || rapport.erreursConsole.length || rapport.boutons.morts.length || rapport.boutons.recouverts.length || formulairesKo.length
    || rapport.suspects.some((s) => s.grave)) ? 'KO' : 'OK';
  pages.push(rapport);
  const resume = [rapport.etat !== 'ok' ? rapport.etat : '', rapport.redirection ? `→ ${rapport.redirection}` : '', rapport.erreursConsole.length ? `${rapport.erreursConsole.length} err. console` : '', rapport.boutons.testes ? `${rapport.boutons.testes} boutons, ${rapport.boutons.morts.length + rapport.boutons.recouverts.length} morts` : '', rapport.suspects.filter((x) => x.grave).length ? `${rapport.suspects.filter((x) => x.grave).length} texte(s) suspect(s)` : ''].filter(Boolean).join(' · ');
  process.stdout.write(`${rapport.verdict}  ${mobile ? '[mobile] ' : ''}${rapport.url}${resume ? ` — ${resume}` : ''}\n`);
  return rapport;
};

// ---- Parcours ----------------------------------------------------------------
const contexte = await creerContexte(false);
await preparerContexte(contexte);
const page = await contexte.newPage();
page.setDefaultTimeout(15000);

const graines = ['/', ...SITEMAP, ...routesConnues.flatMap(expanser)].map((u) => u.replace(/\/+$/, '') || '/');
const file = [...new Set(SEULEMENT ? SEULEMENT.split(',') : graines)];
const vus = new Set(file);
const parMotif = new Map();
const compter = (chemin) => { const m = motifDe(chemin.split('?')[0]); parMotif.set(m, (parMotif.get(m) || 0) + 1); return parMotif.get(m); };
for (const u of file) compter(u);

try {
  // Le bandeau cookies (sans consentement enregistré) est testé une fois, à part.
  if (!SEULEMENT || option('--bandeau')) {
    const ctxCookies = await creerContexte(false);
    await preparerContexte(ctxCookies, { consentement: false });
    const p = await ctxCookies.newPage();
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await attendreCalme(p);
    const journal = { testes: 0, morts: [], effets: [], ignores: [], formulaires: [] };
    const nomsBandeau = () => p.evaluate(() => {
      const bandeau = [...document.querySelectorAll('div.fixed')].find((d) => /cookies/i.test(d.innerText || ''));
      if (!bandeau) return [];
      return [...bandeau.querySelectorAll('button')].map((b) => {
        const svg = b.querySelector('svg');
        const icone = svg ? [...svg.classList].find((c) => c.startsWith('lucide-')) : null;
        return (b.getAttribute('aria-label') || (b.innerText || '').trim() || (icone ? `icône ${icone.replace('lucide-', '')}` : '')).trim();
      }).filter(Boolean);
    });
    const boutons = await nomsBandeau();
    if (!boutons.length) journal.morts.push({ nom: 'bandeau cookies', type: 'bandeau', motif: 'bandeau absent sans consentement enregistré' });
    for (const nom of [...new Set(boutons)]) {
      await p.evaluate(() => { try { localStorage.removeItem('medmng_cookie_consent'); } catch {} });
      await p.reload({ waitUntil: 'load' }); await attendreCalme(p);
      // Même règle de nommage que nomsBandeau (aria-label, texte ou icône).
      const poigneeB = await p.evaluateHandle((n) => {
        const bandeau = [...document.querySelectorAll('div.fixed')].find((d) => /cookies/i.test(d.innerText || ''));
        if (!bandeau) return null;
        return [...bandeau.querySelectorAll('button')].find((b) => {
          const svg = b.querySelector('svg');
          const icone = svg ? [...svg.classList].find((c) => c.startsWith('lucide-')) : null;
          return (b.getAttribute('aria-label') || (b.innerText || '').trim() || (icone ? `icône ${icone.replace('lucide-', '')}` : '')).trim() === n;
        }) || null;
      }, nom);
      const b = poigneeB.asElement();
      if (!b) { journal.morts.push({ nom, type: 'button', motif: 'introuvable après rechargement' }); continue; }
      await p.evaluate(() => { window.__zbm.mutations = 0; window.__zbm.cible = null; });
      await b.click({ timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(500);
      const cpt = await p.evaluate(() => window.__zbm.mutations);
      journal.testes++;
      if (cpt > 0) journal.effets.push(`${nom} → DOM modifié`); else journal.morts.push({ nom, type: 'button', motif: 'aucun effet observable' });
      // Sous-boutons de la fenêtre « Personnaliser »
      if (/personnaliser|paramétrer|paramètres|gérer|settings/i.test(nom)) {
        const sous = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"] button')].map((b) => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean));
        for (const s of [...new Set(sous)]) {
          const sb = p.locator('[role="dialog"] button', { hasText: s }).first();
          if (!(await sb.count())) continue;
          await p.evaluate(() => { window.__zbm.mutations = 0; });
          await sb.click({ timeout: 4000 }).catch(() => {});
          await p.waitForTimeout(400);
          const c2 = await p.evaluate(() => window.__zbm.mutations);
          journal.testes++;
          if (c2 > 0) journal.effets.push(`${nom} › ${s} → DOM modifié`); else journal.morts.push({ nom: `${nom} › ${s}`, type: 'button', motif: 'aucun effet observable' });
          if (!(await p.locator('[role="dialog"]').count())) break;
        }
      }
    }
    pages.push({ url: '/ (bandeau cookies)', urlFinale: '/', statut: 200, etat: 'ok', redirection: null, erreursConsole: [], suspects: [], boutons: { testes: journal.testes, morts: journal.morts, recouverts: [], ignores: [], effets: journal.effets }, formulaires: [], liens: [], verdict: journal.morts.length ? 'KO' : 'OK', mobile: false });
    for (const b of journal.morts) boutonsMorts.push({ page: '/ (bandeau cookies)', mobile: false, ...b });
    process.stdout.write(`${journal.morts.length ? 'KO' : 'OK'}  / (bandeau cookies) — ${journal.testes} boutons, ${journal.morts.length} morts\n`);
    await ctxCookies.close();
  }

  while (file.length && pages.length < MAX_PAGES) {
    const url = file.shift();
    const rapport = await analyserPage(contexte, page, url, { testerBoutons: !SANS_BOUTONS });
    const etapes = SANS_BOUTONS ? null : PARCOURS[url.split('?')[0]];
    if (etapes && rapport.etat === 'ok') {
      for (let k = 1; k <= etapes.length; k++) {
        const preparer = (p) => rejouer(p, etapes.slice(0, k));
        const nomEtape = typeof etapes[k - 1] === 'string' ? etapes[k - 1] : etapes[k - 1].contient;
        await analyserPage(contexte, page, url, { preparer, libelle: `${url} › ${k}. ${nomEtape}` });
      }
    }
    for (const lien of SEULEMENT ? [] : rapport.liens) {
      const chemin = lien.split('?')[0];
      if (vus.has(lien) || vus.has(chemin)) continue;
      if (!routeExiste(chemin)) continue; // déjà signalé comme lien cassé
      const motif = motifDe(chemin);
      const nb = parMotif.get(motif) || 0;
      if (motif !== chemin && nb >= MAX_PAR_MOTIF) continue;
      vus.add(lien); compter(lien); file.push(lien);
    }
  }

  // Recherche globale (Ctrl+K) : un vrai résultat doit apparaître pour « 247 ».
  if (!SEULEMENT) {
    await page.goto(BASE + '/', { waitUntil: 'load' }); await attendreCalme(page);
    const rech = { url: '/ (recherche globale)', urlFinale: '/', statut: 200, etat: 'ok', redirection: null, erreursConsole: [], suspects: [], boutons: { testes: 1, morts: [], recouverts: [], ignores: [], effets: [] }, formulaires: [], liens: [], verdict: 'OK', mobile: false };
    await page.locator('button', { hasText: /Rechercher/ }).first().click({ timeout: 4000 }).catch(() => {});
    const champ = page.locator('[role="dialog"] input').first();
    if (await champ.count()) {
      await champ.fill('247');
      const resultat = page.locator('[role="dialog"]').getByText(/IC-247/).first();
      const ok = await resultat.waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
      if (ok) {
        await resultat.click();
        await page.waitForTimeout(800);
        const cible = cheminCourant(page);
        if (/\/edn-complete\/ic-247/i.test(cible)) rech.boutons.effets.push(`Rechercher › « 247 » → ${cible}`);
        else rech.boutons.morts.push({ nom: 'Rechercher › résultat IC-247', type: 'search', motif: `navigation inattendue : ${cible}` });
      } else rech.boutons.morts.push({ nom: 'Rechercher › « 247 »', type: 'search', motif: 'aucun résultat IC-247 affiché' });
      // Le raccourci G+H tapé dans le champ de recherche ne doit PAS quitter la page.
      await page.goto(BASE + '/faq', { waitUntil: 'load' }); await attendreCalme(page);
      await page.locator('button', { hasText: /Rechercher/ }).first().click({ timeout: 4000 }).catch(() => {});
      const champ2 = page.locator('[role="dialog"] input').first();
      if (await champ2.count()) {
        await champ2.pressSequentially('gh', { delay: 80 });
        await page.waitForTimeout(600);
        if (cheminCourant(page) !== '/faq') rech.boutons.morts.push({ nom: 'Rechercher › saisie « gh »', type: 'search', motif: `la saisie déclenche le raccourci clavier G+H (page quittée vers ${cheminCourant(page)})` });
        else rech.boutons.effets.push('Rechercher › saisie « gh » reste dans le champ');
      }
    } else rech.boutons.morts.push({ nom: 'Rechercher', type: 'search', motif: 'la boîte de recherche ne s\'ouvre pas' });
    rech.verdict = rech.boutons.morts.length ? 'KO' : 'OK';
    for (const b of rech.boutons.morts) boutonsMorts.push({ page: rech.url, mobile: false, ...b });
    pages.push(rech);
    process.stdout.write(`${rech.verdict}  / (recherche globale)${rech.boutons.morts.length ? ' — ' + rech.boutons.morts.map((b) => b.motif).join(' ; ') : ''}\n`);
  }

  // Passe mobile (menu hamburger, CTA collant…) sur les pages publiques atteintes.
  if (TESTER_MOBILE) {
    const ctxMobile = await creerContexte(true);
    await preparerContexte(ctxMobile);
    const pm = await ctxMobile.newPage();
    pm.setDefaultTimeout(15000);
    // Par défaut, les MAX_PAGES_MOBILE premières pages publiques (menu hamburger, CTA collant…).
    const maxMobile = parseInt(process.env.MAX_PAGES_MOBILE || '12', 10);
    const publiques = pages.filter((p) => !p.mobile && p.etat === 'ok' && !p.url.includes('(') && !p.url.includes(' › ')).map((p) => p.url).slice(0, maxMobile);
    for (const u of publiques) await analyserPage(ctxMobile, pm, u, { mobile: true });
    await ctxMobile.close();
  }

  // Liens externes (optionnel) : une réponse < 400 est attendue.
  if (TESTER_EXTERNES) {
    for (const [lien, depuis] of liensExternes) {
      try {
        const r = await fetch(lien, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 (verif-zero-bouton-mort)' } });
        if (r.status >= 400) liensCasses.push({ depuis: [...depuis].join(', '), vers: lien, texte: '', motif: `HTTP ${r.status}` });
      } catch (e) { liensCasses.push({ depuis: [...depuis].join(', '), vers: lien, texte: '', motif: `injoignable (${String(e.message).slice(0, 60)})` }); }
    }
  }
} finally {
  await navigateur.close();
}

// ---- Boutons réservés aux comptes connectés (lecture de code) ----------------
// Liste, à partir des routes protégées, ce que le visiteur n'a pas pu tester.
const blocProtege = lire('src/App.tsx');
for (const m of blocProtege.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\} element=\{<(ProtectedRoute|AdminRoute)>/g)) {
  if (ROUTES[m[1]]) aTesterConnecte.push({ route: ROUTES[m[1]], garde: m[2] === 'AdminRoute' ? 'administrateur' : 'compte connecté' });
}

// ---- Rapport -----------------------------------------------------------------
const pagesKo = pages.filter((p) => p.verdict === 'KO');
const n404 = pages.filter((p) => p.etat === '404').length;
console.log('\n' + '='.repeat(100));
console.log(`PAGES : ${pages.length} analysées · ${pagesKo.length} KO · ${n404} en 404 · ${boutonsMorts.length} bouton(s) mort(s)/recouvert(s) · ${erreursConsole.length} erreur(s) console · ${liensCasses.length} lien(s) cassé(s)`);
console.log('='.repeat(100));
console.log('Verdict  Page                                                    État                     Boutons   Console  Suspects');
for (const p of pages) {
  const etat = [p.etat, p.redirection ? `→ ${p.redirection}` : ''].filter(Boolean).join(' ').slice(0, 24);
  console.log(`${p.verdict.padEnd(8)} ${(p.mobile ? '[m] ' : '') + p.url.slice(0, 54).padEnd(56)}${etat.padEnd(25)}${`${p.boutons.testes}/${p.boutons.morts.length + p.boutons.recouverts.length}`.padEnd(10)}${String(p.erreursConsole.length).padEnd(9)}${p.suspects.filter((x) => x.grave).length}`);
}
if (boutonsMorts.length) {
  console.log('\n--- BOUTONS MORTS / RECOUVERTS ---');
  for (const b of boutonsMorts) console.log(`  ${b.mobile ? '[mobile] ' : ''}${b.page}  ·  ${b.nom}  —  ${b.motif}`);
}
if (erreursConsole.length) {
  console.log('\n--- ERREURS CONSOLE / RÉSEAU ---');
  for (const e of erreursConsole) console.log(`  ${e.page}  ·  ${e.message}`);
}
if (liensCasses.length) {
  console.log('\n--- LIENS CASSÉS ---');
  for (const l of liensCasses) console.log(`  ${l.depuis}  →  ${l.vers}  (« ${l.texte} ») — ${l.motif}`);
}
if (textesSuspects.size) {
  console.log('\n--- TEXTES SUSPECTS (dédoublonnés) ---');
  for (const t of [...textesSuspects.values()].sort((a, b) => a.type.localeCompare(b.type))) console.log(`  [${t.type}] « ${t.extrait} » — ${t.pages.size} page(s) : ${[...t.pages].slice(0, 3).join(', ')}${t.pages.size > 3 ? '…' : ''}`);
}
const formulaires = pages.flatMap((p) => p.formulaires.map((f) => ({ page: p.urlFinale, ...f })));
if (formulaires.length) {
  console.log('\n--- FORMULAIRES PUBLICS ---');
  for (const f of formulaires) console.log(`  ${f.page}  ·  « ${f.bouton} » (${f.champs.join(', ')}) : ${f.scenarios.map((s) => `${s.ok ? 'OK' : 'KO'} ${s.etiquette} → ${s.resultat}`).join(' ; ')}`);
}
if (aTesterConnecte.length) {
  console.log('\n--- À TESTER AVEC UN COMPTE CONNECTÉ (routes protégées, non atteignables en visiteur) ---');
  for (const r of aTesterConnecte) console.log(`  ${r.route}  (${r.garde})`);
}
if (SORTIE_JSON) {
  writeFileSync(SORTIE_JSON, JSON.stringify({ base: BASE, date: new Date().toISOString(), pages, boutonsMorts, erreursConsole, liensCasses, textesSuspects: [...textesSuspects.values()].map((t) => ({ ...t, pages: [...t.pages] })), liensExternes: [...liensExternes.entries()].map(([l, d]) => ({ lien: l, depuis: [...d] })), aTesterConnecte }, null, 2));
  console.log(`\nRapport JSON : ${SORTIE_JSON}`);
}
process.exit(pagesKo.length ? 1 : 0);
