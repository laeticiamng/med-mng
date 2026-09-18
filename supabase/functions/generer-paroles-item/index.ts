import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { getCorsHeaders } from '../_shared/cors.ts'

/**
 * Génère les paroles d'un item EDN à partir de SES compétences OIC officielles.
 *
 * POURQUOI CETTE FONCTION EXISTE
 * ------------------------------
 * L'ancienne génération (generate-lyrics-from-oic) n'était pas une génération :
 * c'était de la concaténation de gabarits. Elle produisait, pour les 367 items,
 * les mêmes phrases — « Rang A Fondamentaux, expertise qui s'précise »,
 * « Formation complète, ensemble on tremble », « Item 3, on va tout retenir /
 * Ces compétences-là vont nous servir / Du rang A jusqu'au rang B ». Mesuré :
 * 75,9 % des lignes de rang A étaient présentes 367 fois à l'identique. Aucune
 * information médicale n'était transportée : une chanson qui ne fait rien
 * retenir ne sert à rien.
 *
 * Ici, chaque ligne doit porter une connaissance de l'item. Le texte des
 * compétences officielles est fourni au modèle, et la sortie est REFUSÉE si
 * elle retombe dans le remplissage (voir controlerQualite).
 */

const MODELE = 'google/gemini-2.5-flash'
const PASSERELLE = 'https://ai.gateway.lovable.dev/v1/chat/completions'

/** Seules ces lignes sont de vraies compétences (734 lignes IC-<n> sont fausses). */
const EST_COMPETENCE_REELLE = /^OIC-\d{3}-\d{2}-[AB]$/

/**
 * Formules de remplissage bannies. Elles viennent toutes des gabarits de
 * l'ancienne génération, ou sont des phrases creuses qui n'apprennent rien.
 * Si le modèle en produit une, la chanson est refusée et regénérée.
 */
const REMPLISSAGE_INTERDIT: RegExp[] = [
  /on va tout retenir/i,
  /vont nous servir/i,
  /du rang a jusqu'?au rang b/i,
  /notre savoir va progresser/i,
  /expertise qui s'?pr[eé]cise/i,
  /ensemble on tremble/i,
  /formation compl[eè]te/i,
  /mission accomplie/i,
  /c'?est automatique/i,
  /excellence m[eé]dicale/i,
  /dans le game/i,
  /flow (qui reste vital|d[eé]finitif|m[eé]dical)/i,
  /r[eé]sultat (optimal|positif)/i,
  /\bitem\s+\d+\s*,/i,               // « Item 3, ... » : on ne chante pas un numéro
  /pour l'?item\s+\d+/i,
  /\b(rang [ab])\s*,?\s*(valid[eé]|acquis|ma[îi]tris[eé])/i,
  /[eé]coutez bien cette le[çc]on/i,
  /gardez [çc]a en m[eé]moire/i,
  /connaissances essentielles/i,
  /savoir m[eé]dical approfondi/i,
  /comp[eé]tence m[eé]dicale sp[eé]cialis[eé]e/i,
  /&nbsp;|&lt;|&gt;|&amp;|'''/,       // résidus de balisage wiki
  /\bnbsp\b/i,
]

interface Competence {
  objectif_id: string
  rang: string
  intitule: string
  description: string | null
  rubrique: string | null
  ordre: number | null
}

function nettoyer(texte: string | null | undefined): string {
  return String(texte ?? '')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, ' ')
    .replace(/'''/g, '')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/OIC-\d{3}-\d{2}-[AB]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Mots porteurs de sens d'une compétence, pour vérifier qu'ils sont chantés. */
const MOTS_VIDES = new Set(
  ('le la les un une des du de d a à au aux et ou ni mais donc or car que qui quoi dont ou ' +
   'ce cet cette ces son sa ses leur leurs en y il elle ils elles on nous vous se sont est ' +
   'etre être avoir savoir connaitre connaître conna savoir pour par sur sous dans avec sans ' +
   'plus moins tres très chez lors afin ainsi entre vers comme aussi apres après avant ' +
   'principaux principales principal principale differents différents element elements éléments ' +
   'notion notions definition définition connaitre identifier citer decrire décrire').split(/\s+/)
)

