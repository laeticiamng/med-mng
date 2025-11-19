/**
 * ========================================
 * Template de Edge Function Sécurisée
 * ========================================
 *
 * Ce template montre comment implémenter toutes les bonnes pratiques
 * de sécurité dans une Edge Function Med-MNG.
 *
 * Fonctionnalités incluses:
 * - ✅ Authentification JWT
 * - ✅ Vérification rôle admin (si nécessaire)
 * - ✅ Rate limiting
 * - ✅ Input validation (Zod)
 * - ✅ Security logging
 * - ✅ Error handling
 * - ✅ CORS headers
 *
 * @version 1.0
 * @date 2025-11-19
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Imports des modules de sécurité
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';
import { logSecurityEvent, checkSuspiciousActivity } from '../_shared/security-monitoring.ts';

// ========================================
// 1. VALIDATION DU SCHÉMA (Zod)
// ========================================

const RequestSchema = z.object({
  // Définir le schéma de votre requête
  prompt: z.string().min(1).max(1000),
  options: z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().int().min(100).max(4000).optional(),
  }).optional(),
});

type RequestBody = z.infer<typeof RequestSchema>;

// ========================================
// 2. HANDLER PRINCIPAL
// ========================================

serve(async (req: Request) => {
  // OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Créer le client Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // ========================================
    // 3. AUTHENTIFICATION JWT
    // ========================================

    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      // Logger l'accès non autorisé
      await logSecurityEvent(supabase, {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'high',
        endpoint: 'your-function-name',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        details: {
          reason: 'Missing Authorization header',
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérifier le JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      // Logger l'échec d'authentification
      await logSecurityEvent(supabase, {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'high',
        endpoint: 'your-function-name',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        details: {
          reason: 'Invalid or expired token',
          error: authError?.message,
        },
      });

      // Vérifier activité suspecte (multiples tentatives)
      await checkSuspiciousActivity(
        supabase,
        'anonymous',
        'your-function-name',
        5 // fenêtre de 5 minutes
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired token',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================
    // 4. VÉRIFICATION RÔLE ADMIN (si nécessaire)
    // ========================================
    // Décommentez cette section si votre fonction nécessite un admin

    /*
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');

    if (!isAdmin) {
      // Logger l'accès interdit
      await logSecurityEvent(supabase, {
        type: 'FORBIDDEN_ACCESS',
        severity: 'high',
        userId: user.id,
        endpoint: 'your-function-name',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        details: {
          reason: 'Admin role required',
          userEmail: user.email,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin role required',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    */

    // ========================================
    // 5. RATE LIMITING
    // ========================================

    const rateLimit = await checkRateLimit(
      supabase,
      user.id,
      'your-function-name',
      RATE_LIMITS.AI_CHAT // Choisir le bon rate limit
    );

    if (!rateLimit.allowed) {
      // Logger le dépassement de rate limit
      await logSecurityEvent(supabase, {
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        userId: user.id,
        endpoint: 'your-function-name',
        details: {
          limit: rateLimit.limit,
          current: rateLimit.remaining + 1,
          resetAt: rateLimit.resetAt,
          userEmail: user.email,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          message: `You can make ${rateLimit.limit} requests per hour. Try again later.`,
          resetAt: rateLimit.resetAt,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt || '',
            'Retry-After': Math.ceil((new Date(rateLimit.resetAt || '').getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // ========================================
    // 6. VALIDATION DES INPUTS (Zod)
    // ========================================

    let body: RequestBody;

    try {
      const rawBody = await req.json();
      body = RequestSchema.parse(rawBody);
    } catch (error) {
      // Logger la tentative avec input invalide
      await logSecurityEvent(supabase, {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        userId: user.id,
        endpoint: 'your-function-name',
        details: {
          reason: 'Invalid input',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid input',
          details: error instanceof z.ZodError ? error.errors : 'Validation failed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================
    // 7. LOGIQUE MÉTIER
    // ========================================

    // Logger l'usage de l'API (pour tracking des coûts)
    await logSecurityEvent(supabase, {
      type: 'API_KEY_USAGE',
      severity: 'low',
      userId: user.id,
      endpoint: 'your-function-name',
      details: {
        apiProvider: 'OpenAI', // ou autre
        model: 'gpt-4',
        estimatedCost: 0.03, // coût estimé
        promptLength: body.prompt.length,
        userEmail: user.email,
      },
    });

    // Votre logique métier ici
    // Exemple: appel à OpenAI, Suno, etc.
    const result = {
      data: 'Your processed data here',
      timestamp: new Date().toISOString(),
    };

    // ========================================
    // 8. RÉPONSE SUCCÈS
    // ========================================

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        rateLimit: {
          remaining: rateLimit.remaining - 1,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimit.resetAt || '',
        },
      }
    );

  } catch (error) {
    // ========================================
    // 9. GESTION D'ERREURS
    // ========================================

    console.error('Function error:', error);

    // Logger l'erreur
    await logSecurityEvent(supabase, {
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'high',
      endpoint: 'your-function-name',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    // NE PAS exposer les détails de l'erreur au client
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ========================================
// NOTES D'UTILISATION
// ========================================

/**
 * Pour utiliser ce template:
 *
 * 1. Copiez ce fichier vers votre nouvelle fonction
 * 2. Remplacez 'your-function-name' par le nom de votre fonction
 * 3. Définissez le RequestSchema selon vos besoins
 * 4. Implémentez votre logique métier dans la section 7
 * 5. Choisissez le bon RATE_LIMITS dans la section 5:
 *    - RATE_LIMITS.AI_CHAT pour GPT-4
 *    - RATE_LIMITS.IMAGE_GEN pour DALL-E
 *    - RATE_LIMITS.MUSIC_GEN pour Suno
 *    - RATE_LIMITS.EMAIL_SEND pour emails
 *    - etc.
 * 6. Décommentez la section 4 si admin requis
 * 7. Testez localement avec: supabase functions serve your-function-name
 * 8. Déployez avec: supabase functions deploy your-function-name
 *
 * Checklist de sécurité:
 * - [ ] Authentification JWT activée
 * - [ ] Rate limiting configuré
 * - [ ] Input validation avec Zod
 * - [ ] Security logging activé
 * - [ ] Error handling complet
 * - [ ] CORS headers configurés
 * - [ ] Pas de secrets hardcodés
 * - [ ] Tests écrits
 */
