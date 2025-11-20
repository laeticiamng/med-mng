import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès sitemap-recommendations sans authentification');
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
      console.warn('❌ Token invalide pour sitemap-recommendations');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative sitemap-recommendations par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ sitemap-recommendations autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const { visitedPaths, currentPath } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Préparer le contexte pour l'IA
    const prompt = `Tu es un expert en navigation et recommandations de contenu. Analyse l'historique de navigation suivant et recommande 3-5 pages complémentaires ou similaires.

Historique de navigation (chemins visités par ordre de fréquence):
${Object.entries(visitedPaths)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 10)
  .map(([path, count]) => `- ${path} (${count} visites)`)
  .join('\n')}

Page actuelle: ${currentPath || 'Accueil'}

Routes disponibles dans l'application:
- EDN: Extractions de Données Nationales, audit, tableaux de bord
- ECOS: Examens Cliniques Objectifs Structurés, scénarios, simulations
- Admin: Import de données, audit, extraction, gestion
- Med-MNG: Génération musicale médicale, bibliothèque, playlists
- Shopping: Boutique de sons, panier, checkout
- Monitoring: Surveillance temps réel, métriques, alertes
- Sécurité: Surveillance, RLS, conformité RGPD

Recommande des pages qui:
1. Complètent le parcours actuel de l'utilisateur
2. Sont logiquement liées aux pages déjà visitées
3. Pourraient intéresser l'utilisateur selon son historique

Réponds UNIQUEMENT avec un JSON valide sans markdown:
{
  "recommendations": [
    {
      "path": "/chemin-exact",
      "reason": "Raison claire et concise de la recommandation",
      "category": "Catégorie de la page",
      "relevance": 0.9
    }
  ],
  "insight": "Une observation générale sur le parcours de navigation"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un expert en analyse de navigation et recommandations. Réponds toujours en JSON valide sans markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit dépassée, veuillez réessayer dans quelques instants.",
            recommendations: [],
            insight: "Limite de requêtes atteinte"
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits insuffisants pour Lovable AI.",
            recommendations: [],
            insight: "Crédits épuisés"
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Nettoyer le contenu si nécessaire (enlever les markdown code blocks)
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let recommendations;
    try {
      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", cleanContent);
      recommendations = {
        recommendations: [],
        insight: "Erreur lors de l'analyse des recommandations"
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in sitemap-recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur inconnue",
        recommendations: [],
        insight: "Une erreur s'est produite"
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
