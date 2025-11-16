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
    const { notificationId } = await req.json();

    if (!notificationId) {
      return new Response(
        JSON.stringify({ error: "notificationId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`🔄 Resending notification: ${notificationId}`);

    // Récupérer la notification à renvoyer
    const { data: notification, error: fetchError } = await supabaseClient
      .from("notification_history")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      throw new Error("Notification not found");
    }

    console.log(`Resending to ${notification.platform}: ${notification.webhook_url}`);

    let response;
    const message = notification.message_content;

    if (notification.platform === "slack") {
      response = await fetch(notification.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `🏆 ${notification.test_name || 'Test A/B terminé'}`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `🔄 Renvoi manuel • ${new Date().toLocaleString('fr-FR')}`,
                },
              ],
            },
          ],
        }),
      });
    } else if (notification.platform === "discord") {
      response = await fetch(notification.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `🏆 ${notification.test_name || 'Test A/B terminé'}`,
              description: message,
              color: 0x5865f2,
              timestamp: new Date().toISOString(),
              footer: {
                text: "🔄 Renvoi manuel",
              },
            },
          ],
        }),
      });
    }

    if (!response || !response.ok) {
      const errorText = await response?.text();
      console.error(`Failed to resend notification:`, errorText);
      
      // Enregistrer l'échec
      await supabaseClient.from("notification_history").insert({
        user_id: notification.user_id,
        test_id: notification.test_id,
        test_name: notification.test_name,
        template_id: notification.template_id,
        platform: notification.platform,
        message_content: notification.message_content,
        status: "failed",
        error_message: `Resend failed: ${response?.status} ${response?.statusText}`,
        webhook_url: notification.webhook_url,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to resend: ${response?.status} ${response?.statusText}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enregistrer le succès
    await supabaseClient.from("notification_history").insert({
      user_id: notification.user_id,
      test_id: notification.test_id,
      test_name: notification.test_name,
      template_id: notification.template_id,
      platform: notification.platform,
      message_content: notification.message_content,
      status: "success",
      webhook_url: notification.webhook_url,
    });

    console.log(`✅ Notification resent successfully`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification renvoyée avec succès",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error resending notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
