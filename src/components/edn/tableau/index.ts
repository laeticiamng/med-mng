// EDN Tableau Components

// Core Components
export { TableauCompetencesOIC } from './TableauCompetencesOIC';
export { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
export { TableauCompetencesOICWithRealData } from './TableauCompetencesOICWithRealData';
export { CompetenceCardOptimized } from './CompetenceCardOptimized';
export { CompetenceFlashcard } from './CompetenceFlashcard';

// Rang A Components
export { TableauRangA } from './TableauRangA';
export { TableauRangAFooter } from './TableauRangAFooter';
export { TableauRangAGrid } from './TableauRangAGrid';
export { TableauRangAHeader } from './TableauRangAHeader';
export { getColumnIcon } from './TableauRangAIcons';

// Rang B Components
export { TableauRangB } from './TableauRangB';
export { TableauRangBIC4 } from './TableauRangBIC4';

// Configuration & Data
export * from './TableauRangAConfig';
export * from './TableauRangAData';
export * from './TableauRangADataIC1';
export * from './TableauRangADataIC2';
export * from './TableauRangADataIC3Concepts';
export * from './TableauRangADataIC3Config';
export * from './TableauRangADataIC4';
export * from './TableauRangADataIC5';

// Footer Components - UNIFIED (remplace les 11 fichiers individuels)
export { 
  TableauRangAFooterGeneric,
  TableauRangAFooterIC1,
  TableauRangAFooterIC2,
  TableauRangAFooterIC3,
  TableauRangAFooterIC4,
  TableauRangAFooterIC5,
  TableauRangAFooterIC6,
  TableauRangAFooterIC7,
  TableauRangAFooterIC8,
  TableauRangAFooterIC9,
  TableauRangAFooterIC10,
  TableauRangAFooterOIC010
} from './TableauRangAFooterGeneric';

// Footer Config
export * from './config/footerConfig';

// Utils
export * from './TableauRangAUtils';
export * from './TableauRangAUtilsIC1';
export * from './TableauRangAUtilsIC2';
export * from './TableauRangAUtilsIC4';
export * from './TableauRangAUtilsStandard';
