import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { getCorsHeaders } from '../_shared/cors.ts'
import { completionIA } from '../_shared/ia-resiliente.ts'

/**
 * Récit et planches d'un item EDN, écrits à partir de SES compétences OIC.
 *
 * POURQUOI
 * --------
 * Ce qui existait n'était ni un roman ni une bande dessinée :
 *   roman_story : 3719 chapitres pour les 367 items, dont 3352 (90,1 %)
 *     commencent par l'une de NEUF phrases fixes — « Ce matin-là, aux
 *     urgences, un patient arrive en détresse. » revenait 544 fois, « Au bloc
 *     opératoire, l'expertise est mise à l'épreuve. » 477 fois. Les titres de
 *     chapitre étaient identiques partout (« Chapitre 1 : Les Fondements »
 *     ×353).
 *   bd_panels : 2848 panneaux pour DIX photos Unsplash distinctes, l'une
 *     réutilisée 429 fois, et pour tout texte la liste brute des intitulés.
 *
 * Les deux formats couvrent l'item ENTIER : rang A puis rang B, comme demandé.
 * Chaque paragraphe, chaque case doit porter une connaissance précise ; la
 * sortie est refusée sinon (voir controlerQualite).
 */

// Modèle plus puissant : la version rapide rendait des récits trop courts (193 refus sur 734).
const MODELE = 'google/gemini-2.5-pro'
const EST_COMPETENCE_REELLE = /^OIC-\d{3}-\d{2}-[AB]$/

/** Formules bannies : celles des anciens gabarits, et le remplissage creux. */
const REMPLISSAGE_INTERDIT: RegExp[] = [
  /ce matin-là,? aux urgences/i,
  /au bloc opératoire,? l'expertise/i,
  /dans l'univers complexe de la médecine moderne/i,
  /chapitre \d+\s*:\s*les fondements/i,
  /prologue\s*:\s*l'art médical/i,
  /l'expertise est mise à l'épreuve/i,
  /compétence médicale spécialisée/i,
  /excellence médicale/i,
  /formation complète/i,
  /mission accomplie/i,
  /&nbsp;|&lt;|&gt;|'''/,
  /\bnbsp\b/i,
]

interface Competence {
  objectif_id: string
  rang: string
  intitule: string
  description: string | null
  rubrique: string | null
}

function nettoyer(t: string | null | undefined): string {
  return String(t ?? '')
    .replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, ' ').replace(/'''/g, '')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/OIC-\d{3}-\d{2}-[AB]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

const MOTS_VIDES = new Set(
  ('le la les un une des du de d a à au aux et ou ni mais donc or car que qui quoi dont ' +
   'ce cet cette ces son sa ses leur leurs en y il elle ils elles on nous vous se sont est ' +
   'etre être avoir savoir connaitre connaître pour par sur sous dans avec sans plus moins ' +
   'tres très chez lors afin ainsi entre vers comme aussi apres après avant principaux ' +
   'principales principal principale differents différents element elements éléments notion ' +
   'notions definition définition identifier citer decrire décrire').split(/\s+/)
)