function motsCles(texte: string): string[] {
  return nettoyer(texte)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9àâäçéèêëîïôöùûüÿœ' -]/g, ' ')
    .split(/[\s'-]+/)
    .filter((m) => m.length >= 5 && !MOTS_VIDES.has(m))
}

function racine(mot: string): string {
  return mot.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().slice(0, 6)
}

/**
 * Refuse une chanson qui ne transporte pas le contenu.
 * Retourne la liste des motifs de refus (vide = acceptée).
 */
export function controlerQualite(paroles: string, competences: Competence[]): string[] {
  const motifs: string[] = []
  const texte = paroles.toLowerCase()

  for (const interdit of REMPLISSAGE_INTERDIT) {
    const trouve = paroles.match(interdit)
    if (trouve) motifs.push(`formule de remplissage interdite : « ${trouve[0]} »`)
  }

  const lignes = paroles.split('\n').map((l) => l.trim()).filter(Boolean)
  const lignesChantees = lignes.filter((l) => !/^\[.*\]$/.test(l))
  if (lignesChantees.length < 8) motifs.push(`trop court : ${lignesChantees.length} lignes chantées`)

  // Chaque compétence doit laisser une trace : au moins un de ses mots porteurs.
  const racinesChantees = new Set(motsCles(texte).map(racine))
  let couvertes = 0
  const absentes: string[] = []
  for (const c of competences) {
    const mots = motsCles(`${c.intitule} ${c.description ?? ''}`)
    const present = mots.some((m) => racinesChantees.has(racine(m)))
    if (present) couvertes++
    else if (absentes.length < 5) absentes.push(nettoyer(c.intitule).slice(0, 60))
  }
  const taux = competences.length ? couvertes / competences.length : 0
  if (taux < 0.7) {
    motifs.push(
      `seulement ${couvertes}/${competences.length} compétences sont réellement chantées` +
      (absentes.length ? ` (absentes : ${absentes.join(' | ')})` : '')
    )
  }

  // Une même ligne répétée plus de deux fois = refrain, au-delà c'est du remplissage.
  const compte = new Map<string, number>()
  for (const l of lignesChantees) {
    const k = l.toLowerCase().replace(/[^a-z0-9]/g, '')
    compte.set(k, (compte.get(k) ?? 0) + 1)
  }
  for (const [, n] of compte) {
    if (n > 3) { motifs.push('une ligne est répétée plus de trois fois'); break }
  }

  return motifs
}

function invite(titre: string, itemCode: string, rang: 'A' | 'B' | 'AB', competences: Competence[], style: string) {
  const liste = competences
    .map((c, i) => {
      const d = nettoyer(c.description)
      return `${i + 1}. [${c.rang}] ${nettoyer(c.intitule)}${d ? ` — ${d.slice(0, 400)}` : ''}`
    })
    .join('\n')

  const portee =
    rang === 'A' ? 'les connaissances de rang A (socle indispensable)' :
    rang === 'B' ? 'les connaissances de rang B (approfondissement)' :
    'l’item entier, rang A puis rang B'

  const systeme = `Tu écris des chansons qui servent à MÉMORISER un cours de médecine. Ton seul juge est la rétention : après trois écoutes, l'étudiant doit pouvoir restituer le contenu.

Règles absolues :
- Chaque ligne chantée porte une information médicale précise tirée de la liste fournie : un signe, un chiffre, un délai, un critère, une conduite à tenir, une contre-indication. Une ligne qui n'apprend rien est une ligne à supprimer.
- INTERDIT : les phrases de motivation, de méta-commentaire ou de remplissage. Jamais « on va tout retenir », « ces compétences vont nous servir », « du rang A jusqu'au rang B », « formation complète », « excellence médicale », « mission accomplie ». Ne chante jamais le numéro de l'item ni le mot « rang » : ce ne sont pas des connaissances.
- Utilise les termes médicaux exacts. N'invente aucun fait, aucun chiffre, aucune molécule : tout doit venir de la liste. Si une information n'y est pas, elle n'a pas sa place dans la chanson.
- Rimes et rythme réguliers, phrases courtes et chantables. Les rimes servent le rappel : place le mot à retenir en fin de vers.
- Structure avec des balises sur leur propre ligne : [Couplet 1], [Refrain], [Couplet 2], [Pont], [Refrain], [Outro]. Le refrain condense les 3 ou 4 notions les plus importantes et peut revenir deux fois.
- Écris en français. Aucun emoji, aucun commentaire, aucune explication : uniquement les paroles.`

  const utilisateur = `Item ${itemCode} — ${titre}
Portée de la chanson : ${portee}
Style musical demandé : ${style}

Connaissances à faire mémoriser (${competences.length} au total) — chacune doit se retrouver dans les paroles :
${liste}

Écris la chanson.`

  return { systeme, utilisateur }
}

async function appelerModele(systeme: string, utilisateur: string, cle: string, temperature: number) {
  const r = await fetch(PASSERELLE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELE,
      temperature,
      messages: [
        { role: 'system', content: systeme },
        { role: 'user', content: utilisateur },
      ],
    }),
  })
  if (!r.ok) {
    const corps = await r.text()
    throw new Error(`passerelle IA ${r.status} : ${corps.slice(0, 300)}`)
  }
  const j = await r.json()
  const texte = j?.choices?.[0]?.message?.content
  if (!texte || typeof texte !== 'string') throw new Error('réponse du modèle vide')
  return texte.trim()
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const repondre = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const { itemCode, rang = 'A', style = 'pop pédagogique, tempo modéré', enregistrer = true } =
      await req.json().catch(() => ({}))

    if (!itemCode) return repondre({ error: 'itemCode manquant' }, 400)
    if (!['A', 'B', 'AB'].includes(rang)) return repondre({ error: 'rang doit valoir A, B ou AB' }, 400)

    const cle = Deno.env.get('LOVABLE_API_KEY')
    if (!cle) return repondre({ error: 'LOVABLE_API_KEY non configurée' }, 500)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: item, error: eItem } = await supabase
      .from('edn_items_complete')
      .select('id, item_code, title')
      .eq('item_code', itemCode)
      .maybeSingle()
    if (eItem) return repondre({ error: `lecture de l'item : ${eItem.message}` }, 500)
    if (!item) return repondre({ error: `item ${itemCode} introuvable` }, 404)

    const numero = String(itemCode).replace(/^IC-/, '').padStart(3, '0')
    const { data: brutes, error: eComp } = await supabase
      .from('oic_competences')
      .select('objectif_id, rang, intitule, description, rubrique, ordre')
      .eq('item_parent', numero)
      .order('objectif_id')
    if (eComp) return repondre({ error: `lecture des compétences : ${eComp.message}` }, 500)

    const competences = (brutes ?? [])
      .filter((c: Competence) => EST_COMPETENCE_REELLE.test(c.objectif_id))
      .filter((c: Competence) => nettoyer(c.intitule).length >= 3)
      .filter((c: Competence) => (rang === 'AB' ? true : c.rang === rang))

    if (competences.length === 0) {
      // On ne fabrique rien : sans contenu officiel, il n'y a pas de chanson.
      return repondre(
        {
          error: 'aucune_competence',
          message: `Le référentiel UNESS ne contient aucune compétence de rang ${rang} pour l'item ${itemCode}. Aucune chanson n'est générée : il n'y a rien à mémoriser.`,
          itemCode, rang,
        },
        422,
      )
    }

    const { systeme, utilisateur } = invite(item.title, itemCode, rang as 'A' | 'B' | 'AB', competences, style)

    let paroles = ''
    let motifs: string[] = []
    const essais: { essai: number; motifs: string[] }[] = []

    for (let essai = 1; essai <= 3; essai++) {
      const rappel = essai === 1 ? '' :
        `\n\nLa version précédente a été refusée pour : ${motifs.join(' ; ')}. Reprends en corrigeant précisément ces points.`
      paroles = await appelerModele(systeme, utilisateur + rappel, cle, essai === 1 ? 0.7 : 0.5)
      motifs = controlerQualite(paroles, competences)
      essais.push({ essai, motifs })
      if (motifs.length === 0) break
    }

    if (motifs.length > 0) {
      // Mieux vaut pas de chanson qu'une chanson creuse.
      return repondre(
        { error: 'qualite_insuffisante', message: 'Les paroles produites ne transportent pas le contenu de l’item.', motifs, essais, itemCode, rang },
        422,
      )
    }

    const lignes = paroles.split('\n').map((l) => l.trimEnd())

    if (enregistrer) {
      const colonne = rang === 'A' ? 'paroles_rang_a' : rang === 'B' ? 'paroles_rang_b' : 'paroles_rang_ab'
      const maj: Record<string, unknown> = { [colonne]: lignes, updated_at: new Date().toISOString() }
      if (rang === 'A') maj.paroles_musicales = lignes
      const { error: eMaj } = await supabase.from('edn_items_complete').update(maj).eq('id', item.id)
      if (eMaj) return repondre({ error: `enregistrement : ${eMaj.message}`, paroles: lignes }, 500)
    }

    return repondre({
      itemCode, rang,
      titre: item.title,
      competences_utilisees: competences.length,
      lignes: lignes.length,
      essais: essais.length,
      paroles: lignes,
      enregistre: enregistrer,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('generer-paroles-item :', message)
    return repondre({ error: message }, 500)
  }
})
