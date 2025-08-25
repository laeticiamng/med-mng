// Navigation Schema - Declarative navigation structure
import type { NavNode } from "@/types/nav";

export const NAV_SCHEMA: NavNode[] = [
  {
    id: "home",
    labelKey: "nav.home",
    icon: "Home",
    action: { type: "route", to: "/", prefetch: true },
    description: "Accueil MED-MNG",
    priority: 1
  },
  {
    id: "learn",
    labelKey: "nav.learn",
    icon: "BookOpen",
    description: "Modules d'apprentissage",
    priority: 2,
    children: [
      {
        id: "ecos",
        labelKey: "nav.learn.ecos",
        icon: "Stethoscope",
        action: { type: "route", to: "/ecos", prefetch: true },
        description: "Simulations ECOS interactives"
      },
      {
        id: "edn",
        labelKey: "nav.learn.edn",
        icon: "BookText",
        action: { type: "route", to: "/edn", prefetch: true },
        description: "Items EDN avec contenu immersif"
      },
      {
        id: "chat",
        labelKey: "nav.learn.chat",
        icon: "MessageCircle",
        action: { type: "route", to: "/chat" },
        description: "Assistant IA médical",
        guard: { requiresAuth: true }
      }
    ]
  },
  {
    id: "medmng",
    labelKey: "nav.medmng",
    icon: "Music",
    description: "Plateforme musicale médicale",
    priority: 3,
    children: [
      {
        id: "medmng-dashboard",
        labelKey: "nav.medmng.dashboard",
        icon: "LayoutDashboard",
        action: { type: "route", to: "/med-mng/dashboard" },
        guard: { requiresAuth: true }
      },
      {
        id: "medmng-create",
        labelKey: "nav.medmng.create",
        icon: "Plus",
        action: { type: "route", to: "/med-mng/create" },
        guard: { requiresAuth: true }
      },
      {
        id: "medmng-library",
        labelKey: "nav.medmng.library",
        icon: "Library",
        action: { type: "route", to: "/med-mng/library" },
        guard: { requiresAuth: true }
      },
      {
        id: "medmng-playlists",
        labelKey: "nav.medmng.playlists",
        icon: "ListMusic",
        action: { type: "route", to: "/med-mng/playlists" },
        guard: { requiresAuth: true }
      }
    ]
  },
  {
    id: "audit",
    labelKey: "nav.audit",
    icon: "SearchCheck",
    action: { type: "route", to: "/audit" },
    description: "Audit et qualité des données",
    priority: 4,
    guard: { roles: ["admin"] }
  },
  {
    id: "admin",
    labelKey: "nav.admin",
    icon: "Shield",
    description: "Administration système",
    priority: 5,
    guard: { roles: ["admin"] },
    children: [
      {
        id: "admin-panel",
        labelKey: "nav.admin.panel",
        icon: "Settings",
        action: { type: "route", to: "/admin-panel" }
      },
      {
        id: "admin-import",
        labelKey: "nav.admin.import",
        icon: "Upload",
        action: { type: "route", to: "/admin/import" }
      },
      {
        id: "admin-monitoring",
        labelKey: "nav.admin.monitoring",
        icon: "Activity",
        action: { type: "route", to: "/monitoring" }
      }
    ]
  },
  {
    id: "account",
    labelKey: "nav.account",
    icon: "User",
    description: "Compte utilisateur",
    priority: 6,
    children: [
      {
        id: "profile",
        labelKey: "nav.account.profile",
        icon: "UserCircle",
        action: { type: "route", to: "/med-mng/profile" },
        guard: { requiresAuth: true }
      },
      {
        id: "settings",
        labelKey: "nav.account.settings",
        icon: "Settings",
        action: { type: "modal", id: "user-settings" },
        guard: { requiresAuth: true }
      },
      {
        id: "billing",
        labelKey: "nav.account.billing",
        icon: "CreditCard",
        action: { type: "route", to: "/med-mng/pricing" },
        guard: { requiresAuth: true }
      },
      {
        id: "logout",
        labelKey: "nav.account.logout",
        icon: "LogOut",
        action: { type: "mutation", key: "logout" },
        guard: { requiresAuth: true }
      }
    ]
  },
  {
    id: "auth",
    labelKey: "nav.auth",
    icon: "Key",
    description: "Authentification",
    priority: 7,
    guard: { predicate: () => !Boolean(localStorage.getItem('auth-token')) },
    children: [
      {
        id: "login",
        labelKey: "nav.auth.login",
        icon: "LogIn",
        action: { type: "route", to: "/med-mng/login" }
      },
      {
        id: "signup",
        labelKey: "nav.auth.signup",
        icon: "UserPlus",
        action: { type: "route", to: "/med-mng/signup" }
      }
    ]
  }
];

// Helper functions for navigation schema
export function findNavNode(id: string, nodes: NavNode[] = NAV_SCHEMA): NavNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNavNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

export function flattenNavNodes(nodes: NavNode[] = NAV_SCHEMA): NavNode[] {
  const result: NavNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenNavNodes(node.children));
    }
  }
  return result;
}

export function filterNavNodes(
  nodes: NavNode[],
  context: { isAuthenticated: boolean; userRoles: string[]; featureFlags: Record<string, boolean> }
): NavNode[] {
  return nodes.filter(node => {
    if (!node.guard) return true;
    
    if (node.guard.requiresAuth && !context.isAuthenticated) return false;
    if (node.guard.roles && !node.guard.roles.some(role => context.userRoles.includes(role))) return false;
    if (node.guard.featureFlag && !context.featureFlags[node.guard.featureFlag]) return false;
    if (node.guard.predicate && !node.guard.predicate()) return false;
    
    return true;
  }).map(node => ({
    ...node,
    children: node.children ? filterNavNodes(node.children, context) : undefined
  }));
}