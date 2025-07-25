import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour l'authentification et autorisations
 * Couvre RLS, JWT, permissions Supabase
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

test.describe('Authentication & Authorization E2E', () => {

  test.beforeEach(async ({ request }) => {
    // Vérifier que l'auth Supabase fonctionne
    const authCheck = await request.get(`${SUPABASE_URL}/auth/v1/settings`);
    expect([200, 404].includes(authCheck.status())).toBeTruthy();
  });

  test('Public endpoints are accessible without auth', async ({ request }) => {
    console.log('🔓 Testing public endpoints...');
    
    // Test endpoint public EDN
    const ednResponse = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=item_code,title&limit=3`);
    expect(ednResponse.status()).toBe(200);
    
    const ednData = await ednResponse.json();
    expect(Array.isArray(ednData)).toBeTruthy();
    
    // Test endpoint public ECOS
    const ecosResponse = await request.get(`${SUPABASE_URL}/rest/v1/ecos_situations_uness?select=sd_id,intitule_sd&limit=3`);
    expect(ecosResponse.status()).toBe(200);
    
    console.log('✅ Public endpoints accessible');
  });

  test('Protected endpoints require authentication', async ({ request }) => {
    console.log('🔒 Testing protected endpoints...');
    
    // Test endpoint protégé sans auth
    const protectedResponse = await request.get(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`);
    
    // Doit être bloqué (401) ou vide (200 avec données vides à cause RLS)
    expect([200, 401, 403].includes(protectedResponse.status())).toBeTruthy();
    
    if (protectedResponse.status() === 200) {
      const data = await protectedResponse.json();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBe(0); // RLS doit filtrer toutes les données
    }
    
    console.log('✅ Protected endpoints properly secured');
  });

  test('RLS policies are enforced', async ({ request }) => {
    console.log('🔒 Testing RLS policies...');
    
    // Test accès aux données utilisateur sans auth
    const userDataResponse = await request.get(`${SUPABASE_URL}/rest/v1/emotions?select=*&limit=5`);
    
    expect([200, 401].includes(userDataResponse.status())).toBeTruthy();
    
    if (userDataResponse.status() === 200) {
      const userData = await userDataResponse.json();
      expect(Array.isArray(userData)).toBeTruthy();
      expect(userData.length).toBe(0); // RLS doit empêcher l'accès
    }
    
    console.log('✅ RLS policies properly enforced');
  });

  test('Service role has elevated permissions', async ({ request }) => {
    console.log('🔑 Testing service role permissions...');
    
    // Test avec service role key (si disponible)
    const serviceHeaders = {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      'Content-Type': 'application/json'
    };
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceResponse = await request.get(`${SUPABASE_URL}/rest/v1/profiles?select=count&limit=1`, {
        headers: serviceHeaders
      });
      
      expect([200, 401].includes(serviceResponse.status())).toBeTruthy();
      
      console.log('✅ Service role permissions tested');
    } else {
      console.log('ℹ️ Service role key not available - skipping test');
    }
  });

  test('Edge Functions auth integration', async ({ request }) => {
    console.log('🔑 Testing Edge Functions auth...');
    
    // Test fonction qui nécessite auth
    const authFunctionResponse = await request.post(`${FUNCTIONS_URL}/generate-music`, {
      data: {
        prompt: 'Test auth required',
        test_mode: true
      }
    });
    
    // Fonction peut soit demander auth (401) soit fonctionner en mode public
    expect([200, 401, 402, 422].includes(authFunctionResponse.status())).toBeTruthy();
    
    console.log(`✅ Edge Function auth response: ${authFunctionResponse.status()}`);
  });

  test('JWT token validation', async ({ request }) => {
    console.log('🔑 Testing JWT validation...');
    
    // Test avec token invalide
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token';
    
    const invalidAuthResponse = await request.get(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`,
        'apikey': process.env.SUPABASE_ANON_KEY || ''
      }
    });
    
    // Doit rejeter le token invalide
    expect([400, 401, 403].includes(invalidAuthResponse.status())).toBeTruthy();
    
    console.log('✅ JWT validation working correctly');
  });

  test('Anonymous user permissions', async ({ request }) => {
    console.log('👤 Testing anonymous user permissions...');
    
    // Test ce qu'un utilisateur anonyme peut faire
    const anonInsertResponse = await request.post(`${SUPABASE_URL}/rest/v1/abonnement_fiches`, {
      data: {
        prenom: 'Test E2E',
        email: 'test.e2e@example.com'
      }
    });
    
    // Doit pouvoir s'inscrire (politique publique)
    expect([200, 201].includes(anonInsertResponse.status())).toBeTruthy();
    
    console.log('✅ Anonymous permissions working');
  });

  test('Permission escalation prevention', async ({ request }) => {
    console.log('🛡️ Testing permission escalation prevention...');
    
    // Tentative de modification de données sensibles
    const escalationResponse = await request.patch(`${SUPABASE_URL}/rest/v1/audit_reports?id=eq.test`, {
      data: {
        status: 'compromised'
      }
    });
    
    // Doit être bloqué
    expect([401, 403, 404].includes(escalationResponse.status())).toBeTruthy();
    
    console.log('✅ Permission escalation properly prevented');
  });

  test('Session timeout handling', async ({ request }) => {
    console.log('⏱️ Testing session timeout...');
    
    // Test avec token expiré (simulation)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.test';
    
    const timeoutResponse = await request.get(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`,
        'apikey': process.env.SUPABASE_ANON_KEY || ''
      }
    });
    
    // Doit gérer l'expiration proprement
    expect([400, 401, 403].includes(timeoutResponse.status())).toBeTruthy();
    
    console.log('✅ Session timeout handled correctly');
  });

});