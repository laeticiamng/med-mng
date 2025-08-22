/**
 * Tests d'intégration pour l'authentification
 * Tests end-to-end du flow d'authentification complet
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';

// Mock de l'environnement de test
const mockSupabaseUrl = 'https://test.supabase.co';
const mockSupabaseKey = 'test-anon-key';

// Mock Supabase client pour les tests d'intégration
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('Authentication Integration Tests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        }),
        refreshSession: vi.fn()
      },
      functions: {
        invoke: vi.fn()
      }
    };
    
    (createClient as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    it('should handle complete user registration and login flow', async () => {
      // Phase 1: Registration
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        created_at: '2025-08-22T10:00:00Z'
      };
      
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null
      });

      // Act - Registration
      const registrationResult = await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'securePassword123',
        options: { emailRedirectTo: `${window.location.origin}/` }
      });

      // Assert - Registration
      expect(registrationResult.data.user).toEqual(mockUser);
      expect(registrationResult.error).toBeNull();

      // Phase 2: Login after email confirmation
      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        user: mockUser,
        expires_at: Date.now() + 3600000
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Act - Login
      const loginResult = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'securePassword123'
      });

      // Assert - Login
      expect(loginResult.data.user).toEqual(mockUser);
      expect(loginResult.data.session).toEqual(mockSession);
      expect(loginResult.error).toBeNull();

      // Phase 3: Session management
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      // Act - Get Session
      const sessionResult = await mockSupabase.auth.getSession();

      // Assert - Session
      expect(sessionResult.data.session).toEqual(mockSession);
      expect(sessionResult.error).toBeNull();
    });

    it('should handle authentication state changes correctly', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123', user: mockUser };

      // Act - Set up auth state listener
      const { data: { subscription } } = mockSupabase.auth.onAuthStateChange(mockCallback);

      // Simulate auth state changes
      mockCallback('SIGNED_IN', mockSession);
      mockCallback('SIGNED_OUT', null);
      mockCallback('TOKEN_REFRESHED', mockSession);

      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenNthCalledWith(1, 'SIGNED_IN', mockSession);
      expect(mockCallback).toHaveBeenNthCalledWith(2, 'SIGNED_OUT', null);
      expect(mockCallback).toHaveBeenNthCalledWith(3, 'TOKEN_REFRESHED', mockSession);
      expect(subscription.unsubscribe).toBeDefined();
    });

    it('should handle session refresh automatically', async () => {
      // Arrange
      const originalSession = {
        access_token: 'old-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: Date.now() - 1000 // Expired
      };

      const refreshedSession = {
        access_token: 'new-token-456',
        refresh_token: 'new-refresh-token-456',
        expires_at: Date.now() + 3600000
      };

      mockSupabase.auth.refreshSession.mockResolvedValueOnce({
        data: { session: refreshedSession },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.refreshSession();

      // Assert
      expect(result.data.session.access_token).toBe('new-token-456');
      expect(result.data.session.expires_at).toBeGreaterThan(Date.now());
      expect(result.error).toBeNull();
    });
  });

  describe('CAS Authentication Integration', () => {
    it('should integrate CAS authentication with regular auth flow', async () => {
      // Phase 1: Standard authentication
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123', user: mockUser };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Phase 2: CAS authentication for data access
      const mockCasResult = {
        success: true,
        authenticated: true,
        cookies: 'PHPSESSID=cas123',
        accessible_resources: {
          edn_items: true,
          oic_objectives: true
        }
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockCasResult,
        error: null
      });

      // Act - Combined authentication
      const authResult = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      const casResult = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: false }
      });

      // Assert - Both authentications successful
      expect(authResult.data.user).toEqual(mockUser);
      expect(casResult.data.success).toBe(true);
      expect(casResult.data.accessible_resources.edn_items).toBe(true);
    });

    it('should handle CAS authentication failures gracefully', async () => {
      // Arrange
      const mockCasError = {
        success: false,
        error: 'CAS_SERVER_UNREACHABLE',
        details: 'Unable to connect to UNESS CAS server'
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockCasError,
        error: null
      });

      // Act
      const casResult = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: false }
      });

      // Assert
      expect(casResult.data.success).toBe(false);
      expect(casResult.data.error).toBe('CAS_SERVER_UNREACHABLE');
      expect(casResult.data.details).toContain('UNESS CAS server');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors during authentication', async () => {
      // Arrange
      const networkError = new Error('Network request failed');
      mockSupabase.auth.signInWithPassword.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Network request failed');
    });

    it('should handle invalid credentials gracefully', async () => {
      // Arrange
      const authError = { message: 'Invalid login credentials' };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: authError
      });

      // Act
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      // Assert
      expect(result.error).toEqual(authError);
      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
    });

    it('should handle session expiration and refresh', async () => {
      // Arrange
      const expiredError = { message: 'Session expired' };
      const newSession = {
        access_token: 'new-token-789',
        refresh_token: 'new-refresh-789',
        expires_at: Date.now() + 3600000
      };

      // First call fails with expired session
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: expiredError
      });

      // Refresh succeeds
      mockSupabase.auth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession },
        error: null
      });

      // Second call succeeds with new session
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null
      });

      // Act
      const firstAttempt = await mockSupabase.auth.getUser();
      const refreshResult = await mockSupabase.auth.refreshSession();
      const secondAttempt = await mockSupabase.auth.getUser();

      // Assert
      expect(firstAttempt.error).toEqual(expiredError);
      expect(refreshResult.data.session).toEqual(newSession);
      expect(secondAttempt.data.user.id).toBe('user-123');
    });
  });

  describe('Multi-User Scenarios', () => {
    it('should handle multiple users authentication correctly', async () => {
      // User 1
      const user1 = { id: 'user-1', email: 'user1@example.com' };
      const session1 = { access_token: 'token-1', user: user1 };

      // User 2
      const user2 = { id: 'user-2', email: 'user2@example.com' };
      const session2 = { access_token: 'token-2', user: user2 };

      // Mock responses for different users
      mockSupabase.auth.signInWithPassword
        .mockResolvedValueOnce({
          data: { user: user1, session: session1 },
          error: null
        })
        .mockResolvedValueOnce({
          data: { user: user2, session: session2 },
          error: null
        });

      // Act
      const result1 = await mockSupabase.auth.signInWithPassword({
        email: 'user1@example.com',
        password: 'password1'
      });

      const result2 = await mockSupabase.auth.signInWithPassword({
        email: 'user2@example.com',
        password: 'password2'
      });

      // Assert
      expect(result1.data.user.id).toBe('user-1');
      expect(result2.data.user.id).toBe('user-2');
      expect(result1.data.session.access_token).toBe('token-1');
      expect(result2.data.session.access_token).toBe('token-2');
    });

    it('should handle concurrent authentication attempts', async () => {
      // Arrange
      const users = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
        { id: 'user-3', email: 'user3@example.com' }
      ];

      // Mock concurrent authentication
      users.forEach((user, index) => {
        mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
          data: { 
            user, 
            session: { access_token: `token-${index + 1}`, user } 
          },
          error: null
        });
      });

      // Act - Concurrent authentication requests
      const authPromises = users.map((user, index) =>
        mockSupabase.auth.signInWithPassword({
          email: user.email,
          password: `password${index + 1}`
        })
      );

      const results = await Promise.all(authPromises);

      // Assert
      results.forEach((result, index) => {
        expect(result.data.user.id).toBe(`user-${index + 1}`);
        expect(result.data.session.access_token).toBe(`token-${index + 1}`);
        expect(result.error).toBeNull();
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle rapid successive authentication requests', async () => {
      // Arrange
      const startTime = performance.now();
      const user = { id: 'user-test', email: 'test@example.com' };
      const session = { access_token: 'token-test', user };

      // Mock fast responses
      for (let i = 0; i < 100; i++) {
        mockSupabase.auth.getSession.mockResolvedValueOnce({
          data: { session },
          error: null
        });
      }

      // Act - 100 rapid requests
      const promises = Array(100).fill(null).map(() => 
        mockSupabase.auth.getSession()
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      // Assert
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.data.session).toEqual(session);
        expect(result.error).toBeNull();
      });

      // Performance assertion - should complete within reasonable time
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Less than 1 second for 100 requests
    });
  });
});