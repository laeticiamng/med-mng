# 🧭 NAV SCHEMA - Navigation déclarative centralisée

## 1. Principe & Architecture

### Schema centralisé comme source de vérité
```typescript
// types/nav.ts - Types de base pour la navigation
export type NavAction =
  | { type: "route"; to: string; prefetch?: boolean }
  | { type: "modal"; id: string; payload?: Record<string, unknown> }
  | { type: "mutation"; key: string; input?: Record<string, unknown>; optimistic?: boolean }
  | { type: "external"; href: string; newTab?: boolean }
  | { type: "featureFlag"; flag: string; fallbackAction?: NavAction }
  | { type: "compose"; steps: NavAction[] }

export type Guard = {
  requiresAuth?: boolean
  roles?: string[]
  featureFlag?: string
  subscription?: ('freemium' | 'premium')[]
  predicate?: () => boolean | Promise<boolean>
}

export type NavNode = {
  id: string
  labelKey: string // i18n key
  icon?: string
  badge?: string | (() => string) // notifications count, "NEW", etc.
  action?: NavAction
  children?: NavNode[]
  guard?: Guard
  metadata?: {
    category?: 'primary' | 'secondary' | 'utility'
    shortcut?: string // keyboard shortcut
    tooltip?: string // i18n key for tooltip
    tracking?: string // analytics event name
  }
}
```

