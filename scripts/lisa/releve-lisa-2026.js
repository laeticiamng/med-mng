/*
 * Relevé du référentiel OIC dans LiSA 2026 (UNESS).
 *
 * À exécuter dans la console d'un onglet livret.uness.fr/lisa/2026/…, APRÈS
 * s'être connecté soi-même à son compte UNESS (le script n'utilise aucun
 * identifiant : il lit avec la session du navigateur).
 *
 * Produit lisa-oic-2026.json : pour chaque objectif, les champs du modèle
 * {{Objectif de connaissance}} (identifiant, rang, intitulé, descriptif
 * officiel, rubrique, ordre), le wikitexte COMPLET de la fiche, son rendu HTML
 * et la date de dernière modification.
 *
 * Ce que l'ancienne extraction (extract-oic-api-first, 2025) faisait de travers :
 *  - elle ne gardait que la PREMIÈRE ligne du contenu (regex `[^\n|]+`, ou
 *    « premier paragraphe »), d'où des compétences amputées de 40 à 100 % ;
 *  - un « | » dans le texte coupait la ligne ;
 *  - quand rien n'était trouvé, un texte de remplissage était inventé.
 * Ici on prend tout le corps de la fiche, sans rien couper ni inventer.
 *
 * Suite : scripts/lisa/preparer.py lisa-oic-2026.json oic-2026.json, puis
 * embarquer le résultat dans la fonction mm-referentiel-lisa-2026.
 */
(async () => {
  const API = '/lisa/2026/api.php';
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const titres = [];
  let suite = {};
  do {
    const p = new URLSearchParams({ action: 'query', list: 'categorymembers', cmtitle: 'Catégorie:Objectif_de_connaissance', cmlimit: '500', format: 'json', ...suite });
    const j = await fetch(`${API}?${p}`).then((r) => r.json());
    if (j.error) throw new Error(`API LiSA : ${j.error.code} (êtes-vous connecté ?)`);
    titres.push(...j.query.categorymembers.map((m) => m.title));
    suite = j.continue || null;
  } while (suite);

  const pages = {};
  for (let i = 0; i < titres.length; i += 50) {
    const p = new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'content|timestamp', rvslots: 'main', titles: titres.slice(i, i + 50).join('|'), format: 'json', formatversion: '2' });
    const j = await fetch(API, { method: 'POST', body: p }).then((r) => r.json());
    for (const pg of j.query.pages) pages[pg.title] = { ts: pg.revisions?.[0]?.timestamp, txt: pg.revisions?.[0]?.slots?.main?.content ?? '' };
    console.log(`contenu ${Math.min(i + 50, titres.length)}/${titres.length}`);
    await attendre(300);
  }

  const objectifs = [];
  for (const [titre, p] of Object.entries(pages)) {
    const m = p.txt.match(/\{\{Objectif de connaissance([\s\S]*?)\n\}\}/);
    if (!m) continue; // pages « Fiche LiSA » : pas des objectifs
    const champs = {};
    for (const l of m[1].split('\n|')) { const k = l.indexOf('='); if (k > 0) champs[l.slice(0, k).replace(/^\|/, '').trim()] = l.slice(k + 1).trim(); }
    const corps = p.txt.slice(p.txt.indexOf(m[0]) + m[0].length).trim();
    objectifs.push({ id: champs.Identifiant, item: champs.Parent_id, rang: champs.Rang, intitule: champs.Intitule, description_officielle: champs.Description || '', rubrique: champs.Rubrique || '', ordre: champs.Ordre ? parseInt(champs.Ordre, 10) : null, contributeurs: champs.Contributeurs || '', page: titre, maj: p.ts, wikitext: corps, html: '' });
  }

  // Rendu HTML fiche par fiche (un rendu groupé mélangerait les sommaires).
  for (let i = 0; i < objectifs.length; i++) {
    const o = objectifs[i];
    if (o.wikitext) {
      const p = new URLSearchParams({ action: 'parse', format: 'json', formatversion: '2', contentmodel: 'wikitext', title: o.page, text: o.wikitext, prop: 'text', disablelimitreport: '1', disableeditsection: '1' });
      for (let essai = 0; essai < 3; essai++) {
        try { o.html = (await fetch(API, { method: 'POST', body: p }).then((r) => r.json())).parse.text.trim(); break; } catch { await attendre(1500); }
      }
    }
    if (i % 200 === 0) console.log(`rendu ${i}/${objectifs.length}`);
  }

  objectifs.sort((a, b) => a.id.localeCompare(b.id));
  const json = JSON.stringify({ source: 'https://livret.uness.fr/lisa/2026', releve_le: new Date().toISOString(), n: objectifs.length, objectifs });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: 'lisa-oic-2026.json' });
  document.body.appendChild(a); a.click();
  console.log(`${objectifs.length} objectifs relevés`);
})();
