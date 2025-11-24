import logger from '@/lib/logger';

/**
 * Key for storing remember me preference in localStorage
 */
const REMEMBER_ME_KEY = 'med-mng-remember-me';

/**
 * Set the remember me preference
 * @param enabled - Whether to remember the user
 */
export function setRememberMe(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    logger.error('Failed to set remember me preference:', error);
  }
}

/**
 * Check if remember me is enabled
 * @returns true if remember me is enabled, false otherwise
 */
export function isRememberMeEnabled(): boolean {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch (error) {
    logger.error('Failed to get remember me preference:', error);
    return false;
  }
}
