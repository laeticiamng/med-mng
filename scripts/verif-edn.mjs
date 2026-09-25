#!/usr/bin/env node
/**
 * Vérification de bout en bout de /edn-complete et de l'en-tête global (visiteur déconnecté).
 *
 * Usage :
 *   npx vite build && setsid npx vite preview --port 4198 --host 127.0.0.1 &
 *   node scripts/verif-edn.mjs            # BASE_URL=http://127.0.0.1:4198 par défaut
 *
 * Variables : BASE_URL, CHROMIUM_PATH (défaut /opt/pw-browsers/chromium s'il existe).
 *
 * Les valeurs attendues ne sont pas recopiées de l'interface : elles sont
 * recalculées à partir de la base (lecture publique d'edn_items_complete), puis
 * comparées à ce que la page affiche. Sortie : un tableau OK/KO, code de sortie
 * 1 si au moins une vérification échoue.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');
const CHROMIUM = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const lire = (p) => readFileSync(resolve(RACINE, p), 'utf8');

// ---- Résultats --------------------------------------------------------------
const resultats = [];
const verifier = (groupe, test, ok, detail = '') => {
  resultats.push({ groupe, test, ok: Boolean(ok), detail: String(detail) });
  process.stdout.write(`${ok ? 'OK' : 'KO'}  ${groupe} · ${test}${detail ? ` — ${detail}` : ''}\n`);
};

// ---- Données de référence (base) --------------------------------------------
const constantes = lire('src/lib/supabaseConstants.ts');
const SUPABASE_URL = /SUPABASE_URL\s*=\s*"([^"]+)"/.exec(constantes)[1];
const SUPABASE_KEY = /SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/.exec(constantes)[1];

const normaliser = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const numero = (code) => parseInt(/(\d+)/.exec(code)?.[1] ?? '0', 10);
const total = (i) => (i.competences_count_rang_a || 0) + (i.competences_count_rang_b || 0);
// Même règle que src/components/edn/music/utils/parolesFormatter.ts
const parolesRedigees = (p) => {
  if (!Array.isArray(p) || p.length === 0) return false;
  const lignes = p.filter((l) => l && l.trim());
  if (lignes.length === 0) return false;
  const structure = lignes.some((l) => /\[(couplet|refrain|pont|intro|outro|bridge|verse|chorus)/i.test(l));
  const ponctuees = lignes.filter((l) => /[.,;:!?…—]/.test(l)).length / lignes.length > 0.5;
  const residus = p.some((l) => /\bnbsp\b|&[a-z]+;|&#\d+|<\s*\/?\s*(br|p|div|span|li|ul|td|tr)\b/i.test(l || ''));
  return (structure || ponctuees) && !residus;
};
const PREDICATS_CONTENU = {
  'Avec paroles de chanson': (i) => parolesRedigees(i.paroles_musicales),
  'Sans paroles rédigées': (i) => !parolesRedigees(i.paroles_musicales),
  '10 compétences ou plus': (i) => total(i) >= 10,
  'Moins de 5 compétences': (i) => total(i) < 5,
};
const COMPARATEURS_TRI = {
  "Numéro d'item": (a, b) => numero(a.item_code) - numero(b.item_code),
  'Titre (A → Z)': (a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }) || numero(a.item_code) - numero(b.item_code),
  'Nombre de compétences': (a, b) => total(b) - total(a) || numero(a.item_code) - numero(b.item_code),
  'Compétences de rang A': (a, b) => (b.competences_count_rang_a || 0) - (a.competences_count_rang_a || 0) || numero(a.item_code) - numero(b.item_code),
};

async function chargerItems() {
  const url = `${SUPABASE_URL}/rest/v1/edn_items_complete?select=item_code,title,specialite,paroles_musicales,competences_count_rang_a,competences_count_rang_b&status=eq.active&limit=1000`;
  const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!r.ok) throw new Error(`Lecture de la base impossible (${r.status})`);
  return r.json();
}

// ---- Routes déclarées dans le code (pour rester à jour sans recopie) ---------
const ROUTES = Object.fromEntries([...lire('src/config/routes.ts').matchAll(/^\s*(\w+):\s*'([^']+)'/gm)].map((m) => [m[1], m[2]]));
const routesDe = (texte) => [...new Set([...texte.matchAll(/ROUTE_PATHS\.(\w+)/g)].map((m) => ROUTES[m[1]]).filter(Boolean))];
const navigation = lire('src/config/navigation.ts');
const blocPlus = navigation.slice(navigation.indexOf('SECONDARY_NAV_GROUPS'), navigation.indexOf('SECONDARY_NAV_ITEMS'));
const mainNav = lire('src/components/layout/MainNavigation.tsx');
const blocMenuUtilisateur = mainNav.slice(mainNav.indexOf('Mon compte'), mainNav.indexOf('Déconnexion'));
const modes = lire('src/components/edn/tableau-de-bord/NavigationModes.tsx');
const ROUTES_PLUS = routesDe(blocPlus);
const ROUTES_MENU_UTILISATEUR = routesDe(blocMenuUtilisateur);
const ROUTES_MODES_EDN = routesDe(modes.slice(modes.indexOf('const GROUPES'), modes.indexOf('interface NavigationModesProps'))).concat(routesDe(modes.slice(modes.indexOf('Planning IA') - 400, modes.indexOf('Planning IA'))));

// ---- Navigateur ------------------------------------------------------------
const navigateur = await chromium.launch({ executablePath: CHROMIUM, headless: true });
const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
await contexte.addInitScript(() => {
  try {
    localStorage.setItem('medmng_cookie_consent', 'true');
    localStorage.setItem('medmng_cookie_preferences', JSON.stringify({ necessary: true, analytics: false, marketing: false }));
  } catch { /* stockage indisponible */ }
});
const page = await contexte.newPage();
page.setDefaultTimeout(20000);

