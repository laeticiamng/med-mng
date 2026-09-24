// @ts-nocheck
/**
 * illustrer-case — dessine l'image d'une case de BD d'après sa description.
 *
 * Avant : 10 photos Unsplash tournaient sur les 2848 cases, sans rapport avec
 * leur contenu. Ici, chaque case est dessinée une fois (OpenAI gpt-image-1,
 * qualité « low ») dans un style BD homogène, puis conservée dans le stockage
 * public « bd-illustrations » ; l'adresse dépend du texte de la description.
 *
 * Entrée : { itemCode, illustration }  →  { url }
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const BUCKET = 'bd-illustrations'
const STYLE =
  "Case de bande dessinée franco-belge, ligne claire, couleurs douces et lumineuses, contexte médical réaliste et respectueux. " +
  "Aucun texte, aucune lettre, aucune bulle, aucun logo, aucun visage de personne réelle. Pas de sang ni de scène choquante."

async function empreinte(texte: string) {
  const h = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(texte))
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

serve(async (req) => {
  const cors = getCorsHeaders(req)
  const repondre = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const { itemCode, illustration } = await req.json().catch(() => ({}))
    const texte = String(illustration ?? '').trim()
    if (!/^IC-\d{1,3}$/.test(String(itemCode ?? '')) || texte.length < 10 || texte.length > 1200) {
      return repondre({ error: 'requete_invalide' }, 400)
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // Seules les descriptions réellement présentes dans une BD de l'item peuvent être dessinées :
    // la fonction ne sert pas à produire des images arbitraires.
    const { data: ligne } = await admin.from('edn_items_immersive').select('bd_panels').eq('item_code', itemCode).maybeSingle()
    const cases: any[] = Array.isArray(ligne?.bd_panels) ? ligne.bd_panels : []
    if (!cases.some((c) => String(c?.illustration ?? '').trim() === texte)) {
      return repondre({ error: 'case_inconnue' }, 404)
    }

    const chemin = `${itemCode}/${await empreinte(texte)}.png`
    const publique = admin.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl
    const deja = await fetch(publique, { method: 'HEAD' }).then((r) => r.ok).catch(() => false)
    if (deja) return repondre({ url: publique, cache: true })

    const cle = Deno.env.get('OPENAI_API_KEY')
    if (!cle) return repondre({ error: 'illustration_indisponible' }, 503)

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: `${STYLE}\nScène : ${texte}`, size: '1536x1024', quality: 'low', n: 1 }),
    })
    if (!r.ok) {
      console.error('[illustrer-case]', r.status, (await r.text()).slice(0, 300))
      return repondre({ error: 'illustration_indisponible' }, 503)
    }
    const j = await r.json()
    const b64 = j?.data?.[0]?.b64_json
    if (!b64) return repondre({ error: 'illustration_indisponible' }, 503)
    const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

    await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {})
    const { error: e } = await admin.storage.from(BUCKET).upload(chemin, octets, { contentType: 'image/png', upsert: true })
    if (e) {
      console.error('[illustrer-case] upload', e)
      return repondre({ error: 'enregistrement_impossible' }, 500)
    }
    return repondre({ url: publique, cache: false })
  } catch (e) {
    console.error('[illustrer-case]', e)
    return repondre({ error: 'erreur_interne' }, 500)
  }
})