### Navigation Schema complet MED-MNG
```typescript
// lib/nav-schema.ts
import { NAV_SCHEMA_VERSION } from './constants'

export const NAV_SCHEMA: NavNode[] = [
  // Section principale - apprentissage
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    icon: "Home",
    action: { type: "route", to: "/", prefetch: true },
    metadata: { 
      category: "primary", 
      shortcut: "ctrl+h",
      tracking: "nav_dashboard_clicked"
    }
  },
  
  {
    id: "learn",
    labelKey: "nav.learn.root",
    icon: "GraduationCap",
    metadata: { category: "primary" },
    children: [
      {
        id: "ecos",
        labelKey: "nav.learn.ecos",
        icon: "Stethoscope",
        action: { type: "route", to: "/ecos", prefetch: true },
        badge: () => getNewEcosCount(), // Dynamic badge
        metadata: { 
          tooltip: "nav.learn.ecos.tooltip",
          tracking: "nav_ecos_clicked"
        }
      },
      {
        id: "edn",
        labelKey: "nav.learn.edn", 
        icon: "BookOpen",
        action: { type: "route", to: "/edn" },
        metadata: {
          tooltip: "nav.learn.edn.tooltip",
          tracking: "nav_edn_clicked"
        }
      },
      {
        id: "immersive_mode",
        labelKey: "nav.learn.immersive",
        icon: "Glasses",
        action: { type: "route", to: "/immersive" },
        guard: { 
          subscription: ["premium"],
          featureFlag: "immersive_mode_enabled"
        },
        metadata: {
          badge: "PREMIUM",
          tracking: "nav_immersive_clicked"
        }
      }
    ]
  },
  
  // Section bibliothèque & historique
  {
    id: "library",
    labelKey: "nav.library.root",
    icon: "Library",
    metadata: { category: "primary" },
    children: [
      {
        id: "favorites",
        labelKey: "nav.library.favorites",
        icon: "Heart",
        action: { type: "route", to: "/favorites" },
        guard: { requiresAuth: true },
        badge: () => getFavoritesCount(),
        metadata: { tracking: "nav_favorites_clicked" }
      },
      {
        id: "history",
        labelKey: "nav.library.history",
        icon: "Clock",
        action: { type: "route", to: "/history" },
        guard: { requiresAuth: true },
        metadata: { tracking: "nav_history_clicked" }
      },
      {
        id: "progress",
        labelKey: "nav.library.progress",
        icon: "TrendingUp",
        action: { type: "route", to: "/progress" },
        guard: { requiresAuth: true },
        metadata: { tracking: "nav_progress_clicked" }
      }
    ]
  },
  
  // Section création de contenu (admin/premium)
  {
    id: "create",
    labelKey: "nav.create.root",
    icon: "Plus",
    guard: { 
      roles: ["admin", "content_creator"],
      subscription: ["premium"]
    },
    metadata: { category: "secondary" },
    children: [
      {
        id: "create_ecos",
        labelKey: "nav.create.ecos",
        icon: "FilePlus",
        action: { type: "modal", id: "create-ecos-modal" },
        metadata: { tracking: "nav_create_ecos_clicked" }
      },
      {
        id: "create_edn",
        labelKey: "nav.create.edn",
        icon: "FileText",
        action: { type: "modal", id: "create-edn-modal" },
        metadata: { tracking: "nav_create_edn_clicked" }
      },
      {
        id: "ai_assistant",
        labelKey: "nav.create.ai_assistant",
        icon: "Bot",
        action: { type: "route", to: "/ai-assistant" },
        guard: { featureFlag: "ai_content_creation" },
        metadata: { 
          badge: "BETA",
          tracking: "nav_ai_assistant_clicked"
        }
      }
    ]
  },
  
  // Section compte utilisateur
  {
    id: "account",
    labelKey: "nav.account.root",
    icon: "User",
    guard: { requiresAuth: true },
    metadata: { category: "utility" },
    children: [
      {
        id: "profile",
        labelKey: "nav.account.profile",
        icon: "Settings",
        action: { type: "route", to: "/account" },
        metadata: { tracking: "nav_profile_clicked" }
      },
      {
        id: "subscription",
        labelKey: "nav.account.subscription",
        icon: "CreditCard",
        action: { type: "route", to: "/account/subscription" },
        badge: () => getSubscriptionBadge(), // "TRIAL", "EXPIRES", etc.
        metadata: { tracking: "nav_subscription_clicked" }
      },
      {
        id: "preferences",
        labelKey: "nav.account.preferences",
        icon: "Sliders",
        action: { type: "route", to: "/account/preferences" },
        metadata: { 
          shortcut: "ctrl+,",
          tracking: "nav_preferences_clicked"
        }
      }
    ]
  },
  
  // Actions rapides (toujours visibles)
  {
    id: "quick_actions",
    labelKey: "nav.quick_actions.root",
    icon: "Zap",
    metadata: { category: "utility" },
    children: [
      {
        id: "search",
        labelKey: "nav.quick_actions.search",
        icon: "Search",
        action: { type: "modal", id: "global-search-modal" },
        metadata: { 
          shortcut: "ctrl+k",
          tracking: "nav_search_opened"
        }
      },
      {
        id: "notifications",
        labelKey: "nav.quick_actions.notifications",
        icon: "Bell",
        action: { type: "modal", id: "notifications-modal" },
        guard: { requiresAuth: true },
        badge: () => getUnreadNotificationsCount(),
        metadata: { tracking: "nav_notifications_opened" }
      },
      {
        id: "help",
        labelKey: "nav.quick_actions.help",
        icon: "HelpCircle",
        action: { type: "external", href: "https://help.med-mng.com", newTab: true },
        metadata: { 
          shortcut: "ctrl+?",
          tracking: "nav_help_clicked"
        }
      }
    ]
  },
  
  // Actions d'authentification (conditionelles)
  {
    id: "auth_actions",
    labelKey: "nav.auth.root",
    metadata: { category: "utility" },
    children: [
      {
        id: "sign_in",
        labelKey: "nav.auth.sign_in",
        icon: "LogIn",
        action: { type: "route", to: "/auth" },
        guard: { 
          predicate: () => !isAuthenticated() // Seulement si non connecté
        },
        metadata: { tracking: "nav_signin_clicked" }
      },
      {
        id: "sign_up",
        labelKey: "nav.auth.sign_up", 
        icon: "UserPlus",
        action: { type: "route", to: "/auth?mode=signup" },
        guard: { 
          predicate: () => !isAuthenticated()
        },
        metadata: { 
          badge: "GRATUIT",
          tracking: "nav_signup_clicked"
        }
      },
      {
        id: "sign_out",
        labelKey: "nav.auth.sign_out",
        icon: "LogOut",
        action: { 
          type: "compose", 
          steps: [
            { type: "mutation", key: "signOut" },
            { type: "route", to: "/" }
          ]
        },
        guard: { requiresAuth: true },
        metadata: { tracking: "nav_signout_clicked" }
      }
    ]
  }
]

// Métadonnées du schema pour validation et cache
export const SCHEMA_METADATA = {
  version: NAV_SCHEMA_VERSION,
  lastUpdated: new Date().toISOString(),
  totalNodes: countNodes(NAV_SCHEMA),
  guardedNodes: countGuardedNodes(NAV_SCHEMA)
}
```