const BIBLIO = 'section[aria-labelledby="titre-bibliotheque"]';
const compteur = page.locator(`${BIBLIO} [aria-live="polite"] > span`).first();
const cartes = page.locator(`${BIBLIO} [data-item-code]`);

const lireCompteur = async () => parseInt((await compteur.textContent()) || '', 10);
const attendreStable = async () => {
  let precedent = -1;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const n = await lireCompteur();
    if (n === precedent) return n;
    precedent = n;
  }
  return precedent;
};
const ouvrirListe = async (id) => {
  await page.locator(`#${id}`).click();
  await page.getByRole('listbox').waitFor();
};
const lireOptions = async (id) => {
  await ouvrirListe(id);
  const textes = await page.getByRole('option').allTextContents();
  await page.keyboard.press('Escape');
  await page.getByRole('listbox').waitFor({ state: 'detached' });
  return textes.map((t) => t.trim());
};
const choisir = async (id, texte) => {
  await ouvrirListe(id);
  await page.getByRole('option', { name: texte, exact: true }).click();
  await page.getByRole('listbox').waitFor({ state: 'detached' });
  return attendreStable();
};
/** Fait défiler jusqu'à afficher toutes les cartes (chargement progressif par 30). */
const codesAffiches = async (max = Infinity) => {
  const attendu = Math.min(await lireCompteur(), max);
  for (let i = 0; i < 30 && (await cartes.count()) < attendu; i++) {
    await page.locator(`${BIBLIO} [data-item-code]`).last().scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(250);
  }
  const codes = await cartes.evaluateAll((els) => els.map((e) => e.getAttribute('data-item-code')));
  return codes.slice(0, max === Infinity ? codes.length : max);
};
const pageEnErreur = async () => {
  const texte = (await page.locator('body').innerText()).slice(0, 5000);
  if (/Page introuvable/.test(texte) && /404/.test(texte)) return '404';
  if (/Une erreur est survenue/.test(texte)) return 'erreur';
  return null;
};
const avecEtiquette = (texte) => /^(.*) \((\d+)\)$/.exec(texte);

