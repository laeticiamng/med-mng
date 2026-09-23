// Fonction à usage unique : met le contenu COMPLET des 4872 compétences OIC
// en conformité avec le référentiel officiel LiSA 2026 (UNESS).
//
// Pourquoi : l'ancienne extraction (extract-oic-api-first, 2025) ne gardait
// qu'UNE ligne du contenu de chaque fiche (regex `[^\n|]+`, ou « premier
// paragraphe »). Résultat mesuré le 24/09/2026 : 14 % des compétences
// seulement étaient complètes, 3672 sur 4872 en contenaient moins de 60 %,
// et 246 portaient une phrase de remplissage inventée (« Cette compétence
// nécessite une maîtrise des concepts fondamentaux… »).
//
// Les données (relevées dans LiSA 2026 avec la session de la propriétaire)
// sont embarquées dans donnees.ts : la correction est reproductible sans accès
// à UNESS, et vérifiable ligne par ligne.
//
// Actions (POST JSON { action, depuis?, nombre? }, en-tête x-jeton obligatoire) :
//   verifier    (défaut) n'écrit rien ; mesure l'écart base / référentiel
//   sauvegarder copie l'état actuel des 4872 lignes dans le bucket privé
//               oic-sauvegardes (obligatoire avant appliquer)
//   images      copie les figures LiSA dans le bucket public oic-images
//   appliquer   écrit description, sommaire, contenu_detaille, url_source,
//               hash_content, date_import. Ne supprime aucune ligne ; ne
//               touche ni intitulé, ni rang, ni item parent (déjà conformes).
// Idempotente. À retirer du dépôt quand verifier renvoie conforme: true.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { DONNEES } from './donnees.ts';

const EMPREINTE = '8ecb7f0ec2b9be3c9cc5499f629b3366dd73a858c9343831fbea99751bd77ee0';
const SAUVEGARDE = 'avant-lisa-2026.json';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-jeton',
};

interface Objectif {
  id: string; item: string; rang: string; intitule: string; rubrique: string; ordre: number | null;
  sommaire: string; description: string; html: string; maj_lisa: string; url_source: string; hash: string;
}
interface Referentiel { source: string; releve_le: string; objectifs: Objectif[]; images: { source: string; cible: string }[] }

let cache: Referentiel | null = null;
async function referentiel(): Promise<Referentiel> {
  if (cache) return cache;
  const gz = Uint8Array.from(atob(DONNEES), (c) => c.charCodeAt(0));
  const flux = new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'));
  cache = JSON.parse(await new Response(flux).text());
  return cache!;
}

