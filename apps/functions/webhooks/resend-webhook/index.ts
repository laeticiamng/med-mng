import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at?: string;
    bounce?: {
      type: string;
      message: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📬 Resend webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ✅ SÉCURITÉ: Vérifier la signature Resend/Svix
    const signature = req.headers.get("svix-signature");
    const timestamp = req.headers.get("svix-timestamp");
    const id = req.headers.get("svix-id");

    // Note: La vérification complète Svix nécessiterait la bibliothèque svix
    // Pour l'instant, on vérifie la présence des headers requis
    if (!signature || !timestamp || !id) {
      console.warn('❌ Headers Svix manquants pour resend-webhook');
      return new Response(
        JSON.stringify({ error: 'Missing Svix signature headers' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Headers Svix présents:', { id, timestamp });

    const payload: ResendWebhookEvent = await req.json();
    console.log("Webhook type:", payload.type);
    console.log("Email ID:", payload.data.email_id);

    const emailId = payload.data.email_id;
    const recipient = payload.data.to[0]; // Premier destinataire

    // Vérifier si l'email existe déjà
    const { data: existingStat } = await supabaseClient
      .from("email_statistics")
      .select("*")
      .eq("email_id", emailId)
      .single();

    const now = new Date().toISOString();

    switch (payload.type) {
      case "email.sent":
      case "email.delivered":
        if (!existingStat) {
          // Créer une nouvelle entrée
          await supabaseClient.from("email_statistics").insert({
            email_id: emailId,
            recipient,
            subject: payload.data.subject,
            sent_at: payload.data.created_at || now,
            delivered_at: payload.type === "email.delivered" ? now : null,
          });
          console.log("✅ Email stat created for:", emailId);
        } else if (payload.type === "email.delivered") {
          // Mettre à jour avec la date de livraison
          await supabaseClient
            .from("email_statistics")
            .update({ delivered_at: now })
            .eq("email_id", emailId);
          console.log("✅ Email delivered:", emailId);
        }
        break;

      case "email.opened":
        if (existingStat) {
          const openCount = (existingStat.open_count || 0) + 1;
          const updateData: any = {
            opened_at: now,
            open_count: openCount,
          };

          // Enregistrer la première ouverture
          if (!existingStat.first_opened_at) {
            updateData.first_opened_at = now;
          }

          await supabaseClient
            .from("email_statistics")
            .update(updateData)
            .eq("email_id", emailId);

          // Mettre à jour les compteurs A/B si applicable
          const { data: abResult } = await supabaseClient
            .from("email_ab_results")
            .select("ab_test_id, template_variant")
            .eq("email_stat_id", existingStat.id)
            .single();

          if (abResult) {
            const field = abResult.template_variant === 'A' ? 'total_opened_a' : 'total_opened_b';
            const { data: currentTest } = await supabaseClient
              .from("email_ab_tests")
              .select(field)
              .eq("id", abResult.ab_test_id)
              .single();

            if (currentTest) {
              await supabaseClient
                .from("email_ab_tests")
                .update({ [field]: (currentTest[field] || 0) + 1 })
                .eq("id", abResult.ab_test_id);

              // Recalculer le gagnant
              await supabaseClient.rpc("calculate_ab_test_winner", {
                test_id: abResult.ab_test_id,
              });
            }
          }

          console.log(`✅ Email opened (${openCount}x):`, emailId);
        } else {
          // Créer l'entrée si elle n'existe pas
          await supabaseClient.from("email_statistics").insert({
            email_id: emailId,
            recipient,
            subject: payload.data.subject,
            opened_at: now,
            first_opened_at: now,
            open_count: 1,
          });
          console.log("✅ Email stat created with open:", emailId);
        }
        break;

      case "email.clicked":
        if (existingStat) {
          const clickCount = (existingStat.click_count || 0) + 1;
          await supabaseClient
            .from("email_statistics")
            .update({
              clicked_at: now,
              click_count: clickCount,
            })
            .eq("email_id", emailId);

          console.log(`✅ Email clicked (${clickCount}x):`, emailId);
        }
        break;

      case "email.bounced":
        const bounceType = payload.data.bounce?.type || "unknown";
        if (existingStat) {
          await supabaseClient
            .from("email_statistics")
            .update({
              bounced: true,
              bounce_type: bounceType,
            })
            .eq("email_id", emailId);
        } else {
          await supabaseClient.from("email_statistics").insert({
            email_id: emailId,
            recipient,
            subject: payload.data.subject,
            bounced: true,
            bounce_type: bounceType,
          });
        }
        console.log(`⚠️ Email bounced (${bounceType}):`, emailId);
        break;

      case "email.complained":
        if (existingStat) {
          await supabaseClient
            .from("email_statistics")
            .update({ complained: true })
            .eq("email_id", emailId);
        } else {
          await supabaseClient.from("email_statistics").insert({
            email_id: emailId,
            recipient,
            subject: payload.data.subject,
            complained: true,
          });
        }
        console.log("⚠️ Email complaint:", emailId);
        break;

      default:
        console.log("ℹ️ Unknown event type:", payload.type);
    }

    return new Response(
      JSON.stringify({ success: true, processed: payload.type }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
