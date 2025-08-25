// Navigation Types - Core schema for unified navigation system
export type NavAction =
  | { type: "route"; to: string; prefetch?: boolean }
  | { type: "modal"; id: string; payload?: Record<string, unknown> }
  | { type: "mutation"; key: string; input?: Record<string, unknown>; optimistic?: boolean }
  | { type: "external"; href: string; newTab?: boolean }
  | { type: "compose"; steps: NavAction[] };

export type Guard = {
  requiresAuth?: boolean;
  roles?: string[];
  featureFlag?: string;
  predicate?: () => boolean;
};

export type NavNode = {
  id: string;
  labelKey: string; // i18n key
  icon?: string;
  action?: NavAction;
  children?: NavNode[];
  guard?: Guard;
  description?: string;
  badge?: string;
  priority?: number; // for sorting
};

export type NavigationContext = {
  isAuthenticated: boolean;
  userRoles: string[];
  featureFlags: Record<string, boolean>;
};

export type ActionResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};