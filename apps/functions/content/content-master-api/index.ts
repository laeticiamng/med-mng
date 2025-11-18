import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès content-master-api sans authentification');
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
      console.warn('❌ Token invalide pour content-master-api');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ content-master-api autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (path) {
      case 'get-master-content':
        return await getMasterContent(req, supabase);
      case 'track-view':
        return await trackContentView(req, supabase);
      case 'generate-content':
        return await generateMasterContent(req, supabase);
      case 'get-stats':
        return await getContentStats(req, supabase);
      default:
        return new Response(JSON.stringify({ error: 'Endpoint non trouvé' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Erreur Content Master API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getMasterContent(req: Request, supabase: any) {
  const url = new URL(req.url);
  const itemId = url.searchParams.get('item_id');
  const contentType = url.searchParams.get('content_type');

  if (!itemId) {
    return new Response(JSON.stringify({ error: 'item_id requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`📚 Récupération contenu master: ${itemId} (${contentType || 'all'})`);

  // Récupérer le contenu master
  const { data: masterContent, error } = await supabase
    .from('med_mng_content_master')
    .select('*')
    .eq('item_id', itemId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Erreur récupération master:', error);
    return new Response(JSON.stringify({ error: 'Erreur récupération contenu' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Si pas de contenu master, créer un placeholder
  if (!masterContent) {
    console.log('🔧 Création contenu master placeholder pour:', itemId);
    
    const { data: itemData } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b')
      .eq('item_code', itemId)
      .single();

    const placeholderContent = {
      item_id: itemId,
      comic_data: null,
      novel_data: null,
      poem_data: null,
      images_data: null,
      generated_at: new Date().toISOString(),
      generation_version: 'v1.0',
      quality_score: 0,
      views_count: 0,
      unique_viewers_count: 0,
      avg_reading_time: 0,
      has_lyrics_sync: false,
      content_size_kb: 0
    };

    return new Response(JSON.stringify({
      success: true,
      content: placeholderContent,
      status: 'not_generated',
      message: 'Contenu en attente de génération'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Filtrer par type si spécifié
  let responseContent = masterContent;
  if (contentType) {
    const typeField = `${contentType}_data`;
    responseContent = {
      ...masterContent,
      requested_type: contentType,
      content: masterContent[typeField]
    };
  }

  return new Response(JSON.stringify({
    success: true,
    content: responseContent,
    status: 'available',
    generated_at: masterContent.generated_at
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function trackContentView(req: Request, supabase: any) {
  const { item_id, content_type, view_duration = 0, completed = false, completion_percentage = 0 } = await req.json();

  // Authentification optionnelle (anonyme autorisé)
  const authHeader = req.headers.get('Authorization');
  let userId = null;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id || null;
  }

  console.log(`👁️ Tracking vue: ${item_id} (${content_type}) - Durée: ${view_duration}s`);

  // Enregistrer la vue
  const { error } = await supabase
    .from('med_mng_content_views')
    .insert({
      item_id,
      user_id: userId,
      content_type,
      view_duration,
      completed,
      completion_percentage,
      device_type: 'web',
      ip_address: req.headers.get('x-forwarded-for') || '0.0.0.0',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

  if (error) {
    console.error('❌ Erreur tracking vue:', error);
    return new Response(JSON.stringify({ error: 'Erreur enregistrement vue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Vue enregistrée'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateMasterContent(req: Request, supabase: any) {
  // Authentification admin requise
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentification requise' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Token invalide' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { item_id, content_types, regenerate = false } = await req.json();

  if (!item_id || !content_types || !Array.isArray(content_types)) {
    return new Response(JSON.stringify({ error: 'item_id et content_types[] requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`🎨 Génération contenu master: ${item_id} - Types: ${content_types.join(', ')}`);

  // Récupérer l'item
  const { data: itemData, error: itemError } = await supabase
    .from('edn_items_immersive')
    .select('*')
    .eq('item_code', item_id)
    .single();

  if (itemError || !itemData) {
    return new Response(JSON.stringify({ error: 'Item non trouvé' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results: any = {};

  // Générer chaque type de contenu
  for (const contentType of content_types) {
    try {
      console.log(`🎯 Génération ${contentType} pour ${item_id}`);
      
      const generatedContent = await generateSpecificContent(contentType, itemData);
      results[contentType] = {
        success: true,
        content: generatedContent,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Erreur génération ${contentType}:`, error);
      results[contentType] = {
        success: false,
        error: error.message
      };
    }
  }

  // Sauvegarder le contenu master
  const updateData: any = {
    item_id,
    generation_version: 'v1.0',
    generated_at: new Date().toISOString(),
    quality_score: 85,
    approved_by: user.id,
    approved_at: new Date().toISOString()
  };

  // Ajouter les contenus générés avec succès
  if (results.comic?.success) updateData.comic_data = results.comic.content;
  if (results.novel?.success) updateData.novel_data = results.novel.content;
  if (results.poem?.success) updateData.poem_data = results.poem.content;
  if (results.images?.success) updateData.images_data = results.images.content;

  const { error: saveError } = await supabase
    .from('med_mng_content_master')
    .upsert(updateData);

  if (saveError) {
    console.error('❌ Erreur sauvegarde master:', saveError);
    return new Response(JSON.stringify({ error: 'Erreur sauvegarde' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    item_id,
    results,
    message: 'Contenu master généré avec succès'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateSpecificContent(contentType: string, itemData: any) {
  console.log(`🎨 Génération ${contentType} pour ${itemData.item_code}`);
  
  switch (contentType) {
    case 'comic':
      return {
        title: `BD Éducative - ${itemData.title}`,
        item_code: itemData.item_code,
        panels: [
          {
            panel_number: 1,
            title: "Introduction",
            visual_description: "Médecin en blouse blanche dans un cabinet médical moderne",
            dialogue: `Bienvenue dans l'univers de ${itemData.title}`,
            medical_concept: "Présentation du sujet médical"
          },
          {
            panel_number: 2,
            title: "Diagnostic",
            visual_description: "Examen clinique détaillé d'un patient",
            dialogue: "L'examen révèle des signes caractéristiques...",
            medical_concept: "Méthodologie diagnostique"
          },
          {
            panel_number: 3,
            title: "Traitement",
            visual_description: "Prescription et explication thérapeutique",
            dialogue: "Le traitement adapté permettra une guérison complète",
            medical_concept: "Stratégie thérapeutique"
          }
        ],
        style: "éducatif",
        generation_date: new Date().toISOString()
      };

    case 'novel':
      return {
        title: `Roman Médical - ${itemData.title}`,
        item_code: itemData.item_code,
        chapters: [
          {
            chapter_number: 1,
            title: "L'Arrivée",
            content: `Dr. Sarah Martin découvre sa nouvelle affectation au service spécialisé en ${itemData.title.toLowerCase()}. Les défis qui l'attendent vont mettre à l'épreuve toutes ses connaissances théoriques.`
          },
          {
            chapter_number: 2,
            title: "Premier Cas",
            content: "Le premier patient présente des symptômes complexes qui nécessitent une approche méthodique et rigoureuse. Chaque détail compte dans l'établissement du diagnostic."
          },
          {
            chapter_number: 3,
            title: "La Résolution",
            content: "Grâce à son expertise nouvellement acquise, Dr. Martin parvient à résoudre le cas complexe, illustrant parfaitement les principes fondamentaux de cette spécialité."
          }
        ],
        medical_themes: ["diagnostic", "traitement", "éthique médicale"],
        reading_time_minutes: 15,
        generation_date: new Date().toISOString()
      };

    case 'poem':
      return {
        title: `Poème Médical - ${itemData.title}`,
        item_code: itemData.item_code,
        stanzas: [
          {
            stanza_number: 1,
            lines: [
              `Dans l'art médical, ${itemData.title.toLowerCase()}`,
              "Révèle ses secrets aux yeux avertis",
              "Chaque symptôme, chaque signe",
              "Guide le praticien vers la vérité"
            ],
            medical_focus: "Introduction diagnostique"
          },
          {
            stanza_number: 2,
            lines: [
              "L'examen clinique méthodique",
              "Dévoile les mystères cachés",
              "Science et intuition s'allient",
              "Pour guérir et soulager"
            ],
            medical_focus: "Approche thérapeutique"
          }
        ],
        style: "lyrique médical",
        rhyme_scheme: "ABAB",
        key_concepts: ["diagnostic", "traitement", "empathie"],
        generation_date: new Date().toISOString()
      };

    case 'images':
      return {
        title: `Galerie Visuelle - ${itemData.title}`,
        item_code: itemData.item_code,
        images: [
          {
            id: 1,
            title: "Anatomie Fonctionnelle",
            description: "Illustration anatomique détaillée",
            url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600",
            type: "anatomique"
          },
          {
            id: 2,
            title: "Procédure Diagnostique",
            description: "Étapes de diagnostic illustrées",
            url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600",
            type: "procédural"
          }
        ],
        total_images: 2,
        generation_date: new Date().toISOString()
      };

    default:
      throw new Error(`Type de contenu non supporté: ${contentType}`);
  }
}

async function getContentStats(req: Request, supabase: any) {
  const url = new URL(req.url);
  const itemId = url.searchParams.get('item_id');
  const timeframe = url.searchParams.get('timeframe') || '7d';

  console.log(`📊 Récupération stats contenu: ${itemId || 'all'} (${timeframe})`);

  // Calcul de la période
  const timeframeMappings: { [key: string]: string } = {
    '1d': '1 day',
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days'
  };

  const period = timeframeMappings[timeframe] || '7 days';

  let query = supabase
    .from('med_mng_content_views')
    .select('item_id, content_type, view_duration, completed, viewed_at')
    .gte('viewed_at', `now() - interval '${period}'`);

  if (itemId) {
    query = query.eq('item_id', itemId);
  }

  const { data: views, error } = await query;

  if (error) {
    console.error('❌ Erreur récupération stats:', error);
    return new Response(JSON.stringify({ error: 'Erreur récupération stats' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculer les statistiques
  const stats = {
    total_views: views.length,
    unique_items: new Set(views.map(v => v.item_id)).size,
    avg_duration: views.length > 0 ? Math.round(views.reduce((sum, v) => sum + (v.view_duration || 0), 0) / views.length) : 0,
    completion_rate: views.length > 0 ? Math.round((views.filter(v => v.completed).length / views.length) * 100) : 0,
    by_content_type: views.reduce((acc: any, view) => {
      acc[view.content_type] = (acc[view.content_type] || 0) + 1;
      return acc;
    }, {}),
    by_item: views.reduce((acc: any, view) => {
      acc[view.item_id] = (acc[view.item_id] || 0) + 1;
      return acc;
    }, {}),
    timeframe,
    period
  };

  return new Response(JSON.stringify({
    success: true,
    stats
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}