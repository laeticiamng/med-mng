import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, format, item_code, content_type } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log(`🎯 Génération de contenu ${content_type} pour ${item_code}`)
    
    // Configuration selon le type de contenu
    const systemPrompt = getSystemPrompt(content_type)
    const maxTokens = getMaxTokens(content_type)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur OpenAI:', error)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedContent = data.choices[0].message.content

    console.log(`✅ Contenu ${content_type} généré avec succès`)

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        format: content_type,
        item_code,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération contenu:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function getSystemPrompt(contentType: string): string {
  switch (contentType) {
    case 'novel':
      return `Tu es un écrivain médical spécialisé dans la création de romans pédagogiques. 
      Crée des récits captivants qui intègrent naturellement les connaissances médicales.
      Style: narratif, accessible, avec des personnages développés et des situations réalistes.
      Structure: introduction engageante, développement progressif, résolution éducative.`

    case 'podcast':
      return `Tu es un créateur de contenu audio médical spécialisé dans les podcasts éducatifs.
      Crée des scripts de podcast avec un dialogue naturel entre experts médicaux.
      Format: conversation pédagogique, exemples concrets, transitions fluides.
      Inclus: [INTRO], [SEGMENT 1], [SEGMENT 2], [CONCLUSION] avec indications audio.`

    case 'video':
      return `Tu es un scriptwriter pour contenu vidéo médical éducatif.
      Crée des scripts détaillés avec indications visuelles et narratives.
      Format: séquences courtes, visuels décrits, rythme dynamique.
      Inclus: [PLAN], [VISUEL], [NARRATION] pour chaque séquence.`

    case 'infographic':
      return `Tu es un concepteur d'infographies médicales pédagogiques.
      Crée des descriptions détaillées d'infographies visuelles et informatives.
      Format: structure claire, hiérarchie visuelle, données synthétiques.
      Inclus: titre principal, sous-sections, éléments visuels, statistiques clés.`

    default:
      return `Tu es un expert en pédagogie médicale. Adapte le contenu médical 
      fourni dans un format accessible et pédagogique selon les meilleures pratiques éducatives.`
  }
}

function getMaxTokens(contentType: string): number {
  switch (contentType) {
    case 'novel':
      return 3000  // Roman plus long
    case 'podcast':
      return 2500  // Script détaillé
    case 'video':
      return 2000  // Script avec indications
    case 'infographic':
      return 1500  // Description concise
    default:
      return 2000
  }
}