## 2. Hook d'action unifiée

### useNavAction - Le cœur du système
```typescript
// hooks/useNavAction.ts
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useModal } from "@/state/modals"
import { useAuth } from "@/hooks/useAuth"
import { useFeatureFlags } from "@/hooks/useFeatureFlags"

export function useNavAction() {
  const navigate = useNavigate()
  const modal = useModal()
  const { user, signOut } = useAuth()
  const { isEnabled } = useFeatureFlags()
  
  // Mutation client pour actions backend
  const mutationClient = useMutation({
    mutationFn: async ({ key, input, optimistic }) => {
      switch (key) {
        case 'signOut':
          return await signOut()
        case 'markFavorite':
          return await markItemFavorite(input.itemId)
        case 'startEcos':
          return await startEcosCase(input.caseId)
        // ... autres mutations
        default:
          throw new Error(`Unknown mutation: ${key}`)
      }
    },
    onSuccess: (data, variables) => {
      track('nav_mutation_success', { 
        mutation_key: variables.key,
        optimistic: variables.optimistic 
      })
    }
  })
  
  const executeAction = async (action: NavAction, context?: any) => {
    if (!action) {
      console.warn('No action provided to executeAction')
      return
    }
    
    try {
      switch (action.type) {
        case "route":
          // Prefetch si configuré
          if (action.prefetch) {
            // Précharger la route (React Router + React Query)
            await prefetchRoute(action.to)
          }
          navigate(action.to)
          break
          
        case "modal":
          modal.open(action.id, action.payload)
          break
          
        case "mutation":
          await mutationClient.mutateAsync({
            key: action.key,
            input: action.input,
            optimistic: action.optimistic
          })
          break
          
        case "external":
          const target = action.newTab ? '_blank' : '_self'
          window.open(action.href, target)
          break
          
        case "featureFlag":
          if (isEnabled(action.flag)) {
            // Feature disponible, continuer
            if (action.fallbackAction) {
              await executeAction(action.fallbackAction, context)
            }
          } else {
            // Feature non disponible, fallback
            modal.open('feature-not-available', { 
              featureName: action.flag,
              context 
            })
          }
          break
          
        case "compose":
          // Exécuter actions en séquence
          for (const step of action.steps) {
            await executeAction(step, context)
          }
          break
          
        default:
          console.warn(`Unknown action type: ${(action as any).type}`)
      }
      
      // Analytics pour toutes les actions
      track('nav_action_executed', {
        action_type: action.type,
        context: context?.source || 'unknown'
      })
      
    } catch (error) {
      console.error('Action execution failed:', error)
      toast.error(`Action failed: ${error.message}`)
      
      // Error tracking
      Sentry.captureException(error, {
        tags: { nav_action: action.type },
        extra: { action, context }
      })
    }
  }
  
  return { executeAction, isExecuting: mutationClient.isPending }
}
```

### Guard validation et fallbacks
```typescript
// hooks/useNavGuards.ts
export function useNavGuards() {
  const { user, isAuthenticated } = useAuth()
  const { subscription } = useSubscription()
  const { isEnabled } = useFeatureFlags()
  
  const checkGuard = async (guard?: Guard): Promise<GuardResult> => {
    if (!guard) return { canAccess: true }
    
    // Auth requirement
    if (guard.requiresAuth && !isAuthenticated()) {
      return {
        canAccess: false,
        reason: 'authentication_required',
        fallbackAction: { type: 'route', to: '/auth' }
      }
    }
    
    // Role requirement  
    if (guard.roles && !guard.roles.some(role => user?.roles?.includes(role))) {
      return {
        canAccess: false,
        reason: 'insufficient_role',
        fallbackAction: { type: 'modal', id: 'upgrade-role-modal' }
      }
    }
    
    // Subscription requirement
    if (guard.subscription && !guard.subscription.includes(subscription?.plan_type)) {
      return {
        canAccess: false,
        reason: 'subscription_required',
        fallbackAction: { type: 'route', to: '/account/subscription' }
      }
    }
    
    // Feature flag requirement
    if (guard.featureFlag && !isEnabled(guard.featureFlag)) {
      return {
        canAccess: false,
        reason: 'feature_disabled',
        fallbackAction: { type: 'modal', id: 'feature-coming-soon' }
      }
    }
    
    // Custom predicate
    if (guard.predicate) {
      const predicateResult = await guard.predicate()
      if (!predicateResult) {
        return {
          canAccess: false,
          reason: 'predicate_failed',
          fallbackAction: { type: 'modal', id: 'action-unavailable' }
        }
      }
    }
    
    return { canAccess: true }
  }
  
  return { checkGuard }
}

type GuardResult = {
  canAccess: boolean
  reason?: string
  fallbackAction?: NavAction
  message?: string
}
```

