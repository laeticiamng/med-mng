import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopifySecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!shopifySecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify Shopify webhook signature
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const topic = req.headers.get("x-shopify-topic");
    const body = await req.text();

    if (hmacHeader) {
      const hash = createHmac("sha256", shopifySecret)
        .update(body, "utf8")
        .digest("base64");

      if (hash !== hmacHeader) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const data = JSON.parse(body);
    console.log(`Processing Shopify webhook: ${topic}`, data);

    // Map Shopify products to MedMNG modules
    const productModuleMap: Record<string, string> = {
      "lampe-de-lecture-clip-led": "focus",
      "lampe-de-bureau-premium-led": "focus",
      "anneau-lumineux-neewer": "productivity",
      "lampe-chargeur-sans-fil": "focus",
      "agenda-semainier-premium": "productivity",
      "planner-productivity-trimestriel": "productivity",
      "boite-coffre-telephone": "focus",
      "tapis-de-meditation": "wellness",
      "bracelet-connecte-bien-etre": "wellness",
      "casque-antibruit-premium": "focus",
      "diffuseur-huiles-essentielles": "wellness",
      "mug-etudiant-medecine": "merchandise",
      "sweat-shirt-med-student": "merchandise",
      "carnet-mednotes": "productivity",
      "kit-audio-ia-focus": "focus",
      "affiche-decorative-medecine": "merchandise",
      "oreiller-ergonomique": "wellness",
      "boite-musique-relaxante": "wellness",
      "bracelet-ancrage-pierre": "wellness",
      "carte-cadeau-medmng": "gift",
    };

    switch (topic) {
      case "orders/create":
      case "orders/paid": {
        const order = data;
        const customerEmail = order.email || order.customer?.email;
        const lineItems = order.line_items || [];

        console.log(`Processing order ${order.id} for ${customerEmail}`);

        // Find user by email
        const { data: authData } = await supabase.auth.admin.listUsers();
        const user = authData?.users?.find((u) => u.email === customerEmail);

        if (!user) {
          console.log(`User not found for email: ${customerEmail}`);
          // Store order for later activation when user signs up
          await supabase.from("pending_activations").insert({
            email: customerEmail,
            order_id: order.id.toString(),
            order_data: order,
            status: "pending",
          });
          break;
        }

        // Activate modules based on purchased products
        const modulesToActivate = new Set<string>();
        for (const item of lineItems) {
          const productHandle = item.sku?.toLowerCase() || item.product_id?.toString();
          const module = productModuleMap[productHandle];
          if (module) {
            modulesToActivate.add(module);
          }
        }

        console.log(`Activating modules for user ${user.id}:`, Array.from(modulesToActivate));

        // Activate each module
        for (const module of modulesToActivate) {
          await supabase.from("user_modules").upsert({
            user_id: user.id,
            module_name: module,
            is_active: true,
            activated_at: new Date().toISOString(),
            activation_source: "shopify_order",
            order_id: order.id.toString(),
          }, {
            onConflict: "user_id,module_name",
          });
        }

        // Log the purchase
        await supabase.from("purchase_history").insert({
          user_id: user.id,
          order_id: order.id.toString(),
          total_amount: parseFloat(order.total_price || "0"),
          currency: order.currency || "EUR",
          status: "completed",
          modules_activated: Array.from(modulesToActivate),
          order_data: order,
        });

        console.log(`Successfully activated modules for order ${order.id}`);
        break;
      }

      case "orders/cancelled": {
        const order = data;
        console.log(`Order cancelled: ${order.id}`);
        
        // Update purchase history
        await supabase
          .from("purchase_history")
          .update({ status: "cancelled" })
          .eq("order_id", order.id.toString());
        
        break;
      }

      case "orders/fulfilled": {
        const order = data;
        console.log(`Order fulfilled: ${order.id}`);
        
        // Update purchase history
        await supabase
          .from("purchase_history")
          .update({ status: "fulfilled" })
          .eq("order_id", order.id.toString());
        
        break;
      }

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
