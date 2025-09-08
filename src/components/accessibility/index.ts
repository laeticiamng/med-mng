/**
 * 🌟 ACCESSIBILITY MODULE EXPORTS - MED-MNG v3.0
 * Point d'entrée principal pour tous les composants d'accessibilité
 */

export { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';
export { SkipLinks } from './SkipLinks';
export { FocusTrap } from './FocusTrap';
export { AccessibilityToolbar } from './AccessibilityToolbar';

// Réexporter le type pour commodité
export type { AccessibilityPreferences, AccessibilityFeatures } from './AccessibilityProvider';