try {
  const items = await chargerItems();
  const parCode = new Map(items.map((i) => [i.item_code, i]));

  await page.goto(`${BASE}/edn-complete`, { waitUntil: 'domcontentloaded' });
  await compteur.waitFor();
  await page.waitForFunction(
    (sel) => /^\d+ items?$/.test(document.querySelector(sel)?.textContent?.trim() || ''),
    `${BIBLIO} [aria-live="polite"] > span`
  );
  const initial = await attendreStable();
  verifier('Compteur', 'Total sans filtre = items actifs en base', initial === items.length && initial === 367, `${initial} affichés / ${items.length} en base`);

  // ---- Discipline ----------------------------------------------------------
  const optionsDiscipline = (await lireOptions('filtre-discipline')).filter((t) => !t.startsWith('Toutes'));
  const disciplinesBase = new Map();
  for (const i of items) {
    if (!i.specialite?.trim()) continue;
    const cle = normaliser(i.specialite);
    disciplinesBase.set(cle, (disciplinesBase.get(cle) || 0) + 1);
  }
  verifier('Discipline', 'Liste = disciplines présentes en base', optionsDiscipline.length === disciplinesBase.size,
    `${optionsDiscipline.length} options, ${disciplinesBase.size} valeurs distinctes en base`);
  verifier('Discipline', 'Plus d’entrée codée en dur (Gastro-entérologie…)', !optionsDiscipline.some((t) => /Gastro/i.test(t)) || disciplinesBase.has('gastro-enterologie'),
    optionsDiscipline.map((t) => t.replace(/ \(\d+\)$/, '')).join(', '));

  for (const option of optionsDiscipline) {
    const m = avecEtiquette(option);
    const libelle = m ? m[1] : option;
    const annonce = m ? parseInt(m[2], 10) : NaN;
    const attendus = new Set(items.filter((i) => i.specialite && normaliser(i.specialite) === normaliser(libelle)).map((i) => i.item_code));
    const n = await choisir('filtre-discipline', option);
    const codes = await codesAffiches();
    const intrus = codes.filter((c) => !attendus.has(c));
    verifier('Discipline', libelle,
      n > 0 && n === annonce && n === attendus.size && codes.length === n && intrus.length === 0,
      `compteur ${n}, annoncé ${annonce}, base ${attendus.size}, cartes ${codes.length}, hors discipline ${intrus.length}`);
  }
  await choisir('filtre-discipline', `Toutes (${items.length})`);

  // ---- Rang (retiré) -------------------------------------------------------
  verifier('Rang', 'Filtre retiré (365/367/365 items : ne discriminait rien)', (await page.locator('#filtre-rang').count()) === 0);

  // ---- Contenu -------------------------------------------------------------
  const optionsContenu = (await lireOptions('filtre-contenu')).filter((t) => t !== 'Tout');
  for (const option of optionsContenu) {
    const m = avecEtiquette(option);
    const libelle = m ? m[1] : option;
    const predicat = PREDICATS_CONTENU[libelle];
    if (!predicat) { verifier('Contenu', libelle, false, 'option inconnue du script'); continue; }
    const attendus = new Set(items.filter(predicat).map((i) => i.item_code));
    const n = await choisir('filtre-contenu', option);
    const codes = await codesAffiches();
    const intrus = codes.filter((c) => !attendus.has(c));
    verifier('Contenu', libelle,
      n > 0 && n < items.length && n === attendus.size && Number(m?.[2]) === n && intrus.length === 0,
      `compteur ${n}, base ${attendus.size}, cartes hors critère ${intrus.length}`);
  }
  await choisir('filtre-contenu', 'Tout');

  // ---- Tri -----------------------------------------------------------------
  const optionsTri = await lireOptions('filtre-tri');
  const ordreNumero = [...items].sort(COMPARATEURS_TRI["Numéro d'item"]).slice(0, 30).map((i) => i.item_code);
  for (const option of optionsTri) {
    const comparer = COMPARATEURS_TRI[option];
    if (!comparer) { verifier('Tri', option, false, 'option inconnue du script'); continue; }
    const n = await choisir('filtre-tri', option);
    const codes = await codesAffiches(30);
    const attendu = [...items].sort(comparer).slice(0, 30).map((i) => i.item_code);
    const identique = JSON.stringify(codes) === JSON.stringify(attendu);
    const change = option === "Numéro d'item" || JSON.stringify(codes) !== JSON.stringify(ordreNumero);
    verifier('Tri', option, n === items.length && identique && change,
      `30 premières cartes ${identique ? 'conformes' : 'NON conformes'} (${codes.slice(0, 4).join(', ')}…)`);
  }
  await choisir('filtre-tri', "Numéro d'item");

  // ---- Statut (connecté uniquement) ---------------------------------------
  verifier('Statut', 'Masqué pour un visiteur', (await page.locator('#filtre-statut').count()) === 0);

  // ---- Recherche -----------------------------------------------------------
  const recherche = page.locator('#recherche-item');
  await recherche.fill('230');
  let n = await attendreStable();
  let codes = await codesAffiches();
  verifier('Recherche', '« 230 »', n > 0 && codes[0] === 'IC-230', `${n} résultat(s) : ${codes.slice(0, 5).join(', ')}`);

  await recherche.fill('cardio');
  n = await attendreStable();
  codes = await codesAffiches();
  const cardio = items.filter((i) => normaliser(i.specialite || '') === 'cardiologie').map((i) => i.item_code);
  verifier('Recherche', '« cardio »', n > 0 && cardio.every((c) => codes.includes(c)),
    `${n} résultat(s), dont les ${cardio.length} items de cardiologie`);

  // ---- Réinitialiser ------------------------------------------------------
  const premiereDiscipline = optionsDiscipline[0];
  if (premiereDiscipline) await choisir('filtre-discipline', premiereDiscipline);
  if (optionsContenu[0]) await choisir('filtre-contenu', optionsContenu[0]);
  const avant = await lireCompteur();
  await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click();
  n = await attendreStable();
  verifier('Réinitialiser', 'Remet tous les items', n === 367 && (await recherche.inputValue()) === '',
    `${avant} → ${n}, recherche « ${await recherche.inputValue()} »`);

  // ---- Barre des modes (visiteur) -----------------------------------------
  const modesTexte = await page.locator('nav[aria-label="Modes de révision"]').innerText();
  verifier('Modes EDN', 'Plus de solde « crédits IA » ni d’entrée ECOS', !/crédits IA/i.test(await page.locator('body').innerText()) && !/ECOS/.test(modesTexte));

  // ---- En-tête global -----------------------------------------------------
  const entete = page.locator('nav').first();
  const texteEntete = await entete.innerText();
  verifier('En-tête', 'Aucune entrée ECOS', !/\bECOS\b/.test(texteEntete) && (await entete.locator('a[href="/ecos"]').count()) === 0);
  verifier('Pied de page', 'Aucun lien vers /ecos', (await page.locator('footer a[href="/ecos"]').count()) === 0);
  const liensEntete = await entete.locator('a[href^="/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')))]);
  verifier('En-tête', 'Visiteur : pas de cloche ni de pastilles de progression',
    (await entete.getByRole('button', { name: 'Notifications' }).count()) === 0);

  // Recherche ⌘K / Ctrl+K
  await page.keyboard.press('Control+k');
  const dialogue = page.getByRole('dialog');
  await dialogue.waitFor();
  const champ = dialogue.getByRole('textbox');
  await champ.fill('230');
  await dialogue.getByText(/^IC-230 - /).waitFor({ timeout: 15000 }).catch(() => {});
  const res230 = await dialogue.getByText(/^IC-\d+ - /).allTextContents();
  verifier('Recherche ⌘K', '« 230 »', res230.some((t) => t.startsWith('IC-230 - ')), res230.slice(0, 3).join(' | '));
  await champ.fill('cardio');
  await page.waitForTimeout(400);
  await dialogue.getByText(/^IC-\d+ - /).first().waitFor({ timeout: 15000 }).catch(() => {});
  const resCardio = await dialogue.getByText(/^IC-\d+ - /).allTextContents();
  verifier('Recherche ⌘K', '« cardio »', resCardio.length > 0, `${resCardio.length} résultat(s) : ${resCardio.slice(0, 2).join(' | ')}`);
  if (resCardio.length > 0) {
    await dialogue.getByText(/^IC-\d+ - /).first().click();
    await page.waitForURL(/\/edn-complete\/[^/]+/);
    await page.waitForLoadState('networkidle').catch(() => {});
    const erreur = await pageEnErreur();
    verifier('Recherche ⌘K', 'Le résultat ouvre la fiche de l’item', !erreur, page.url().replace(BASE, ''));
  }

  // Liens de l'en-tête, puis entrées « Plus », menu utilisateur et modes EDN
  // (écrans réservés aux comptes : un visiteur doit être redirigé vers la connexion, pas tomber sur une 404).
  const aVisiter = [
    ...liensEntete.map((p) => ['En-tête', p]),
    ...ROUTES_PLUS.map((p) => ['Menu « Plus »', p]),
    ...ROUTES_MENU_UTILISATEUR.map((p) => ['Menu utilisateur', p]),
    ...ROUTES_MODES_EDN.map((p) => ['Modes EDN', p]),
    ['Route conservée', ROUTES.ecosIndex],
  ];
  for (const [groupe, chemin] of aVisiter) {
    const reponse = await page.goto(`${BASE}${chemin}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(300);
    const erreur = await pageEnErreur();
    const arrivee = new URL(page.url()).pathname;
    verifier(groupe, chemin, reponse && reponse.status() < 400 && !erreur,
      erreur ? `page ${erreur}` : arrivee === chemin ? 'page affichée' : `redirigé vers ${arrivee}`);
  }
} catch (e) {
  verifier('Script', 'Exécution', false, e?.message || e);
} finally {
  await navigateur.close();
}

// ---- Tableau final ----------------------------------------------------------
const l1 = Math.max(...resultats.map((r) => r.groupe.length), 6);
const l2 = Math.min(Math.max(...resultats.map((r) => r.test.length), 5), 60);
const ligne = `+${'-'.repeat(l1 + 2)}+${'-'.repeat(l2 + 2)}+------+`;
console.log(`\n${ligne}\n| ${'Groupe'.padEnd(l1)} | ${'Test'.padEnd(l2)} | Etat |\n${ligne}`);
for (const r of resultats) {
  console.log(`| ${r.groupe.padEnd(l1)} | ${r.test.slice(0, l2).padEnd(l2)} | ${r.ok ? ' OK ' : ' KO '} |`);
}
console.log(ligne);
const ko = resultats.filter((r) => !r.ok).length;
console.log(`${resultats.length - ko} OK, ${ko} KO`);
process.exit(ko ? 1 : 0);