## 3. Composants Navigation

### NavButton - Bouton "jamais mort"
```typescript
// components/nav/NavButton.tsx
interface NavButtonProps {
  node: NavNode
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showBadge?: boolean
}

export const NavButton = ({ 
  node, 
  className, 
  variant = 'ghost',
  size = 'md',
  showLabel = true,
  showBadge = true
}) => {
  const { executeAction, isExecuting } = useNavAction()
  const { checkGuard } = useNavGuards()
  const { t } = useTranslation()
  
  const [guardResult, setGuardResult] = useState<GuardResult>({ canAccess: true })
  const [badge, setBadge] = useState<string | null>(null)
  
  // Check guard on mount and when dependencies change
  useEffect(() => {
    checkGuard(node.guard).then(setGuardResult)
  }, [node.guard, checkGuard])
  
  // Update badge dynamically
  useEffect(() => {
    if (showBadge && node.badge) {
      const badgeValue = typeof node.badge === 'function' ? node.badge() : node.badge
      setBadge(badgeValue)
    }
  }, [node.badge, showBadge])
  
  const handleClick = async () => {
    // Track click attempt
    if (node.metadata?.tracking) {
      track(node.metadata.tracking, { 
        node_id: node.id,
        guard_result: guardResult.canAccess ? 'allowed' : 'blocked'
      })
    }
    
    if (!guardResult.canAccess) {
      // Exécuter l'action de fallback
      if (guardResult.fallbackAction) {
        await executeAction(guardResult.fallbackAction, { 
          source: 'guard_fallback',
          originalNode: node.id 
        })
      } else {
        // Message générique si pas de fallback
        toast.warning(guardResult.message || 'Action non disponible pour le moment')
      }
      return
    }
    
    // Exécuter l'action normale
    if (node.action) {
      await executeAction(node.action, { 
        source: 'nav_button',
        node_id: node.id 
      })
    } else if (node.children?.length) {
      // Si pas d'action mais des enfants, ouvrir submenu
      // Implementation dépend du composant parent (dropdown, sidebar, etc.)
    } else {
      // Ni action ni enfants - ne devrait pas arriver avec validation
      console.warn(`NavButton ${node.id} has no action and no children`)
      toast.info('Fonctionnalité bientôt disponible')
    }
  }
  
  const Icon = node.icon ? Icons[node.icon] : null
  const isDisabled = isExecuting || (!guardResult.canAccess && !guardResult.fallbackAction)
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(className, !guardResult.canAccess && "opacity-75")}
          onClick={handleClick}
          disabled={isDisabled}
          data-testid={`nav-${node.id}`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {showLabel && <span>{t(node.labelKey)}</span>}
            {badge && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {badge}
              </Badge>
            )}
            {isExecuting && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </Button>
      </TooltipTrigger>
      
      <TooltipContent>
        {!guardResult.canAccess ? (
          <div>
            <p className="font-medium">Action indisponible</p>
            <p className="text-xs text-muted-foreground">
              {getGuardMessage(guardResult.reason)}
            </p>
            {guardResult.fallbackAction && (
              <p className="text-xs text-primary">Cliquez pour {getFallbackMessage(guardResult.fallbackAction)}</p>
            )}
          </div>
        ) : (
          node.metadata?.tooltip && t(node.metadata.tooltip)
        )}
      </TooltipContent>
    </Tooltip>
  )
}
```

