#!/usr/bin/env node
/**
 * Régénère, pour les 367 items EDN, les paroles (rang A, rang B, A+B) puis,
 * en option, le récit et les planches — en appelant les fonctions serveur
 * qui contrôlent leur propre sortie.
 *
 * Usage :
 *   node regenerer.mjs paroles            # les 3 variantes, 367 items
 *   node regenerer.mjs paroles --items IC-1,IC-3
 *   node regenerer.mjs recits             # roman + bd
 *   node regenerer.mjs paroles --reprise  # saute ce qui est déjà rédigé
 *
 * Il n'invente rien : chaque échec est journalisé tel quel dans rapport.json,
 * avec le motif exact renvoyé par le contrôle qualité.
 */

const SB = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const ANON = process.env.MEDMNG_ANON_KEY;
if (!ANON) { console.error('MEDMNG_ANON_KEY manquante'); process.exit(1); }

const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' };
const args = process.argv.slice(2);
const mode = args[0] || 'paroles';
const reprise = args.includes('--reprise');
const filtreIdx = args.indexOf('--items');
const filtre = filtreIdx >= 0 ? (args[filtreIdx + 1] || '').split(',').filter(Boolean) : null;
const PARALLELE = 4;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function lireItems() {
  const r = await fetch(`${SB}/rest/v1/edn_items_complete?select=item_code,paroles_rang_a,paroles_rang_b,paroles_rang_ab&order=item_code&limit=400`, { headers: H });
  if (!r.ok) throw new Error(`lecture des items : ${r.status} ${await r.text()}`);
  return r.json();
}

const MARQUEURS = /\[(couplet|refrain|pont|intro|outro)/i;
const PONCT = /[.,;:!?…—]/;
function estRedige(p) {
  if (!Array.isArray(p) || p.length === 0) return false;
  const l = p.filter((x) => String(x).trim());
  if (l.some((x) => MARQUEURS.test(x))) return true;
  return l.filter((x) => PONCT.test(x)).length / l.length > 0.5;
}

async function appeler(fonction, corps, essaisReseau = 3) {
  for (let i = 1; i <= essaisReseau; i++) {
    try {
      const r = await fetch(`${SB}/functions/v1/${fonction}`, { method: 'POST', headers: H, body: JSON.stringify(corps) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) return { ok: true, data: j };
      if (r.status === 429 || r.status >= 500) { await pause(2000 * i); continue; }
      return { ok: false, status: r.status, data: j };
    } catch (e) {
      if (i === essaisReseau) return { ok: false, status: 0, data: { error: String(e) } };
      await pause(2000 * i);
    }
  }
  return { ok: false, status: 0, data: { error: 'épuisé' } };
}

async function enFile(taches, largeur, surAvancement) {
  const resultats = [];
  let i = 0;
  const ouvriers = Array.from({ length: largeur }, async () => {
    while (i < taches.length) {
      const k = i++;
      resultats[k] = await taches[k]();
      surAvancement(resultats.filter(Boolean).length, taches.length);
    }
  });
  await Promise.all(ouvriers);
  return resultats;
}

(async () => {
  let items = await lireItems();
  if (filtre) items = items.filter((x) => filtre.includes(x.item_code));
  console.log(`${items.length} items`);

  const travaux = [];
  if (mode === 'paroles') {
    for (const it of items) {
      for (const [rang, col] of [['A', 'paroles_rang_a'], ['B', 'paroles_rang_b'], ['AB', 'paroles_rang_ab']]) {
        if (reprise && estRedige(it[col])) continue;
        travaux.push({ fonction: 'generer-paroles-item', corps: { itemCode: it.item_code, rang }, cle: `${it.item_code}/${rang}` });
      }
    }
  } else if (mode === 'recits') {
    for (const it of items) {
      for (const format of ['roman', 'bd']) {
        travaux.push({ fonction: 'generer-recit-item', corps: { itemCode: it.item_code, format }, cle: `${it.item_code}/${format}` });
      }
    }
  } else {
    console.error(`mode inconnu : ${mode}`); process.exit(1);
  }

  console.log(`${travaux.length} générations à lancer, ${PARALLELE} en parallèle`);
  const debut = Date.now();
  const resultats = await enFile(
    travaux.map((t) => async () => {
      const r = await appeler(t.fonction, t.corps);
      return { ...t, ok: r.ok, status: r.status, erreur: r.ok ? null : (r.data?.error ?? null), motifs: r.data?.motifs ?? null, message: r.data?.message ?? null };
    }),
    PARALLELE,
    (faits, total) => { if (faits % 10 === 0) process.stdout.write(`\r${faits}/${total}`); },
  );
  process.stdout.write('\n');

  const reussis = resultats.filter((r) => r.ok);
  const sansCompetence = resultats.filter((r) => r.erreur === 'aucune_competence');
  const qualite = resultats.filter((r) => r.erreur === 'qualite_insuffisante');
  const autres = resultats.filter((r) => !r.ok && r.erreur !== 'aucune_competence' && r.erreur !== 'qualite_insuffisante');

  const rapport = {
    mode, lances: travaux.length,
    reussis: reussis.length,
    sans_competence: sansCompetence.length,
    refuses_qualite: qualite.length,
    autres_echecs: autres.length,
    duree_minutes: Math.round((Date.now() - debut) / 60000),
    detail_sans_competence: sansCompetence.map((r) => r.cle),
    detail_qualite: qualite.map((r) => ({ cle: r.cle, motifs: r.motifs })),
    detail_autres: autres.map((r) => ({ cle: r.cle, status: r.status, erreur: r.erreur, message: r.message })),
  };
  const fs = await import('node:fs');
  fs.writeFileSync(`rapport-${mode}.json`, JSON.stringify(rapport, null, 2));
  console.log(JSON.stringify({ ...rapport, detail_sans_competence: undefined, detail_qualite: undefined, detail_autres: undefined }, null, 2));
  console.log(`détail complet dans rapport-${mode}.json`);
})();
