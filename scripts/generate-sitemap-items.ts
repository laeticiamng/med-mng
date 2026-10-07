/**
 * Génère public/sitemap-items.xml : une URL par fiche item EDN publique.
 * Source : edn_items_complete.slug, lu avec la clé publiable (rôle anon, celle
 * du client web : src/integrations/supabase/client.ts). Aucun secret requis.
 *
 *   npx tsx scripts/generate-sitemap-items.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { construireSitemapItems, trierSlugsItems } from '../src/lib/sitemapItems';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = fs.readFileSync(path.join(racine, 'src/integrations/supabase/client.ts'), 'utf-8');
const url = process.env.VITE_SUPABASE_URL ?? client.match(/SUPABASE_URL = "([^"]+)"/)?.[1];
const cle = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? client.match(/SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/)?.[1];
if (!url || !cle) throw new Error('URL Supabase ou clé publiable introuvable');

const reponse = await fetch(`${url}/rest/v1/edn_items_complete?select=slug&order=slug`, {
  headers: { apikey: cle, Authorization: `Bearer ${cle}` },
});
if (!reponse.ok) throw new Error(`Lecture de edn_items_complete impossible : ${reponse.status}`);
const lignes = (await reponse.json()) as Array<{ slug: string | null }>;
const slugs = trierSlugsItems(lignes.map((l) => l.slug).filter((s): s is string => Boolean(s)));
if (slugs.length !== lignes.length) throw new Error('Item sans slug : sitemap non écrit');

const sortie = path.join(racine, 'public/sitemap-items.xml');
fs.writeFileSync(sortie, construireSitemapItems(slugs, new Date().toISOString().slice(0, 10)), 'utf-8');
console.log(`${sortie} : ${slugs.length} fiches`);
