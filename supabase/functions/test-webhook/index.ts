import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookUrl, type } = await req.json();

    if (!webhookUrl || !type) {
      return new Response(
        JSON.stringify({ error: "webhook URL and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Testing ${type} webhook: ${webhookUrl}`);

    const testMessage = `🧪 Test de notification ${type}\n\nCeci est un message de test pour vérifier que votre webhook fonctionne correctement.\n\nDate: ${new Date().toLocaleString('fr-FR')}`;

    let response;

    if (type === "slack") {
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testMessage,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🧪 Test de notification Slack",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Ceci est un message de test pour vérifier que votre webhook fonctionne correctement.",
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `📅 ${new Date().toLocaleString('fr-FR')}`,
                },
              ],
            },
          ],
        }),
      });
    } else if (type === "discord") {
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🧪 Test de notification Discord",
              description: testMessage,
              color: 0x5865f2,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid webhook type. Use 'slack' or 'discord'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${type} webhook test failed:`, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Webhook test failed: ${response.status} ${response.statusText}`,
          details: errorText 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ ${type} webhook test successful`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test envoyé avec succès sur ${type}!` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error testing webhook:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
