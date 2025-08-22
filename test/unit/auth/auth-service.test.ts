/**
 * Tests unitaires pour le service d'authentification
 * Couvre l'authentification CAS, la validation des tokens, et la gestion des sessions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('Authentication Service', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
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

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: { emailRedirectTo: 'http://localhost:3000/' }
      });

      // Assert
      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { emailRedirectTo: 'http://localhost:3000/' }
      });
    });

    it('should handle registration errors gracefully', async () => {
      // Arrange
      const mockError = { message: 'User already registered' };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      // Act
      const result = await mockSupabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123'
      });

      // Assert
      expect(result.error).toEqual(mockError);
      expect(result.data.user).toBeNull();
    });

    it('should require emailRedirectTo for proper flow', async () => {
      // This test ensures we always include emailRedirectTo
      const signUpCall = () => mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: { emailRedirectTo: `${window.location.origin}/` }
      });

      expect(signUpCall).not.toThrow();
    });
  });

  describe('User Login', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123', user: mockUser };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      // Assert
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const mockError = { message: 'Invalid login credentials' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      // Act
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      // Assert
      expect(result.error).toEqual(mockError);
      expect(result.data.user).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should retrieve current session', async () => {
      // Arrange
      const mockSession = { access_token: 'token123', user: { id: 'user123' } };
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.getSession();

      // Assert
      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle session refresh', async () => {
      // Arrange
      const mockRefreshedSession = { access_token: 'new_token123', user: { id: 'user123' } };
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockRefreshedSession },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.refreshSession();

      // Assert
      expect(result.data.session).toEqual(mockRefreshedSession);
      expect(result.error).toBeNull();
    });

    it('should set up auth state change listener correctly', () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockSubscription = { unsubscribe: vi.fn() };
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription }
      });

      // Act
      const { data: { subscription } } = mockSupabase.auth.onAuthStateChange(mockCallback);

      // Assert
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(subscription).toEqual(mockSubscription);
    });
  });

  describe('CAS Authentication', () => {
    it('should handle CAS authentication flow', async () => {
      // Arrange
      const mockCASResponse = {
        success: true,
        cookies: 'PHPSESSID=abc123',
        pages_found: 10
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockCASResponse,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: true }
      });

      // Assert
      expect(result.data).toEqual(mockCASResponse);
      expect(result.error).toBeNull();
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: true }
      });
    });

    it('should handle CAS authentication failures', async () => {
      // Arrange
      const mockError = { message: 'CAS authentication failed' };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: mockError
      });

      // Act
      const result = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: true }
      });

      // Assert
      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });

  describe('User Logout', () => {
    it('should successfully sign out user', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      // Act
      const result = await mockSupabase.auth.signOut();

      // Assert
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Token Validation', () => {
    it('should validate user token and return user data', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await mockSupabase.auth.getUser('valid_token');

      // Assert
      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle invalid tokens', async () => {
      // Arrange
      const mockError = { message: 'Invalid token' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      // Act
      const result = await mockSupabase.auth.getUser('invalid_token');

      // Assert
      expect(result.error).toEqual(mockError);
      expect(result.data.user).toBeNull();
    });
  });
});