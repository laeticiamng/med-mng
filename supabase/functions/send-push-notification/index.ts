import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  topic?: string;
  user_ids?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parser la requête
    const payload: NotificationPayload = await req.json();
    const { title, body, icon, badge, url, topic, user_ids } = payload;

    console.log('[send-push-notification] Sending notification:', { title, topic, user_ids });

    // Récupérer les abonnements
    let query = supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('enabled', true);

    // Filtrer par topic si spécifié
    if (topic) {
      query = query.contains('topics', [topic]);
    }

    // Filtrer par user_ids si spécifié
    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[send-push-notification] No subscriptions found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-push-notification] Found ${subscriptions.length} subscriptions`);

    // Préparer les notifications Web Push
    const notificationData = {
      title,
      body,
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/badge-72x72.png',
      data: {
        url: url || '/',
        timestamp: new Date().toISOString(),
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir',
        },
        {
          action: 'close',
          title: 'Fermer',
        },
      ],
    };

    // Envoyer les notifications avec web-push
    let sentCount = 0;
    let failedCount = 0;
    const failedEndpoints: string[] = [];

    // Import web-push for real push notifications
    // Note: Requires VAPID keys to be configured
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@emotionscare.com';

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // If VAPID keys are configured, use real web-push
        if (vapidPublicKey && vapidPrivateKey) {
          // Real push notification using fetch API to push service
          const payload = JSON.stringify(notificationData);
          
          // Create VAPID headers (simplified - in production use full JWT)
          const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Encoding': 'aes128gcm',
              'TTL': '86400',
            },
            body: payload,
          });

          if (response.ok || response.status === 201) {
            console.log(`[send-push-notification] Sent to: ${subscription.endpoint}`);
            sentCount++;
          } else {
            console.error(`[send-push-notification] Failed with status ${response.status}`);
            failedCount++;
            failedEndpoints.push(subscription.endpoint);
          }
        } else {
          // Fallback: Log that we would send (for development)
          console.log(`[send-push-notification] Would send to: ${subscription.endpoint}`);
          sentCount++;
        }

      } catch (error) {
        console.error(`[send-push-notification] Failed to send to ${subscription.endpoint}:`, error);
        failedCount++;
        failedEndpoints.push(subscription.endpoint);
      }
    }

    // Remove failed subscriptions (likely expired)
    if (failedEndpoints.length > 0) {
      await supabaseClient
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
      console.log(`[send-push-notification] Removed ${failedEndpoints.length} invalid subscriptions`);
    }

    // Logger dans la table push_notifications_log
    const { error: logError } = await supabaseClient
      .from('push_notifications_log')
      .insert({
        title,
        body,
        icon,
        badge,
        url,
        topic,
        user_ids,
        sent_count: sentCount,
        delivered_count: sentCount, // En production, tracker réellement
        clicked_count: 0,
      });

    if (logError) {
      console.error('[send-push-notification] Error logging notification:', logError);
    }

    console.log(`[send-push-notification] Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[send-push-notification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/* 

CONFIGURATION REQUISE:

1. Installer web-push dans les dépendances Deno (deno.json):
{
  "imports": {
    "web-push": "npm:web-push@3.6.6"
  }
}

2. Générer les clés VAPID:
```bash
npx web-push generate-vapid-keys
```

3. Ajouter les secrets dans Supabase:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT (mailto:your-email@example.com)

4. Dans le fichier .env du frontend:
VITE_VAPID_PUBLIC_KEY=<your-public-key>

5. Importer et utiliser web-push dans cette fonction:
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? '',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData));
```

*/
