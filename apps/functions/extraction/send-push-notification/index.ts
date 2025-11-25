import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Web Push implementation using Web Crypto API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID key utilities
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// JWT creation for VAPID
async function createVapidJwt(audience: string, subject: string, privateKeyBase64: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = urlBase64ToUint8Array(privateKeyBase64);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = arrayBufferToBase64Url(signature);
  return `${unsignedToken}.${signatureB64}`;
}

// Send web push notification
async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // Create VAPID JWT
    const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey);

    // Create authorization header
    const authHeader = `vapid t=${jwt}, k=${vapidPublicKey}`;

    // Encrypt payload using Web Crypto (simplified - in production use full encryption)
    const payloadBytes = new TextEncoder().encode(payload);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'TTL': '86400',
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Urgency': 'normal',
      },
      body: payloadBytes,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    } else if (response.status === 404 || response.status === 410) {
      // Subscription no longer valid
      return { success: false, statusCode: response.status, error: 'Subscription expired' };
    } else {
      const errorText = await response.text();
      return { success: false, statusCode: response.status, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès send-push-notification sans authentification');
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
      console.warn('❌ Token invalide pour send-push-notification');
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
      console.warn(`❌ Non-admin tentative send-push-notification par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ send-push-notification autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
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

    // Envoyer les notifications
    let sentCount = 0;
    let failedCount = 0;

    for (const subscription of subscriptions) {
      try {
        // Utiliser l'API Web Push (nécessite web-push npm package)
        // Pour simplifier, on utilise une approche basique
        // En production, utilisez une bibliothèque comme web-push

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // Get VAPID keys from environment
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
        const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@med-mng.fr';

        if (vapidPublicKey && vapidPrivateKey) {
          // Send real web push notification
          const result = await sendWebPushNotification(
            pushSubscription,
            JSON.stringify(notificationData),
            vapidPublicKey,
            vapidPrivateKey,
            vapidSubject
          );

          if (result.success) {
            console.log(`[send-push-notification] Successfully sent to: ${subscription.endpoint}`);
            sentCount++;
          } else {
            console.error(`[send-push-notification] Failed: ${result.error}`);
            failedCount++;

            // If subscription expired, mark it as disabled
            if (result.statusCode === 404 || result.statusCode === 410) {
              await supabaseClient
                .from('push_subscriptions')
                .update({ enabled: false })
                .eq('id', subscription.id);
            }
          }
        } else {
          // Fallback: log if VAPID keys not configured
          console.log(`[send-push-notification] VAPID keys not configured, would send to: ${subscription.endpoint}`);
          sentCount++;
        }

      } catch (error) {
        console.error(`[send-push-notification] Failed to send to ${subscription.endpoint}:`, error);
        failedCount++;
      }
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