### NavTree - Navigation hiérarchique
```typescript
// components/nav/NavTree.tsx
interface NavTreeProps {
  nodes: NavNode[]
  level?: number
  expanded?: Set<string>
  onToggle?: (nodeId: string) => void
}

export const NavTree = ({ nodes, level = 0, expanded = new Set(), onToggle }) => {
  return (
    <ul className={cn("space-y-1", level > 0 && "ml-4 border-l pl-4")}>
      {nodes.map((node) => (
        <NavTreeNode
          key={node.id}
          node={node}
          level={level}
          isExpanded={expanded.has(node.id)}
          onToggle={onToggle}
        />
      ))}
    </ul>
  )
}

const NavTreeNode = ({ node, level, isExpanded, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0
  
  return (
    <li>
      <div className="flex items-center gap-2">
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle?.(node.id)}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className={cn(
              "h-3 w-3 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </Button>
        )}
        
        <NavButton
          node={node}
          variant="ghost"
          size="sm"
          className="flex-1 justify-start"
        />
      </div>
      
      {hasChildren && isExpanded && (
        <NavTree
          nodes={node.children}
          level={level + 1}
          expanded={expanded}
          onToggle={onToggle}
        />
      )}
    </li>
  )
}
```

## 4. Script de validation CI

### validateNav.ts - Zero boutons morts garantis
```typescript
// scripts/validateNav.ts
import { NAV_SCHEMA } from '../src/lib/nav-schema'
import type { NavNode, NavAction } from '../src/types/nav'

interface ValidationError {
  nodeId: string
  path: string
  error: string
  severity: 'error' | 'warning'
}

class NavValidator {
  private errors: ValidationError[] = []
  
  validate(): ValidationResult {
    this.errors = []
    this.validateNodes(NAV_SCHEMA, [])
    
    return {
      isValid: this.errors.filter(e => e.severity === 'error').length === 0,
      errors: this.errors,
      totalNodes: this.countNodes(NAV_SCHEMA),
      validNodes: this.countValidNodes(NAV_SCHEMA),
      report: this.generateReport()
    }
  }
  
  private validateNodes(nodes: NavNode[], path: string[]) {
    for (const node of nodes) {
      this.validateNode(node, [...path, node.id])
      
      if (node.children) {
        this.validateNodes(node.children, [...path, node.id])
      }
    }
  }
  
  private validateNode(node: NavNode, path: string[]) {
    const pathString = path.join(' > ')
    
    // Rule 1: Node must have either action or children
    if (!node.action && (!node.children || node.children.length === 0)) {
      this.errors.push({
        nodeId: node.id,
        path: pathString,
        error: 'Node has no action and no children - will be unclickable',
        severity: 'error'
      })
    }
    
    // Rule 2: i18n key must exist
    if (!node.labelKey) {
      this.errors.push({
        nodeId: node.id,
        path: pathString,
        error: 'Missing labelKey for i18n',
        severity: 'error'
      })
    }
    
    // Rule 3: Action validation
    if (node.action) {
      this.validateAction(node.action, node.id, pathString)
    }
    
    // Rule 4: Guard validation
    if (node.guard) {
      this.validateGuard(node.guard, node.id, pathString)
    }
    
    // Rule 5: Icon validation
    if (node.icon && !this.isValidIcon(node.icon)) {
      this.errors.push({
        nodeId: node.id,
        path: pathString,
        error: `Invalid icon: ${node.icon}`,
        severity: 'warning'
      })
    }
    
    // Rule 6: Badge function validation
    if (node.badge && typeof node.badge === 'function') {
      try {
        node.badge() // Test if function throws
      } catch (error) {
        this.errors.push({
          nodeId: node.id,
          path: pathString,
          error: `Badge function throws error: ${error.message}`,
          severity: 'warning'
        })
      }
    }
  }
  
  private validateAction(action: NavAction, nodeId: string, path: string) {
    switch (action.type) {
      case 'route':
        if (!action.to || !action.to.startsWith('/')) {
          this.errors.push({
            nodeId,
            path,
            error: `Invalid route: ${action.to}`,
            severity: 'error'
          })
        }
        break
        
      case 'modal':
        if (!action.id) {
          this.errors.push({
            nodeId,
            path,
            error: 'Modal action missing id',
            severity: 'error'
          })
        }
        break
        
      case 'mutation':
        if (!action.key) {
          this.errors.push({
            nodeId,
            path,
            error: 'Mutation action missing key',
            severity: 'error'
          })
        }
        break
        
      case 'external':
        if (!action.href || !this.isValidUrl(action.href)) {
          this.errors.push({
            nodeId,
            path,
            error: `Invalid external URL: ${action.href}`,
            severity: 'error'
          })
        }
        break
        
      case 'compose':
        if (!action.steps || action.steps.length === 0) {
          this.errors.push({
            nodeId,
            path,
            error: 'Compose action has no steps',
            severity: 'error'
          })
        } else {
          // Validate each step
          action.steps.forEach((step, index) => {
            this.validateAction(step, `${nodeId}[${index}]`, `${path} > step${index}`)
          })
        }
        break
    }
  }
  
  private validateGuard(guard: Guard, nodeId: string, path: string) {
    // Check for conflicting guards
    if (guard.requiresAuth === false && guard.roles && guard.roles.length > 0) {
      this.errors.push({
        nodeId,
        path,
        error: 'Guard requires roles but requiresAuth is false',
        severity: 'warning'
      })
    }
    
    // Validate roles exist
    if (guard.roles) {
      const validRoles = ['admin', 'user', 'content_creator', 'moderator']
      const invalidRoles = guard.roles.filter(role => !validRoles.includes(role))
      if (invalidRoles.length > 0) {
        this.errors.push({
          nodeId,
          path,
          error: `Invalid roles: ${invalidRoles.join(', ')}`,
          severity: 'warning'
        })
      }
    }
    
    // Validate subscription types
    if (guard.subscription) {
      const validSubscriptions = ['freemium', 'premium', 'enterprise']
      const invalidSubs = guard.subscription.filter(sub => !validSubscriptions.includes(sub))
      if (invalidSubs.length > 0) {
        this.errors.push({
          nodeId,
          path,
          error: `Invalid subscription types: ${invalidSubs.join(', ')}`,
          severity: 'warning'
        })
      }
    }
  }
  
  private isValidIcon(icon: string): boolean {
    // Validate against available icons (Lucide React)
    const availableIcons = [
      'Home', 'User', 'Settings', 'Bell', 'Search', 'Plus', 
      'Heart', 'BookOpen', 'GraduationCap', 'Stethoscope',
      'Library', 'Clock', 'TrendingUp', 'LogIn', 'LogOut'
      // ... add more as needed
    ]
    return availableIcons.includes(icon)
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  private countNodes(nodes: NavNode[]): number {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? this.countNodes(node.children) : 0)
    }, 0)
  }
  
  private countValidNodes(nodes: NavNode[]): number {
    return nodes.reduce((count, node) => {
      const isValid = (node.action || (node.children && node.children.length > 0))
      const childrenValid = node.children ? this.countValidNodes(node.children) : 0
      return count + (isValid ? 1 : 0) + childrenValid
    }, 0)
  }
  
  private generateReport(): string {
    const errorCount = this.errors.filter(e => e.severity === 'error').length
    const warningCount = this.errors.filter(e => e.severity === 'warning').length
    
    let report = `
