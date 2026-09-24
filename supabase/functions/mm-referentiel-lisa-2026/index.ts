// Fonction à usage unique : met le contenu COMPLET des 4872 compétences OIC
// en conformité avec le référentiel officiel LiSA 2026 (UNESS).
//
// Pourquoi : l'ancienne extraction (extract-oic-api-first, 2025) ne gardait
// qu'UNE ligne du contenu de chaque fiche (regex `[^\n|]+`, ou « premier
// paragraphe »). Mesuré le 24/09/2026 : 14 % des compétences seulement étaient
// complètes, 3672 sur 4872 en contenaient moins de 60 %, et 246 portaient une
// phrase de remplissage inventée.
//
// Le contenu (relevé dans LiSA 2026 avec la session de la propriétaire,
// scripts/lisa) est envoyé par lots. La fonction n'écrit QUE du contenu dont
// l'empreinte SHA-256 figure dans manifeste.ts : impossible d'y faire passer
// autre chose que le texte officiel relevé.
//
// Actions (POST JSON, en-tête x-jeton obligatoire) :
//   verifier    (défaut) n'écrit rien ; mesure l'écart base / référentiel
//   sauvegarder copie l'état actuel des 4872 lignes dans le bucket privé
//               oic-sauvegardes (obligatoire avant appliquer)
//   images      copie les figures LiSA (publiques) dans le bucket oic-images
//   appliquer   { lignes: [...] } écrit description, sommaire, contenu_detaille,
//               url_source, hash_content, date_import. Ne supprime aucune ligne,
//               ne touche ni intitulé, ni rang, ni item parent (déjà conformes).
// Idempotente. À retirer du dépôt quand verifier renvoie conforme: true.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { EMPREINTES, IMAGES, RELEVE_LE } from './manifeste.ts';

const JETON = '8ecb7f0ec2b9be3c9cc5499f629b3366dd73a858c9343831fbea99751bd77ee0';
const SAUVEGARDE = 'avant-lisa-2026.json';
const ATTENDUES = new Map(EMPREINTES);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-jeton',
};

interface Ligne {
  id: string; item: string; rang: string; intitule: string;
  description: string; sommaire: string; html: string; url_source: string; maj_lisa: string;
}

