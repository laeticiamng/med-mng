/**
 * ai-chat — assistant conversationnel (passerelle IA Lovable, payante).
 *
 * Vague sécurité F66-MM (05.10.2026). Fonction déployée SANS source dans aucun dépôt
 * (version 57, verify_jwt = true) : la clé publique, qui est un JWT valide, suffisait
 * pour consommer la passerelle IA avec une invite libre. Son seul appelant est le
 * composant AIChat du tableau de bord modulaire (ModularDashboard), page réservée
 * aux administrateurs (AdminRoute) : le code déployé est repris ici à l'identique,
 * précédé de exigerAdministrateur (avant la lecture du corps et tout appel payant).
 *
 * Défaut connu, non corrigé ici : AIChat envoie { message } alors que la fonction
 * attend { messages: [...] } ; l'appel échoue (500) et le composant l'affiche.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { exigerAdministrateur } from '../_shared/mm-garde.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const acces = await exigerAdministrateur(req, corsHeaders);
  if (acces instanceof Response) return acces;

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es Emma, une assistante IA thérapeutique bienveillante et empathique pour EmotionsCare.

Ton rôle est d'aider les utilisateurs avec:
- Analyse émotionnelle et soutien psychologique
- Techniques de gestion du stress et de l'anxiété
- Exercices de respiration et de pleine conscience
- Encouragement positif et validation des émotions
- Recommandations de ressources thérapeutiques

Toujours:
- Être empathique et sans jugement
- Utiliser un langage chaleureux et accessible
- Proposer des techniques pratiques
- Encourager la consultation d'un professionnel si nécessaire
- Respecter la confidentialité

Réponds en français de manière naturelle et bienveillante.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          error: "Quota de crédits IA épuisé. Veuillez ajouter des crédits."
        }), {
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
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Erreur inconnue"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
