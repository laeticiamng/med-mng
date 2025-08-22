/**
 * Tests unitaires pour la validation d'authentification
 * Vérifie la validation des variables d'environnement critiques
 */

import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { validateAuth } from "./auth.ts";

// Mock des variables d'environnement pour les tests
const originalEnv = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY')
};

function setTestEnv(url?: string, key?: string) {
  if (url !== undefined) {
    Deno.env.set('SUPABASE_URL', url);
  } else {
    Deno.env.delete('SUPABASE_URL');
  }
  
  if (key !== undefined) {
    Deno.env.set('SUPABASE_ANON_KEY', key);
  } else {
    Deno.env.delete('SUPABASE_ANON_KEY');
  }
}

function restoreEnv() {
  if (originalEnv.SUPABASE_URL) {
    Deno.env.set('SUPABASE_URL', originalEnv.SUPABASE_URL);
  }
  if (originalEnv.SUPABASE_ANON_KEY) {
    Deno.env.set('SUPABASE_ANON_KEY', originalEnv.SUPABASE_ANON_KEY);
  }
}

Deno.test("validateAuth - Should fail with missing SUPABASE_URL", async () => {
  // Arrange
  setTestEnv(undefined, "valid.jwt.token.with.enough.length.to.pass.basic.validation.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test");
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check error response structure
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'ENV_CONFIG_ERROR');
  assertEquals(errorResponse.message.includes('Missing SUPABASE_URL'), true);

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should fail with missing SUPABASE_ANON_KEY", async () => {
  // Arrange
  setTestEnv("https://valid-url.supabase.co", undefined);
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check error response structure
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'ENV_CONFIG_ERROR');
  assertEquals(errorResponse.message.includes('Missing SUPABASE_ANON_KEY'), true);

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should fail with invalid SUPABASE_URL format", async () => {
  // Arrange
  setTestEnv("not-a-valid-url", "valid.jwt.token.with.enough.length.to.pass.basic.validation.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test");
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check error response structure
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'ENV_CONFIG_ERROR');
  assertEquals(errorResponse.message.includes('Invalid SUPABASE_URL format'), true);

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should fail with invalid SUPABASE_ANON_KEY format", async () => {
  // Arrange
  setTestEnv("https://valid-url.supabase.co", "too-short"); // Key too short
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check error response structure
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'ENV_CONFIG_ERROR');
  assertEquals(errorResponse.message.includes('Invalid SUPABASE_ANON_KEY format'), true);

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should fail with missing Authorization header even with valid env", async () => {
  // Arrange
  setTestEnv(
    "https://valid-url.supabase.co", 
    "valid.jwt.token.with.enough.length.to.pass.basic.validation.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
  );
  
  const request = new Request("https://example.com"); // No auth header

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check error response structure
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'AUTH_REQUIRED');
  assertEquals(errorResponse.message, 'Authorization header required');

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should handle empty environment variables as missing", async () => {
  // Arrange
  setTestEnv("", ""); // Empty strings
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  // Check that empty strings are treated as missing
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'ENV_CONFIG_ERROR');
  assertEquals(errorResponse.message.includes('Missing SUPABASE_URL'), true);

  // Restore
  restoreEnv();
});

Deno.test("validateAuth - Should provide detailed error logging", async () => {
  // Arrange
  setTestEnv(undefined, undefined); // Both missing
  
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer test-token"
    }
  });

  // Capture console output
  const originalError = console.error;
  let loggedError = '';
  console.error = (message: string, ...args: any[]) => {
    loggedError = message + ' ' + args.join(' ');
  };

  // Act
  const result = await validateAuth(request);

  // Assert
  assertEquals(result.error !== null, true);
  assertEquals(loggedError.includes('🚨 Environment validation failed:'), true);
  assertEquals(loggedError.includes('Missing SUPABASE_URL'), true);

  // Restore
  console.error = originalError;
  restoreEnv();
});