🧭 Navigation Schema Validation Report
=====================================

Total nodes: ${this.countNodes(NAV_SCHEMA)}
Valid nodes: ${this.countValidNodes(NAV_SCHEMA)}
Errors: ${errorCount}
Warnings: ${warningCount}

`
    
    if (this.errors.length > 0) {
      report += "Issues found:\n\n"
      
      this.errors.forEach(error => {
        const icon = error.severity === 'error' ? '❌' : '⚠️'
        report += `${icon} ${error.severity.toUpperCase()}: ${error.error}\n`
        report += `   Path: ${error.path}\n`
        report += `   Node: ${error.nodeId}\n\n`
      })
    } else {
      report += "✅ All validation checks passed!\n"
    }
    
    return report
  }
}

// CLI execution
if (require.main === module) {
  const validator = new NavValidator()
  const result = validator.validate()
  
  console.log(result.report)
  
  if (!result.isValid) {
    console.error('❌ Navigation validation failed!')
    process.exit(1)
  } else {
    console.log('✅ Navigation validation passed!')
    process.exit(0)
  }
}

export { NavValidator }

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  totalNodes: number
  validNodes: number
  report: string
}
```

### Package.json scripts
```json
{
  "scripts": {
    "validate:nav": "tsx scripts/validateNav.ts",
    "test:nav": "jest src/**/*.nav.test.ts",
    "build:nav": "npm run validate:nav && npm run test:nav"
  }
}
```