async function sha(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const empreinte = (id: string, description: string, sommaire: string, html: string, url: string, maj: string) =>
  sha(JSON.stringify([id, description, sommaire, html, url, maj]));

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

async function sauvegardeFaite(sb: Client) {
  const { data } = await sb.storage.from('oic-sauvegardes').list('', { search: SAUVEGARDE });
  return (data ?? []).some((f: { name: string }) => f.name === SAUVEGARDE);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const rep = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
  if ((await sha(req.headers.get('x-jeton') ?? '')) !== JETON) return rep({ error: 'interdit' }, 403);
  try {
    const corps = await req.json().catch(() => ({}));
    const action = corps.action ?? 'verifier';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (action === 'verifier') {
      const base = await lireBase(sb, 'objectif_id,description,sommaire,url_source,contenu_detaille');
      const vus = new Set<string>();
      let conformes = 0;
      const ecarts: string[] = [];
      for (const l of base) {
        const id = l.objectif_id as string;
        vus.add(id);
        const cd = (l.contenu_detaille ?? {}) as { source?: string; html?: string; maj_lisa?: string };
        const e = cd.source === 'lisa-2026'
          ? await empreinte(id, (l.description as string) ?? '', (l.sommaire as string) ?? '', cd.html ?? '', (l.url_source as string) ?? '', cd.maj_lisa ?? '')
          : '';
        if (ATTENDUES.get(id) === e) conformes++; else if (ecarts.length < 20) ecarts.push(id);
      }
      const absents = [...ATTENDUES.keys()].filter((id) => !vus.has(id));
      const presentes = await imagesPresentes(sb);
      const imagesManquantes = IMAGES.filter((i) => !presentes.has(i.cible)).length;
      return rep({
        referentiel: ATTENDUES.size, en_base: base.length, absents: absents.length, conformes,
        a_corriger: ATTENDUES.size - conformes - absents.length, exemples_ecarts: ecarts,
        images: IMAGES.length, images_manquantes: imagesManquantes, sauvegarde: await sauvegardeFaite(sb),
        conforme: conformes === ATTENDUES.size && imagesManquantes === 0,
      });
    }

    if (action === 'sauvegarder') {
      await sb.storage.createBucket('oic-sauvegardes', { public: false }).catch(() => null);
      if (await sauvegardeFaite(sb)) return rep({ ok: true, deja: true });
      const lignes = await lireBase(sb, 'objectif_id,description,sommaire,contenu_detaille,url_source,hash_content,date_import,extraction_status');
      const { error } = await sb.storage.from('oic-sauvegardes').upload(SAUVEGARDE,
        new Blob([JSON.stringify({ le: new Date().toISOString(), lignes })], { type: 'application/json' }));
      return error ? rep({ error: error.message }, 500) : rep({ ok: true, lignes: lignes.length });
    }

    if (action === 'images') {
      await sb.storage.createBucket('oic-images', { public: true }).catch(() => null);
      const presentes = await imagesPresentes(sb);
      const lot = IMAGES.filter((i) => !presentes.has(i.cible)).slice(0, 40);
      const erreurs: string[] = [];
      let copiees = 0;
      for (let i = 0; i < lot.length; i += 8) {
        await Promise.all(lot.slice(i, i + 8).map(async (img) => {
          try {
            if (!img.source.startsWith('https://livret.uness.fr/lisa/2026/images/')) throw new Error('source refusée');
            const r = await fetch(img.source);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const type = r.headers.get('content-type') ?? 'image/png';
            if (!type.startsWith('image/')) throw new Error(`type ${type}`);
            const { error } = await sb.storage.from('oic-images').upload(img.cible, await r.arrayBuffer(), { contentType: type, upsert: true, cacheControl: '31536000' });
            if (error) throw new Error(error.message);
            copiees++;
          } catch (e) { erreurs.push(`${img.source}: ${(e as Error).message}`); }
        }));
      }
      return rep({ copiees, erreurs, restantes: IMAGES.length - presentes.size - copiees });
    }

    if (action === 'appliquer') {
      if (!(await sauvegardeFaite(sb))) return rep({ error: 'sauvegarde absente : lancer « sauvegarder » d\'abord' }, 409);
      const lignes: Ligne[] = Array.isArray(corps.lignes) ? corps.lignes.slice(0, 300) : [];
      const refusees: string[] = [];
      const cibles = [];
      for (const o of lignes) {
        const e = await empreinte(o.id, o.description, o.sommaire ?? '', o.html, o.url_source, o.maj_lisa);
        if (!o.id || ATTENDUES.get(o.id) !== e) { refusees.push(o.id); continue; }
        cibles.push({
          objectif_id: o.id,
          intitule: o.intitule,
          item_parent: String(o.item).padStart(3, '0'),
          rang: o.rang,
          description: o.description,
          sommaire: o.sommaire || null,
          contenu_detaille: { source: 'lisa-2026', html: o.html, maj_lisa: o.maj_lisa, releve_le: RELEVE_LE },
          url_source: o.url_source,
          hash_content: e,
          date_import: RELEVE_LE,
          extraction_status: 'complete',
        });
      }
      let ecrites = 0;
      const erreurs: string[] = [];
      for (let i = 0; i < cibles.length; i += 150) {
        const lot = cibles.slice(i, i + 150);
        const { error } = await sb.from('oic_competences').upsert(lot, { onConflict: 'objectif_id' });
        if (error) erreurs.push(`${lot[0].objectif_id}…: ${error.message}`); else ecrites += lot.length;
      }
      return rep({ recues: lignes.length, ecrites, refusees, erreurs });
    }

    return rep({ error: 'action inconnue' }, 400);
  } catch (e) {
    return rep({ error: (e as Error).message }, 500);
  }
});
