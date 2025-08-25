# 🏠 PAGE DASHBOARD - Spécifications techniques

## 1. But & User Stories

**En tant qu'utilisateur connecté, je peux :**
- Voir mon progression globale (ECOS/EDN terminés, scores moyens)
- Accéder rapidement à mes dernières activités
- Reprendre un cas interrompu
- Découvrir du nouveau contenu recommandé
- Naviguer vers toutes les sections principales

**En tant qu'utilisateur non-connecté, je peux :**
- Comprendre l'offre de la plateforme
- M'inscrire ou me connecter
- Accéder au contenu public (démo ECOS/EDN)

## 2. Données & Accès

### Sources de données
```typescript
// Tables Supabase
- profiles (user_id, display_name, avatar_url, subscription_type)
- user_progress (user_id, total_ecos, total_edn, avg_score)
- recent_activities (user_id, activity_type, item_id, updated_at)
- recommendations (user_id, content_type, item_id, reason)

// RPC Functions
- get_user_dashboard_data(user_id) → { progress, activities, recommendations }
- get_featured_content() → { featured_ecos, featured_edn }
```

### Stratégie de cache React Query
```typescript
const QUERY_KEYS = {
  dashboard: (userId: string) => ['dashboard', userId],
  featured: () => ['featured-content']
}

// Cache config
staleTime: 5 * 60 * 1000, // 5 min pour dashboard data
gcTime: 10 * 60 * 1000    // 10 min garbage collection
```

## 3. États UI obligatoires

### Loading States
- Skeleton pour widgets de progression
- Skeleton pour listes d'activités
- Skeleton pour recommendations

### Empty States
- Nouveau compte : CTA "Commencer votre premier ECOS"
- Aucune activité récente : CTA "Explorer la bibliothèque"
- Pas de recommandations : Contenu populaire par défaut

### Error States
- Erreur réseau : Retry + contenu en cache si disponible
- Session expirée : Redirect vers /auth
- Erreur serveur : Message + support contact

### Responsive
- Mobile : Stack vertical, navigation bottom
- Tablet : Grid 2 colonnes
- Desktop : Grid 3 colonnes + sidebar

## 4. Actions & Effets

### Actions primaires
```typescript
type DashboardAction = 
  | { type: "resume_case", caseId: string }
  | { type: "start_new_ecos" }
  | { type: "start_new_edn" }
  | { type: "view_progress" }
  | { type: "explore_library" }

// Mutations
const resumeCase = useMutation({
  mutationFn: (caseId: string) => 
    supabase.rpc('resume_user_case', { p_case_id: caseId }),
  onSuccess: (data) => {
    navigate(`/${data.type.toLowerCase()}/${data.id}`)
    track('case_resumed', { caseId, caseType: data.type })
  }
})
```

### Invalidations ciblées
- Après completion d'un cas : invalider `dashboard` et `recent_activities`
- Après changement de profil : invalider `dashboard`

### Toasts
- "Cas repris avec succès"
- "Erreur lors de la reprise du cas"

## 5. Observabilité

### Analytics events
```typescript
// Page view
track('dashboard_viewed', {
  user_id: user.id,
  subscription_type: user.subscription_type,
  session_id: sessionId
})

// Interactions
track('dashboard_action', {
  action_type: 'resume_case' | 'start_new' | 'explore',
  target_id?: string,
  position?: number // pour recommendations
})

// Performance
track('dashboard_performance', {
  load_time_ms: loadTime,
  cache_hit: boolean,
  widgets_count: widgetsRendered
})
```

### Error tracking (Sentry)
- Erreurs de fetch avec breadcrumbs
- Erreurs de navigation
- Timeouts de queries

## 6. Tests

### Tests unitaires
```typescript
// components/Dashboard.test.tsx
describe('Dashboard', () => {
  it('shows loading skeleton while fetching data')
  it('displays user progress when loaded')
  it('shows empty state for new users')
  it('handles resume case action')
})
```

### Tests d'intégration
```typescript
// features/dashboard/dashboard.integration.test.tsx
describe('Dashboard Integration', () => {
  it('fetches and displays user data correctly')
  it('invalidates cache after case completion')
  it('handles authentication errors')
})
```

### Tests E2E
```typescript
// e2e/dashboard.spec.ts
test('user can resume interrupted case from dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="resume-case-123"]')
  await expect(page).toHaveURL('/ecos/123')
})
```

## 7. Contrats API

### GET /rpc/get_user_dashboard_data
```sql
create or replace function get_user_dashboard_data(p_user_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'progress', jsonb_build_object(
      'total_ecos', coalesce(up.total_ecos, 0),
      'total_edn', coalesce(up.total_edn, 0),
      'avg_score', coalesce(up.avg_score, 0)
    ),
    'recent_activities', (
      select jsonb_agg(jsonb_build_object(
        'id', ra.id,
        'type', ra.activity_type,
        'item_id', ra.item_id,
        'title', ra.title,
        'updated_at', ra.updated_at
      ) order by ra.updated_at desc)
      from recent_activities ra
      where ra.user_id = p_user_id
      limit 5
    ),
    'interrupted_cases', (
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'type', c.type,
        'title', c.title,
        'progress', c.progress,
        'updated_at', c.updated_at
      ))
      from cases c
      where c.user_id = p_user_id 
        and c.status = 'in_progress'
    )
  ) into result
  from user_progress up
  where up.user_id = p_user_id;
  
  return coalesce(result, '{}'::jsonb);
end;
$$ language plpgsql security definer;
```

## 8. Définition de Fini

✅ **Dashboard est "Done" quand :**
- [ ] Tous les widgets (progression, activités, recommandations) s'affichent correctement
- [ ] Loading/Empty/Error states implémentés et testés
- [ ] Actions (reprendre cas, nouveau cas) fonctionnelles avec toasts
- [ ] Analytics events correctement envoyés
- [ ] Tests unitaires + intégration + E2E passent
- [ ] Performance : LCP < 2.5s, bundle impact < 20KB
- [ ] Accessibilité : navigation clavier, aria-labels, contraste
- [ ] i18n : toutes les strings externalisées
- [ ] Responsive : mobile/tablet/desktop
- [ ] RLS testée : utilisateur A ne voit pas les données de B