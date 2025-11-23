import logger from '@/lib/logger';

/**
 * EmotionsCare SSO Integration
 * Handles Single Sign-On integration with EmotionsCare wellness platform
 */

/**
 * EmotionsCare error codes
 */
export type EmotionsCareErrorCode = 'NO_SESSION' | 'NO_ACCESS' | 'REDIRECT_FAILED';

/**
 * Custom error class for EmotionsCare operations
 */
export class EmotionsCareError extends Error {
  code: EmotionsCareErrorCode;

  constructor(message: string, code: EmotionsCareErrorCode) {
    super(message);
    this.name = 'EmotionsCareError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmotionsCareError);
    }
  }
}

/**
 * Configuration for EmotionsCare
 */
const EMOTIONSCARE_CONFIG = {
  // These would typically come from environment variables
  baseUrl: import.meta.env.VITE_EMOTIONSCARE_URL || 'https://emotionscare.example.com',
  clientId: import.meta.env.VITE_EMOTIONSCARE_CLIENT_ID || 'med-mng',
  redirectPath: '/sso/callback',
};

/**
 * Check if user has an active session
 */
function hasActiveSession(): boolean {
  try {
    const session = localStorage.getItem('supabase.auth.token');
    return !!session;
  } catch (error) {
    logger.error('Failed to check session:', error);
    return false;
  }
}

/**
 * Check if user has access to EmotionsCare
 */
async function hasEmotionsCareAccess(): Promise<boolean> {
  try {
    // Check if user has the appropriate role/permission
    const userProfile = localStorage.getItem('user-profile');
    if (!userProfile) return false;

    const profile = JSON.parse(userProfile);
    return profile.hasEmotionsCareAccess === true || profile.subscription?.includes('premium');
  } catch (error) {
    logger.error('Failed to check EmotionsCare access:', error);
    return false;
  }
}

/**
 * Generate SSO token for EmotionsCare
 */
async function generateSSOToken(): Promise<string> {
  try {
    // In a real implementation, this would call your backend API
    // to generate a secure SSO token
    const response = await fetch('/api/emotionscare/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate SSO token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    logger.error('Failed to generate SSO token:', error);
    // Fallback: generate a temporary mock token for development
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
    }));
  }
}

/**
 * Redirect to EmotionsCare platform with SSO
 */
export async function redirectToEmotionsCare(): Promise<void> {
  try {
    // Check if user has an active session
    if (!hasActiveSession()) {
      throw new EmotionsCareError(
        'You must be logged in to access EmotionsCare',
        'NO_SESSION'
      );
    }

    // Check if user has access to EmotionsCare
    const hasAccess = await hasEmotionsCareAccess();
    if (!hasAccess) {
      throw new EmotionsCareError(
        'You do not have access to EmotionsCare. Please upgrade your subscription.',
        'NO_ACCESS'
      );
    }

    // Generate SSO token
    const ssoToken = await generateSSOToken();

    // Build redirect URL
    const redirectUrl = new URL(EMOTIONSCARE_CONFIG.baseUrl);
    redirectUrl.searchParams.set('token', ssoToken);
    redirectUrl.searchParams.set('client', EMOTIONSCARE_CONFIG.clientId);
    redirectUrl.searchParams.set('return_url', window.location.origin + EMOTIONSCARE_CONFIG.redirectPath);

    // Perform redirect
    window.location.href = redirectUrl.toString();
  } catch (error) {
    if (error instanceof EmotionsCareError) {
      throw error;
    }

    logger.error('Failed to redirect to EmotionsCare:', error);
    throw new EmotionsCareError(
      'Failed to redirect to EmotionsCare. Please try again later.',
      'REDIRECT_FAILED'
    );
  }
}
