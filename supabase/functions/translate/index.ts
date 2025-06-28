
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'fr' } = await req.json()

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing text or targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Utiliser l'API OpenAI pour la traduction
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const languageMap: Record<string, string> = {
      fr: 'French',
      en: 'English',
      es: 'Spanish',
      de: 'German',
      pt: 'Portuguese',
      ar: 'Arabic',
      zh: 'Chinese',
      ja: 'Japanese',
      ru: 'Russian',
      hi: 'Hindi',
      it: 'Italian',
      ko: 'Korean',
      tr: 'Turkish',
      nl: 'Dutch',
      pl: 'Polish'
    }

    const targetLang = languageMap[targetLanguage] || targetLanguage
    const sourceLang = languageMap[sourceLanguage] || sourceLanguage

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional medical translator. Translate the following medical/educational text from ${sourceLang} to ${targetLang}. 
            Maintain medical accuracy, preserve formatting, and ensure the translation is clear and professional. 
            Keep technical medical terms accurate. If there are HTML tags, preserve them exactly.
            Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const translatedText = data.choices[0]?.message?.content || text

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
