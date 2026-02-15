// Config Central Index

// Environment configuration
export {
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  ENABLE_DEBUG,
  ENABLE_VERBOSE_LOGGING,
} from './env';

// Routes configuration
export {
  ROUTE_PATHS,
  ROUTE_REDIRECTS,
  ROUTE_LIST,
  ALL_KNOWN_ROUTES,
} from './routes';

// Navigation configuration
export type {
  NavItem,
  NavGroup,
} from './navigation';
export {
  MAIN_NAV_ITEMS,
  SECONDARY_NAV_GROUPS,
  SECONDARY_NAV_ITEMS,
  USER_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  PUBLIC_PAGES,
  LEGAL_PAGES,
  ALL_ACCESSIBLE_PAGES,
} from './navigation';

// Test mode configuration
export { TEST_MODE_ENABLED, TEST_USER, isTestMode } from './testMode';
