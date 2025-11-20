import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès generate-comic-images sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour generate-comic-images');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ generate-comic-images autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const { scene_description, style = "medical comic book illustration", item_code } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log(`🎨 Génération d'image pour ${item_code}: ${scene_description}`)

    // Améliorer le prompt pour des images médicales de qualité
    const enhancedPrompt = `${scene_description}. 
    Style: ${style}, clean medical illustration, professional healthcare setting, 
    bright and welcoming atmosphere, detailed character expressions, 
    high quality digital art, educational and approachable visual style.
    Ultra high resolution.`

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        style: 'natural'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur OpenAI Image:', error)
      throw new Error(`OpenAI Image API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated')
    }

    // L'API OpenAI retourne maintenant du base64 direct pour gpt-image-1
    const imageData = data.data[0]
    let imageUrl = ''
    
    if (imageData.url) {
      imageUrl = imageData.url
    } else if (imageData.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`
    } else {
      throw new Error('No image URL or base64 data received')
    }

    console.log(`✅ Image générée avec succès pour ${item_code}`)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt: enhancedPrompt,
        item_code,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération image:', error)
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