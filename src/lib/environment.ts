/**
 * Utilitaires pour la détection d'environnement
 */

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export const isNode = (): boolean => {
  return typeof process !== 'undefined' && !!process.versions?.node;
};

export const isSSR = (): boolean => {
  return !isBrowser() && isNode();
};

export const safeWindowAccess = <T>(callback: () => T, fallback: T): T => {
  if (isBrowser()) {
    try {
      return callback();
    } catch (error) {
      console.warn('Erreur lors de l\'accès à window:', error);
      return fallback;
    }
  }
  return fallback;
};

export const safeNavigatorAccess = <T>(callback: () => T, fallback: T): T => {
  if (isBrowser() && navigator) {
    try {
      return callback();
    } catch (error) {
      console.warn('Erreur lors de l\'accès à navigator:', error);
      return fallback;
    }
  }
  return fallback;
};