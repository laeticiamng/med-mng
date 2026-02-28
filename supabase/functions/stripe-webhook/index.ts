import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is required but not configured");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Missing webhook secret");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan || session.metadata?.plan_id;
        
        if (!userId || !planId) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Create user subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          }, { onConflict: 'stripe_subscription_id' });

        if (error) {
          console.error("Error creating subscription:", error);
        } else {
          console.log(`Created subscription for user ${userId} with plan ${planId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        } else {
          console.log(`Updated subscription ${subscription.id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error("Error cancelling subscription:", error);
        } else {
          console.log(`Cancelled subscription ${subscription.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Store invoice record
          const { error } = await supabase
            .from('subscription_invoices')
            .insert({
              stripe_invoice_id: invoice.id,
              stripe_subscription_id: subscriptionId,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              invoice_url: invoice.hosted_invoice_url,
              created_at: new Date(invoice.created * 1000).toISOString(),
            });

          if (error) {
            console.error("Error storing invoice:", error);
          } else {
            console.log(`Stored invoice ${invoice.id} for subscription ${subscriptionId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status to past_due
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error("Error updating subscription to past_due:", error);
          } else {
            console.log(`Marked subscription ${subscriptionId} as past_due`);
          }

          // Store failed invoice
          await supabase
            .from('subscription_invoices')
            .insert({
              stripe_invoice_id: invoice.id,
              stripe_subscription_id: subscriptionId,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              invoice_url: invoice.hosted_invoice_url,
              created_at: new Date(invoice.created * 1000).toISOString(),
            });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});