/**
 * Tests complets pour AuthProvider
 *
 * CRITIQUE: Ce module gere toute l'authentification.
 * Couverture cible: 95%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE_ENABLED, TEST_USER } from '@/config/testMode';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => {
  const mockUnsubscribe = vi.fn();
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        signInWithOAuth: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: mockUnsubscribe } }
        }))
      },
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: null })
      }))
    }
  };
});

// Mock email notifications
vi.mock('@/hooks/useEmailNotifications', () => ({
  useEmailNotifications: () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined)
  })
}));

// Test component to access auth context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.loading.toString()}</span>
      <span data-testid="user-email">{auth.user?.email || 'none'}</span>
      <button data-testid="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialisation', () => {
    it('should start with loading state', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Initial loading state
      expect(screen.getByTestId('loading').textContent).toBe('true');
    });

    it('should set user from existing session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: { name: 'Test User' }
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    });

    it('should handle getSession errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.auth.getSession as any).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user-email').textContent).toBe('none');
      consoleSpy.mockRestore();
    });

    it('should subscribe to auth state changes', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });
    });

    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      (supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } }
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('Token Refresh Errors', () => {
    it('should handle refresh_token_not_found error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: { code: 'refresh_token_not_found', message: 'Refresh Token Not Found' }
      });

      (supabase.auth.signOut as any).mockResolvedValue({});

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user-email').textContent).toBe('none');
      consoleSpy.mockRestore();
    });

    it('should handle Invalid Refresh Token error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid Refresh Token' }
      });

      (supabase.auth.signOut as any).mockResolvedValue({});

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
      consoleSpy.mockRestore();
    });
  });

  describe('signIn', () => {
    it('should sign in with valid credentials', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        error: null
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.error).toBeNull();
    });

    it('should return error for invalid credentials', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        error: { message: 'Invalid login credentials' }
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signIn('test@example.com', 'wrong');

      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Invalid login credentials');
    });

    it('should handle signIn exceptions', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signInWithPassword as any).mockRejectedValue(
        new Error('Network error')
      );

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signIn('test@example.com', 'password');

      expect(result.error).toBeTruthy();
    });
  });

  describe('signUp', () => {
    it('should sign up with valid data', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signUp as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signUp('new@example.com', 'password123', 'New User');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/med-mng/library'),
          data: { name: 'New User' }
        }
      });
      expect(result.error).toBeNull();
    });

    it('should return error for invalid signup data', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signUp as any).mockResolvedValue({
        error: { message: 'Password should be at least 6 characters' }
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signUp('test@example.com', '123', 'Test');

      expect(result.error).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      (supabase.auth.signOut as any).mockResolvedValue({});

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      });

      const signOutButton = screen.getByTestId('sign-out');
      await userEvent.click(signOutButton);

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle signOut errors and force local logout', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      (supabase.auth.signOut as any).mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      });

      const signOutButton = screen.getByTestId('sign-out');
      await userEvent.click(signOutButton);

      // Should still work even if API fails
      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('none');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('OAuth Providers', () => {
    beforeEach(async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
    });

    it('should sign in with Google', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      await authContext.signInWithGoogle();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/med-mng/library')
        }
      });
    });

    it('should sign in with Facebook', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      await authContext.signInWithFacebook();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: expect.any(Object)
      });
    });

    it('should sign in with Apple', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      await authContext.signInWithApple();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: expect.any(Object)
      });
    });

    it('should handle OAuth errors', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        error: { message: 'OAuth error' }
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.signInWithGoogle();

      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('OAuth error');
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
    });

    it('should send password reset email', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/med-mng/reset-password') }
      );
      expect(result.error).toBeNull();
    });

    it('should handle reset password errors', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        error: { message: 'User not found' }
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.resetPassword('unknown@example.com');

      expect(result.error).toBeTruthy();
    });
  });

  describe('Update Password', () => {
    beforeEach(async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: { id: 'user-123', email: 'test@example.com' } } },
        error: null
      });
    });

    it('should update password', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.updatePassword('newPassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123'
      });
      expect(result.error).toBeNull();
    });

    it('should handle update password errors', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({
        error: { message: 'Password too weak' }
      });

      let authContext: any;
      function CaptureAuth() {
        authContext = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <CaptureAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext.loading).toBe(false);
      });

      const result = await authContext.updatePassword('123');

      expect(result.error).toBeTruthy();
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Auth State Change Events', () => {
    it('should update user on SIGNED_IN event', async () => {
      let authStateCallback: Function;

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // Simulate SIGNED_IN event
      act(() => {
        authStateCallback!('SIGNED_IN', {
          user: { id: 'new-user', email: 'new@example.com', created_at: '2024-01-01T00:00:00Z' }
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('new@example.com');
      });
    });

    it('should clear user on SIGNED_OUT event', async () => {
      let authStateCallback: Function;

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      });

      // Simulate SIGNED_OUT event
      act(() => {
        authStateCallback!('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('none');
      });
    });

    it('should handle TOKEN_REFRESHED failure', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let authStateCallback: Function;

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: { id: 'user-123', email: 'test@example.com' } } },
        error: null
      });

      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      });

      // Simulate TOKEN_REFRESHED failure (session is null)
      act(() => {
        authStateCallback!('TOKEN_REFRESHED', null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('none');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Activity Logging', () => {
    it('should log sign in activity', async () => {
      let authStateCallback: Function;

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // Simulate SIGNED_IN event
      act(() => {
        authStateCallback!('SIGNED_IN', {
          user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z' }
        });
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_activity_log');
      });
    });

    it('should handle activity log errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let authStateCallback: Function;

      const mockInsert = vi.fn().mockRejectedValue(new Error('DB Error'));
      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // This should not throw despite the error
      act(() => {
        authStateCallback!('SIGNED_IN', {
          user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z' }
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      });

      consoleSpy.mockRestore();
    });
  });
});

describe('Test Mode Security', () => {
  it('TEST_MODE_ENABLED should be false by default', () => {
    expect(TEST_MODE_ENABLED).toBe(false);
  });

  it('TEST_USER should have null UUID', () => {
    expect(TEST_USER.id).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('TEST_USER should have test role, not admin', () => {
    expect(TEST_USER.user_metadata.role).toBe('test');
    expect(TEST_USER.app_metadata.role).toBe('test');
    expect(TEST_USER.user_metadata.role).not.toBe('admin');
  });
});