async function sha(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// deno-lint-ignore no-explicit-any
type Client = any;

async function lireBase(sb: Client, colonnes: string) {
  const lignes: Record<string, unknown>[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await sb.from('oic_competences').select(colonnes).like('objectif_id', 'OIC-%')
      .order('objectif_id').range(de, de + 999);
    if (error) throw new Error(error.message);
    lignes.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return lignes;
}

async function imagesPresentes(sb: Client) {
  const noms = new Set<string>();
  for (let de = 0; ; de += 1000) {
    const { data, error } = await sb.storage.from('oic-images').list('', { limit: 1000, offset: de });
    if (error) return noms;
    (data ?? []).forEach((f: { name: string }) => noms.add(f.name));
    if (!data || data.length < 1000) break;
  }
  return noms;
}

function ligneCible(o: Objectif, releve: string) {
  return {
    objectif_id: o.id,
    intitule: o.intitule,
    item_parent: o.item.padStart(3, '0'),
    rang: o.rang,
    description: o.description,
    sommaire: o.sommaire || null,
    contenu_detaille: { source: 'lisa-2026', html: o.html, maj_lisa: o.maj_lisa, releve_le: releve },
    url_source: o.url_source,
    hash_content: o.hash,
    date_import: releve,
    extraction_status: 'complete',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const rep = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
  if ((await sha(req.headers.get('x-jeton') ?? '')) !== EMPREINTE) return rep({ error: 'interdit' }, 403);
  try {
    const { action = 'verifier', depuis = 0, nombre = 5000 } = await req.json().catch(() => ({}));
    const ref = await referentiel();
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (action === 'verifier') {
      const base = new Map((await lireBase(sb, 'objectif_id,description,sommaire,hash_content,contenu_detaille')).map((l) => [l.objectif_id as string, l]));
      let conformes = 0, absents = 0;
      const ecarts: string[] = [];
      for (const o of ref.objectifs) {
        const l = base.get(o.id) as Record<string, unknown> | undefined;
        if (!l) { absents++; continue; }
        const cd = l.contenu_detaille as { source?: string; html?: string } | null;
        const ok = l.description === o.description && (l.sommaire ?? '') === (o.sommaire || '') && l.hash_content === o.hash
          && cd?.source === 'lisa-2026' && cd?.html === o.html;
        if (ok) conformes++; else if (ecarts.length < 20) ecarts.push(o.id);
      }
      const presentes = await imagesPresentes(sb);
      const imagesManquantes = ref.images.filter((i) => !presentes.has(i.cible)).length;
      const { data: sauv } = await sb.storage.from('oic-sauvegardes').list('', { search: SAUVEGARDE });
      return rep({
        referentiel: ref.objectifs.length, en_base: base.size, absents, conformes,
        a_corriger: ref.objectifs.length - conformes - absents, exemples_ecarts: ecarts,
        images: ref.images.length, images_manquantes: imagesManquantes,
        sauvegarde: (sauv ?? []).some((f: { name: string }) => f.name === SAUVEGARDE),
        conforme: conformes === ref.objectifs.length && imagesManquantes === 0,
      });
    }

    if (action === 'sauvegarder') {
      await sb.storage.createBucket('oic-sauvegardes', { public: false }).catch(() => null);
      const { data: deja } = await sb.storage.from('oic-sauvegardes').list('', { search: SAUVEGARDE });
      if ((deja ?? []).some((f: { name: string }) => f.name === SAUVEGARDE)) return rep({ ok: true, deja: true });
      const lignes = await lireBase(sb, 'objectif_id,description,sommaire,contenu_detaille,url_source,hash_content,date_import,extraction_status');
      const { error } = await sb.storage.from('oic-sauvegardes').upload(SAUVEGARDE,
        new Blob([JSON.stringify({ le: new Date().toISOString(), lignes })], { type: 'application/json' }));
      return error ? rep({ error: error.message }, 500) : rep({ ok: true, lignes: lignes.length });
    }

    if (action === 'images') {
      await sb.storage.createBucket('oic-images', { public: true }).catch(() => null);
      const presentes = await imagesPresentes(sb);
      const lot = ref.images.filter((i) => !presentes.has(i.cible)).slice(0, Math.min(nombre, 40));
      const erreurs: string[] = [];
      let copiees = 0;
      for (let i = 0; i < lot.length; i += 8) {
        await Promise.all(lot.slice(i, i + 8).map(async (img) => {
          try {
            const r = await fetch(img.source);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const type = r.headers.get('content-type') ?? 'image/png';
            const { error } = await sb.storage.from('oic-images').upload(img.cible, await r.arrayBuffer(), { contentType: type, upsert: true, cacheControl: '31536000' });
            if (error) throw new Error(error.message);
            copiees++;
          } catch (e) { erreurs.push(`${img.source}: ${(e as Error).message}`); }
        }));
      }
      return rep({ copiees, erreurs, restantes: ref.images.length - presentes.size - copiees });
    }

    if (action === 'appliquer') {
      const { data: sauv } = await sb.storage.from('oic-sauvegardes').list('', { search: SAUVEGARDE });
      if (!(sauv ?? []).some((f: { name: string }) => f.name === SAUVEGARDE)) return rep({ error: 'sauvegarde absente : lancer « sauvegarder » d\'abord' }, 409);
      const cibles = ref.objectifs.slice(depuis, depuis + nombre).map((o) => ligneCible(o, ref.releve_le));
      let ecrites = 0;
      const erreurs: string[] = [];
      for (let i = 0; i < cibles.length; i += 200) {
        const lot = cibles.slice(i, i + 200);
        const { error } = await sb.from('oic_competences').upsert(lot, { onConflict: 'objectif_id' });
        if (error) erreurs.push(`${lot[0].objectif_id}…: ${error.message}`); else ecrites += lot.length;
      }
      return rep({ ecrites, erreurs, suivant: depuis + cibles.length, total: ref.objectifs.length });
    }

    return rep({ error: 'action inconnue' }, 400);
  } catch (e) {
    return rep({ error: (e as Error).message }, 500);
  }
});