function motsCles(texte: string): string[] {
  return nettoyer(texte).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9àâäçéèêëîïôöùûüÿœ' -]/g, ' ')
    .split(/[\s'-]+/)
    .filter((m) => m.length >= 5 && !MOTS_VIDES.has(m))
}

const racine = (m: string) =>
  m.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().slice(0, 6)

/** Refuse un texte qui ne transporte pas le contenu de l'item. */
export function controlerQualite(texte: string, competences: Competence[], minMots: number): string[] {
  const motifs: string[] = []

  for (const interdit of REMPLISSAGE_INTERDIT) {
    const t = texte.match(interdit)
    if (t) motifs.push(`formule interdite : « ${t[0]} »`)
  }

  const mots = texte.split(/\s+/).filter(Boolean).length
  if (mots < minMots) motifs.push(`trop court : ${mots} mots (minimum ${minMots})`)

  const racines = new Set(motsCles(texte).map(racine))
  let couvertes = 0
  const absentes: string[] = []
  for (const c of competences) {
    const m = motsCles(`${c.intitule} ${c.description ?? ''}`)
    if (m.some((x) => racines.has(racine(x)))) couvertes++
    else if (absentes.length < 5) absentes.push(nettoyer(c.intitule).slice(0, 60))
  }
  const taux = competences.length ? couvertes / competences.length : 0
  if (taux < 0.7) {
    motifs.push(
      `seulement ${couvertes}/${competences.length} compétences sont réellement traitées` +
      (absentes.length ? ` (absentes : ${absentes.join(' | ')})` : '')
    )
  }

  // Une phrase d'ouverture ne doit pas revenir de chapitre en chapitre.
  const ouvertures = texte.split('\n').map((l) => l.trim()).filter((l) => l.length > 25)
    .map((l) => l.slice(0, 40).toLowerCase())
  const compte = new Map<string, number>()
  for (const o of ouvertures) compte.set(o, (compte.get(o) ?? 0) + 1)
  for (const [, n] of compte) {
    if (n > 2) { motifs.push('une même phrase d’ouverture revient plus de deux fois'); break }
  }

  return motifs
}

function listeCompetences(competences: Competence[]): string {
  return competences.map((c, i) => {
    const d = nettoyer(c.description)
    const r = c.rubrique ? ` [${nettoyer(c.rubrique)}]` : ''
    return `${i + 1}. (rang ${c.rang})${r} ${nettoyer(c.intitule)}${d ? ` — ${d.slice(0, 400)}` : ''}`
  }).join('\n')
}

const REGLES_COMMUNES = `Règles absolues :
- Tout ce que tu écris vient de la liste fournie. N'invente aucun fait, aucun chiffre, aucune molécule, aucune recommandation. Si une information n'est pas dans la liste, elle n'a pas sa place.
- Chaque paragraphe porte au moins une connaissance précise : un signe, un chiffre, un délai, un critère, une conduite à tenir, une contre-indication. Un paragraphe d'ambiance qui n'apprend rien est un paragraphe à supprimer.
- INTERDIT : les formules d'ouverture passe-partout (« Ce matin-là, aux urgences… », « Au bloc opératoire… », « Dans l'univers complexe de la médecine moderne… »), les titres génériques (« Chapitre 1 : Les Fondements »), et toute phrase de motivation ou de méta-commentaire sur l'apprentissage.
- Ne mentionne jamais le numéro de l'item ni le mot « rang » : ce ne sont pas des connaissances.
- Termes médicaux exacts. Français. Aucun emoji.`

function inviteRoman(titre: string, competences: Competence[]) {
  const systeme = `Tu écris un récit clinique qui sert à retenir un cours de médecine. Le lecteur est un étudiant : il doit finir le texte en sachant ce qu'il faut savoir, parce que l'histoire le lui a fait vivre.

${REGLES_COMMUNES}
- Forme : un récit suivi, en 5 à 8 chapitres. Un seul fil narratif, des personnages qui reviennent, une progression : présentation, examen, hypothèses, examens complémentaires, décision, suivi.
- Chaque chapitre porte un titre qui dit ce qu'on y apprend, pas un titre décoratif.
- Les connaissances de rang A forment le fil principal ; celles de rang B arrivent comme des complications, des formes rares ou des situations difficiles rencontrées en chemin.
- Réponds en JSON strict : {"chapitres":[{"titre":"...","texte":"...","competences":["OIC-..."]}]} et rien d'autre.`

  const utilisateur = `Item : ${titre}

Connaissances à faire passer (${competences.length}) — chacune doit se retrouver dans le récit :
${listeCompetences(competences)}

Écris le récit.`
  return { systeme, utilisateur }
}

function inviteBd(titre: string, competences: Competence[]) {
  const systeme = `Tu écris le scénario d'une bande dessinée qui sert à retenir un cours de médecine. Chaque case montre une scène concrète et dit une chose précise.

${REGLES_COMMUNES}
- Forme : 10 à 16 cases qui se suivent et racontent une histoire, pas une liste illustrée.
- Chaque case comporte : une narration courte (une à deux phrases), un dialogue quand il éclaire la notion, et une description d'image PRÉCISE et dessinable (lieu, personnages, ce qu'on voit, ce qui est montré du doigt). La description d'image ne contient ni texte à afficher, ni logo, ni visage de personne réelle.
- Les connaissances de rang A ouvrent l'histoire ; celles de rang B apparaissent dans les cases suivantes, comme des cas plus difficiles.
- Réponds en JSON strict : {"cases":[{"titre":"...","narration":"...","dialogue":"...","illustration":"...","competences":["OIC-..."]}]} et rien d'autre.`

  const utilisateur = `Item : ${titre}

Connaissances à faire passer (${competences.length}) — chacune doit se retrouver dans les cases :
${listeCompetences(competences)}

Écris le scénario.`
  return { systeme, utilisateur }
}

async function appelerModele(systeme: string, utilisateur: string, _cle: string, temperature: number) {
  // Passerelle Lovable d'abord, OpenAI si elle refuse (crédits épuisés, surcharge).
  const r = await completionIA({
    model: MODELE,
    temperature,
      response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systeme },
      { role: 'user', content: utilisateur },
    ],
  })
  if (!r.ok) throw new Error(`passerelle IA ${r.status} : ${(await r.text()).slice(0, 300)}`)
  const j = await r.json()
  const texte = j?.choices?.[0]?.message?.content
  if (!texte || typeof texte !== 'string') throw new Error('réponse du modèle vide')
  return texte.trim()
}