## 5. Tests automatisés

### Tests de validation E2E
```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'
import { NAV_SCHEMA } from '../src/lib/nav-schema'

// Test that validates every clickable element in NAV_SCHEMA
test.describe('Navigation Schema E2E', () => {
  
  test('all nav buttons are clickable and respond appropriately', async ({ page }) => {
    await page.goto('/')
    
    // Extract all nodes with actions from schema
    const clickableNodes = extractClickableNodes(NAV_SCHEMA)
    
    for (const node of clickableNodes) {
      const button = page.locator(`[data-testid="nav-${node.id}"]`)
      
      // Button should exist
      await expect(button).toBeVisible()
      
      // Button should not be completely disabled (may have guard fallback)
      await expect(button).not.toHaveAttribute('disabled', 'true')
      
      // Click should trigger some response
      await button.click()
      
      // Verify action was handled (no unhandled clicks)
      // This depends on your specific implementation
      await page.waitForTimeout(100) // Allow for any immediate UI updates
      
      // If it's a route action, URL should change or navigation should occur
      if (node.action?.type === 'route') {
        // URL should change or we should see loading state
        // Implementation specific to your router
      }
      
      // If it's a modal action, modal should open
      if (node.action?.type === 'modal') {
        await expect(page.locator(`[data-testid="modal-${node.action.id}"]`)).toBeVisible()
        // Close modal for next test
        await page.keyboard.press('Escape')
      }
    }
  })
  
  test('guarded actions show appropriate fallbacks', async ({ page }) => {
    // Test as unauthenticated user
    await page.goto('/')
    
    const guardedNodes = extractGuardedNodes(NAV_SCHEMA)
    
    for (const node of guardedNodes) {
      if (node.guard?.requiresAuth) {
        const button = page.locator(`[data-testid="nav-${node.id}"]`)
        await button.click()
        
        // Should redirect to auth or show auth modal
        const currentUrl = page.url()
        expect(currentUrl.includes('/auth') || 
               await page.locator('[data-testid*="auth"]').isVisible()).toBeTruthy()
      }
    }
  })
  
  test('keyboard shortcuts work correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test Ctrl+K for search
    await page.keyboard.press('Control+k')
    await expect(page.locator('[data-testid="modal-global-search-modal"]')).toBeVisible()
    
    // Test Ctrl+H for home
    await page.keyboard.press('Escape') // Close search
    await page.keyboard.press('Control+h')
    await expect(page.url()).toBe(new URL('/', page.url()).href)
    
    // Test Ctrl+, for preferences
    await page.keyboard.press('Control+Comma')
    // Should navigate to preferences or show auth if not logged in
  })
})

function extractClickableNodes(nodes: NavNode[], acc: NavNode[] = []): NavNode[] {
  for (const node of nodes) {
    if (node.action) {
      acc.push(node)
    }
    if (node.children) {
      extractClickableNodes(node.children, acc)
    }
  }
  return acc
}

function extractGuardedNodes(nodes: NavNode[], acc: NavNode[] = []): NavNode[] {
  for (const node of nodes) {
    if (node.guard) {
      acc.push(node)
    }
    if (node.children) {
      extractGuardedNodes(node.children, acc)
    }
  }
  return acc
}
```

## 6. Définition de Fini

✅ **Nav Schema est "Done" quand :**
- [ ] Schema complet pour toutes les pages MED-MNG
- [ ] Hook useNavAction gère tous les types d'actions
- [ ] Validation des guards avec fallbacks appropriés
- [ ] Script validateNav.ts passe en CI sans erreurs
- [ ] NavButton ne peut jamais être "mort" (toujours une action/fallback)
- [ ] Tests E2E valident chaque élément cliquable
- [ ] Navigation hiérarchique (NavTree) fonctionnelle
- [ ] Badges dynamiques (notifications, "NEW", etc.)
- [ ] Raccourcis clavier intégrés
- [ ] i18n complet pour tous les labels
- [ ] Analytics tracking sur toutes les interactions
- [ ] Performance : actions < 200ms, prefetch intelligent
- [ ] Accessibilité : navigation clavier complète
- [ ] Documentation : README par composant nav