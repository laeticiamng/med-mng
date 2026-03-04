import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, itemContext, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch student performance data from Supabase
    let studentContext = '';
    if (userId && itemContext?.itemCode) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get SRS data for this item
        const { data: srsData } = await supabase
          .from('srs_card_data')
          .select('*')
          .eq('user_id', userId)
          .eq('card_id', itemContext.itemCode)
          .maybeSingle();

        // Get overall SRS stats
        const { data: allSRS } = await supabase
          .from('srs_card_data')
          .select('ease_factor, interval_days, review_count, correct_count')
          .eq('user_id', userId);

        // Get recent activity for this item
        const { data: activities } = await supabase
          .from('user_activity_log')
          .select('activity_type, score, created_at, metadata')
          .eq('user_id', userId)
          .eq('item_code', itemContext.itemCode)
          .order('created_at', { ascending: false })
          .limit(10);

        // Get exam scores related to this specialty
        const { data: examData } = await supabase
          .from('ai_exam_history')
          .select('score, exam_type, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(5);

        // Build student performance context
        const totalItems = allSRS?.length || 0;
        const avgEF = totalItems > 0
          ? (allSRS!.reduce((s: number, c: any) => s + (c.ease_factor || 2.5), 0) / totalItems).toFixed(2)
          : '2.50';
        const masteredCount = allSRS?.filter((c: any) => (c.interval_days || 0) >= 21).length || 0;

        studentContext = `
DONNÉES DE PERFORMANCE DE L'ÉTUDIANT (confidentielles, à utiliser pour personnaliser tes réponses) :

📊 Cet item (${itemContext.itemCode}) :
- Nombre de révisions : ${srsData?.review_count || 0}
- Réponses correctes : ${srsData?.correct_count || 0}
- Facteur de facilité : ${srsData?.ease_factor?.toFixed(2) || 'Pas encore évalué'}
- Intervalle actuel : ${srsData?.interval_days || 0} jours
- Dernière révision : ${srsData?.last_reviewed ? new Date(srsData.last_reviewed).toLocaleDateString('fr-FR') : 'Jamais'}
${srsData?.ease_factor && srsData.ease_factor < 2.0 ? '⚠️ ITEM DIFFICILE pour cet étudiant (EF < 2.0) - Adapte tes explications en conséquence.' : ''}
${srsData?.review_count && srsData.correct_count ? `- Taux de réussite : ${Math.round((srsData.correct_count / srsData.review_count) * 100)}%` : ''}

📈 Profil global :
- Items étudiés : ${totalItems}
- Items maîtrisés (intervalle ≥ 21j) : ${masteredCount}
- Facilité moyenne : ${avgEF}

${activities && activities.length > 0 ? `📝 Activités récentes sur cet item :
${activities.slice(0, 5).map((a: any) => `- ${a.activity_type} (score: ${a.score || 'N/A'}) le ${new Date(a.created_at).toLocaleDateString('fr-FR')}`).join('\n')}` : ''}

${examData && examData.length > 0 ? `🎯 Derniers examens :
${examData.map((e: any) => `- ${e.exam_type || 'Examen'}: ${e.score}% (${new Date(e.completed_at).toLocaleDateString('fr-FR')})`).join('\n')}` : ''}
`;
      } catch (dbError) {
        console.error('Error fetching student data:', dbError);
        // Continue without student context
      }
    }

    // Build item content context from notes
    let itemContent = '';
    if (itemContext?.notes && Array.isArray(itemContext.notes)) {
      itemContent = `\nCONTENU PÉDAGOGIQUE DE L'ITEM :\n${itemContext.notes.map((n: any) => {
        const content = typeof n.content === 'string' ? n.content : JSON.stringify(n.content);
        return `### ${n.title}\n${content}`;
      }).join('\n\n')}`;
    }

    const systemPrompt = `Tu es un tuteur médical expert et bienveillant, spécialisé dans la préparation aux EDN (Épreuves Dématérialisées Nationales) en France.

🎯 CONTEXTE DE L'ITEM ACTUEL :
- Code : ${itemContext?.itemCode || 'Non spécifié'}
- Titre : ${itemContext?.title || 'Non spécifié'}
- Spécialité : ${itemContext?.specialty || 'Non spécifiée'}
- Rang : ${itemContext?.rang || 'Non précisé'}
- Mots-clés : ${itemContext?.keywords?.join(', ') || 'Non spécifiés'}
${itemContent}

${studentContext}

🧠 TON RÔLE :
1. **Explications contextuelles** : Réponds aux questions en te basant sur le contenu exact de cet item. Cite les points clés des fiches quand pertinent.
2. **Personnalisation** : Utilise les données de performance pour adapter ta pédagogie :
   - Si EF < 2.0 → l'étudiant galère sur cet item : simplifie, utilise des analogies, propose des mnémoniques
   - Si EF > 2.5 → l'étudiant maîtrise bien : propose des cas cliniques avancés, des pièges classiques
   - Si jamais révisé → commence par les bases, structure ta réponse progressivement
3. **Plan de remédiation** : Quand on te le demande, propose un plan personnalisé :
   - Points forts et points faibles identifiés
   - Séquence de révision optimale (avec timing)
   - Exercices ciblés
   - Items EDN connexes à réviser
4. **Liens transversaux** : Fais des connexions avec d'autres items EDN quand c'est pertinent.

📏 RÈGLES :
- Réponds en français, de manière pédagogique et structurée
- Utilise le markdown pour la mise en forme (titres, listes, gras)
- Propose des moyens mnémotechniques quand pertinent
- Cite les sources officielles (collèges des enseignants, référentiels nationaux)
- Si tu n'es pas sûr d'une information médicale, dis-le clairement
- Sois concis mais complet : l'étudiant doit pouvoir agir après ta réponse
- Ne révèle JAMAIS les données de performance brutes, utilise-les de manière naturelle`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    console.error("AI tutor error:", error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
