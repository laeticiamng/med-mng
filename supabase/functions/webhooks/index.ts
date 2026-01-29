/**
 * 🔗 WEBHOOKS - Routeur Edge Function pour tous les webhooks externes
 * 
 * Regroupe les fonctions :
 * - stripe-webhook → action: "stripe"
 * - shopify-webhook → action: "shopify"
 * - resend-webhook → action: "resend"
 * - google-sheets-webhook → action: "google_sheets"
 * - auth-webhook → action: "auth"
 * - suno-callback → action: "suno" (redirected from ai-audio)
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const webhookType = pathParts[pathParts.length - 1] || 'unknown';

  console.log(`🔗 WEBHOOKS [${webhookType}] received`);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Route based on path or action
    const body = await req.text();
    let parsedBody: any = {};
    try {
      parsedBody = JSON.parse(body);
    } catch {
      // Keep raw body for signature verification
    }

    const action = parsedBody.action || webhookType;

    switch (action) {
      case 'stripe':
        return await handleStripeWebhook(req, body, supabase);
      
      case 'shopify':
        return await handleShopifyWebhook(req, body, supabase);
      
      case 'resend':
        return await handleResendWebhook(parsedBody, supabase);
      
      case 'google_sheets':
        return await handleGoogleSheetsWebhook(parsedBody, supabase);
      
      case 'auth':
        return await handleAuthWebhook(parsedBody, supabase);
      
      case 'suno':
        return await handleSunoCallback(parsedBody, supabase);
      
      default:
        // Log unknown webhooks for debugging
        try {
          await supabase.from('webhook_logs').insert({
            webhook_type: action,
            payload: parsedBody,
            received_at: new Date().toISOString()
          });
        } catch (e) {
          console.log('Webhook log skipped:', e.message);
        }

        return new Response(JSON.stringify({ 
          received: true, 
          type: action 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ WEBHOOKS Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ============================================================================
// STRIPE WEBHOOK
// ============================================================================

async function handleStripeWebhook(req: Request, body: string, supabase: any) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // In production, verify signature using Stripe library
  // For now, parse the event directly
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`📦 Stripe event: ${event.type}`);

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await supabase.from('subscriptions').upsert({
        user_id: session.client_reference_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      break;
    }
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabase.from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      await supabase.from('invoices').insert({
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: 'paid',
        created_at: new Date().toISOString()
      }).catch(() => {});
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // Update subscription status
      await supabase.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer);
      break;
    }
  }

  // Log the event
  await supabase.from('stripe_events').insert({
    event_id: event.id,
    event_type: event.type,
    data: event.data,
    processed_at: new Date().toISOString()
  }).catch(() => {});

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// SHOPIFY WEBHOOK
// ============================================================================

async function handleShopifyWebhook(req: Request, body: string, supabase: any) {
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const topic = req.headers.get('x-shopify-topic');

  console.log(`🛒 Shopify webhook: ${topic}`);

  let data: any;
  try {
    data = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Handle different topics
  switch (topic) {
    case 'orders/create':
    case 'orders/updated':
      await supabase.from('shopify_orders').upsert({
        shopify_order_id: data.id.toString(),
        email: data.email,
        total_price: data.total_price,
        currency: data.currency,
        status: data.financial_status,
        data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'shopify_order_id' });
      break;
    
    case 'customers/create':
    case 'customers/update':
      await supabase.from('shopify_customers').upsert({
        shopify_customer_id: data.id.toString(),
        email: data.email,
        data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'shopify_customer_id' });
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// RESEND WEBHOOK
// ============================================================================

async function handleResendWebhook(data: any, supabase: any) {
  const { type, data: eventData } = data;

  console.log(`📧 Resend webhook: ${type}`);

  await supabase.from('email_events').insert({
    event_type: type,
    email_id: eventData?.email_id,
    recipient: eventData?.to?.[0],
    data: eventData,
    created_at: new Date().toISOString()
  }).catch(() => {});

  // Update email status in our records
  if (eventData?.email_id) {
    const statusMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked'
    };

    if (statusMap[type]) {
      await supabase.from('sent_emails')
        .update({ status: statusMap[type] })
        .eq('resend_id', eventData.email_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// GOOGLE SHEETS WEBHOOK
// ============================================================================

async function handleGoogleSheetsWebhook(data: any, supabase: any) {
  console.log('📊 Google Sheets webhook received');

  const { spreadsheet_id, sheet_name, range, values } = data;

  // Log the webhook
  await supabase.from('sheets_webhooks').insert({
    spreadsheet_id,
    sheet_name,
    range,
    values,
    received_at: new Date().toISOString()
  }).catch(() => {});

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// AUTH WEBHOOK
// ============================================================================

async function handleAuthWebhook(data: any, supabase: any) {
  const { type, record, old_record } = data;

  console.log(`🔐 Auth webhook: ${type}`);

  switch (type) {
    case 'INSERT':
      // New user registered
      if (record?.id) {
        // Create profile
        await supabase.from('profiles').insert({
          id: record.id,
          email: record.email,
          created_at: new Date().toISOString()
        }).catch(() => {});

        // Send welcome email
        await supabase.functions.invoke('send-welcome-email', {
          body: { user_id: record.id, email: record.email }
        }).catch(() => {});
      }
      break;
    
    case 'UPDATE':
      // User updated (email change, etc.)
      if (record?.id) {
        await supabase.from('profiles')
          .update({ email: record.email, updated_at: new Date().toISOString() })
          .eq('id', record.id);
      }
      break;
    
    case 'DELETE':
      // User deleted - handled by cascade usually
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// SUNO CALLBACK (from AI-AUDIO)
// ============================================================================

async function handleSunoCallback(data: any, supabase: any) {
  console.log('🎵 Suno callback received:', JSON.stringify(data, null, 2));

  if (data.code === 200 && data.data) {
    const { callbackType, data: tracks, task_id } = data.data;

    if ((callbackType === 'complete' || callbackType === 'first') && tracks?.length > 0) {
      const trackWithAudio = tracks.find((t: any) => t.audio_url || t.source_audio_url);

      if (trackWithAudio && task_id) {
        await supabase.from('generated_music_tracks').update({
          audio_url: trackWithAudio.audio_url || trackWithAudio.source_audio_url,
          stream_url: trackWithAudio.stream_audio_url,
          image_url: trackWithAudio.image_url,
          duration: trackWithAudio.duration,
          generation_status: 'completed',
          updated_at: new Date().toISOString()
        }).eq('task_id', task_id);

        console.log(`✅ Track ${task_id} updated with audio`);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