function extraireJson(brut: string): Record<string, unknown> {
  const sansClotures = brut.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  return JSON.parse(sansClotures)
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const repondre = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { itemCode, format = 'roman', enregistrer = true } = await req.json().catch(() => ({}))
    if (!itemCode) return repondre({ error: 'itemCode manquant' }, 400)
    if (!['roman', 'bd'].includes(format)) return repondre({ error: "format doit valoir « roman » ou « bd »" }, 400)

    const cle = Deno.env.get('LOVABLE_API_KEY') ?? ''

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: item, error: eItem } = await supabase
      .from('edn_items_complete').select('item_code, title').eq('item_code', itemCode).maybeSingle()
    if (eItem) return repondre({ error: `lecture de l'item : ${eItem.message}` }, 500)
    if (!item) return repondre({ error: `item ${itemCode} introuvable` }, 404)

    const numero = String(itemCode).replace(/^IC-/, '').padStart(3, '0')
    const { data: brutes, error: eComp } = await supabase
      .from('oic_competences')
      .select('objectif_id, rang, intitule, description, rubrique')
      .eq('item_parent', numero).order('objectif_id')
    if (eComp) return repondre({ error: `lecture des compétences : ${eComp.message}` }, 500)

    // Le récit et les planches couvrent l'item ENTIER : rang A puis rang B.
    const competences = (brutes ?? [])
      .filter((c: Competence) => EST_COMPETENCE_REELLE.test(c.objectif_id))
      .filter((c: Competence) => nettoyer(c.intitule).length >= 3)
      .sort((a: Competence, b: Competence) => (a.rang === b.rang ? 0 : a.rang === 'A' ? -1 : 1))

    if (competences.length === 0) {
      return repondre({
        error: 'aucune_competence',
        message: `Le référentiel UNESS ne contient aucune compétence pour l'item ${itemCode}. Rien n'est écrit : il n'y a rien à raconter.`,
      }, 422)
    }

    const { systeme, utilisateur } = format === 'roman'
      ? inviteRoman(item.title, competences)
      : inviteBd(item.title, competences)
    const minMots = format === 'roman' ? 600 : 300

    let brut = ''
    let motifs: string[] = []
    let analyse: Record<string, unknown> | null = null
    const essais: { essai: number; motifs: string[] }[] = []

    for (let essai = 1; essai <= 3; essai++) {
      const rappel = essai === 1 ? '' :
        `\n\nLa version précédente a été refusée pour : ${motifs.join(' ; ')}. Reprends en corrigeant précisément ces points.`
      brut = await appelerModele(systeme, utilisateur + rappel, cle, essai === 1 ? 0.8 : 0.6)
      try { analyse = extraireJson(brut) } catch { motifs = ['réponse non lisible en JSON']; essais.push({ essai, motifs }); continue }

      const morceaux = format === 'roman'
        ? (analyse.chapitres as { titre?: string; texte?: string }[] | undefined) ?? []
        : (analyse.cases as { titre?: string; narration?: string; dialogue?: string; illustration?: string }[] | undefined) ?? []
      const texteEntier = morceaux.map((m) =>
        [m.titre, (m as { texte?: string }).texte, (m as { narration?: string }).narration,
         (m as { dialogue?: string }).dialogue].filter(Boolean).join('\n')
      ).join('\n')

      motifs = controlerQualite(texteEntier, competences, minMots)
      if (morceaux.length < (format === 'roman' ? 5 : 8)) {
        motifs.push(`${morceaux.length} ${format === 'roman' ? 'chapitres' : 'cases'} : trop peu`)
      }
      essais.push({ essai, motifs })
      if (motifs.length === 0) break
    }

    if (motifs.length > 0 || !analyse) {
      return repondre({
        error: 'qualite_insuffisante',
        message: `Le ${format === 'roman' ? 'récit' : 'scénario'} produit ne transporte pas le contenu de l'item.`,
        motifs, essais, itemCode, format,
      }, 422)
    }

    if (enregistrer) {
      const colonne = format === 'roman' ? 'roman_story' : 'bd_panels'
      const contenu = format === 'roman' ? analyse.chapitres : analyse.cases
      const { error: eMaj } = await supabase
        .from('edn_items_immersive')
        .update({ [colonne]: contenu, updated_at: new Date().toISOString() })
        .eq('item_code', itemCode)
      if (eMaj) return repondre({ error: `enregistrement : ${eMaj.message}`, contenu }, 500)
    }

    return repondre({
      itemCode, format,
      titre: item.title,
      competences_utilisees: competences.length,
      essais: essais.length,
      contenu: format === 'roman' ? analyse.chapitres : analyse.cases,
      enregistre: enregistrer,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('generer-recit-item :', message)
    return repondre({ error: message }, 500)
  }
})
