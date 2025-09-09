// Export des composants responsive optimisés
export { TabletOptimizedCard } from './TabletOptimizedCard';
export { TabletOptimizedInput } from './TabletOptimizedInput';
export { MobileOptimizedCard } from './MobileOptimizedCard';
export { MobileOptimizedInput } from './MobileOptimizedInput';
export { ResponsiveGrid, ResponsiveCard, LibraryGrid, TouchTarget } from '../ui/responsive';

// Export du composant unifié pour remplacer les boutons optimisés
export { ResponsiveButton } from '../ui/responsive-button';

// Export des layouts responsive
export { TabletOptimizedLayout } from '../layouts/TabletOptimizedLayout';
export { MobileOptimizedLayout } from '../layouts/MobileOptimizedLayout';

// Export des hooks responsive
export { useBreakpoints, useResponsiveGrid, useResponsiveSpacing } from '../../hooks/useBreakpoints';
export { useWindowSize } from '../../hooks/useWindowSize';
export { useViewport } from './ViewportProvider';