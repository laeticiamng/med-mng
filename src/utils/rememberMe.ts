/**
 * Remember Me Authentication Utility
 *
 * Handles persistent sessions when users check "Remember Me"
 * Addresses audit finding: rememberMe feature disabled
 *
 * How it works:
 * - When "remember me" is checked: Session persists for 30 days
 * - When not checked: Session expires on browser close
 * - Uses localStorage to track preference
 * - Integrates with Supabase Auth session management
 */

const REMEMBER_ME_KEY = 'med-mng-remember-me';
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const DEFAULT_SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

/**
 * Check if "Remember Me" is enabled
 */
export function isRememberMeEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    return stored === 'true';
  } catch (error) {
    console.warn('Failed to read remember me preference:', error);
    return false;
  }
}

/**
 * Set "Remember Me" preference
 */
export function setRememberMe(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    if (enabled) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    console.warn('Failed to store remember me preference:', error);
  }
}

/**
 * Clear "Remember Me" preference (used on logout)
 */
export function clearRememberMe(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
  } catch (error) {
    console.warn('Failed to clear remember me preference:', error);
  }
}

/**
 * Get session duration based on "Remember Me" preference
 */
export function getSessionDuration(): number {
  return isRememberMeEnabled() ? REMEMBER_ME_DURATION : DEFAULT_SESSION_DURATION;
}

/**
 * Get session expiry timestamp
 */
export function getSessionExpiry(): number {
  return Date.now() + (getSessionDuration() * 1000);
}

/**
 * Check if current session should persist
 */
export function shouldPersistSession(): boolean {
  return isRememberMeEnabled();
}

/**
 * Get Supabase session storage type based on remember me
 * - 'local': Persists across browser sessions (remember me = true)
 * - 'session': Clears on browser close (remember me = false)
 */
export function getSessionStorageType(): 'local' | 'session' {
  return isRememberMeEnabled() ? 'local' : 'session';
}
